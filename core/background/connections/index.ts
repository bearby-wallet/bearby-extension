import type { BadgeControl } from 'background/notifications';
import type { AppConnection } from 'types';

import { assert } from 'lib/assert';
import { Fields } from 'config/fields';
import { BrowserStorage, buildObject, StorageKeyValue } from 'lib/storage';
import { APP_UNIQUE, ConnectionsError } from './errors';


export class AppConnectController {
  readonly #badge: BadgeControl;

  #identities: AppConnection[] = [];
  #confirm?: AppConnection;

  get identities() {
    return this.#identities;
  }

  get confirm() {
    return this.#confirm;
  }

  constructor(badge: BadgeControl) {
    this.#badge = badge;
  }

  isConnected(domain: string) {
    return this.#identities.some((a) => a.domain === domain);
  }

  async addAppFroConfirm(connect: AppConnection) {
    this.#confirm = connect;

    await this.#badge.increase();
    await BrowserStorage.set(
      buildObject(Fields.CONNECT_DAPP, this.#confirm)
    );
  }

  async add(connect: AppConnection) {
    this.#isUnique(connect);

    connect.uuid = undefined;
    this.#identities.push(connect);
    this.#confirm = undefined;

    await this.#badge.decrease();
    await BrowserStorage.set(
      buildObject(Fields.CONNECTIONS_LIST, this.identities)
    );
    await BrowserStorage.rm(Fields.CONNECT_DAPP);
  }

  async rejectConfirm() {
    this.#confirm = undefined;
    await this.#badge.decrease();
    await BrowserStorage.rm(Fields.CONNECT_DAPP);
  }

  async rm(index: number) {
    delete this.#identities[index];

    this.#identities = this.#identities.filter(Boolean);

    await BrowserStorage.set(
      buildObject(Fields.CONNECTIONS_LIST, this.identities)
    );
  }

  async sync() {
    const jsonData = await BrowserStorage.get(
      Fields.CONNECTIONS_LIST,
      Fields.CONNECT_DAPP
    ) as StorageKeyValue;

    try {
      if (jsonData[Fields.CONNECT_DAPP]) {
        this.#confirm = JSON.parse(String(jsonData[Fields.CONNECT_DAPP]));
      }
    } catch (err) {
      await BrowserStorage.rm(Fields.CONNECT_DAPP);
    }

    try {
      if (jsonData[Fields.CONNECTIONS_LIST]) {
        this.#identities = JSON.parse(String(jsonData[Fields.CONNECTIONS_LIST]));
      }
    } catch (err) {
      this.#identities = [];
      await BrowserStorage.set(
        buildObject(Fields.CONNECTIONS_LIST, this.identities)
      );
    }
  }

  #isUnique(connect: AppConnection) {
    for (const iterator of this.identities) {
      assert(
        iterator.domain.toLowerCase() !== connect.domain.toLowerCase(),
        APP_UNIQUE,
        ConnectionsError
      );
    }
  }
}
