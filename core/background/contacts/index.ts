/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { Contact } from 'types';

import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { assert } from 'lib/assert';
import { UINIQE_NAME, ContactsError, UINIQE_ADDRESS, INVALID_BASE58 } from './errors';
import { isBase58Address } from 'lib/address';


export class ContactController {
  #identities: Contact[] = [];

  get list() {
    return this.#identities;
  }

  #isUnique(connect: Contact) {
    for (const iterator of this.list) {
      assert(
        iterator.name.toLowerCase() !== connect.name.toLowerCase(),
        UINIQE_NAME,
        ContactsError
      );
      assert(
        iterator.address.toLowerCase() !== connect.address.toLowerCase(),
        UINIQE_ADDRESS,
        ContactsError
      );
    }
  }

  async add(connect: Contact) {
    this.#isUnique(connect);

    assert(
      await isBase58Address(connect.address),
      INVALID_BASE58,
      ContactsError
    );

    this.#identities.push(connect);

    await BrowserStorage.set(
      buildObject(Fields.CONTACTS_LIST, this.list)
    );
  }

  async remove(index: number) {
    delete this.#identities[index];

    this.#identities = this.#identities.filter(Boolean);

    await BrowserStorage.set(
      buildObject(Fields.CONTACTS_LIST, this.list)
    );
  }

  async reset() {
    this.#identities = [];

    await BrowserStorage.set(
      buildObject(Fields.CONTACTS_LIST, this.list)
    );
  }

  async sync() {
    const jsonData = await BrowserStorage.get(Fields.CONTACTS_LIST);

    try {
      this.#identities = JSON.parse(String(jsonData));
    } catch {
      await this.reset();
    }
  }
}
