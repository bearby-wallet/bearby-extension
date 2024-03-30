import type { BadgeControl } from 'background/notifications';
import type { AppConnection } from 'types';

import { assert } from 'lib/assert';
import { Fields } from 'config/fields';
import { BrowserStorage, buildObject, StorageKeyValue } from 'lib/storage';
import { APP_NOT_CONNECTED, APP_UNIQUE, ConnectionsError, INCORRECT_PARAM, QUEUED } from './errors';
import { getManifestVersion } from 'lib/runtime/manifest';
import { ManifestVersions } from 'config/manifest-versions';
import { Runtime } from 'lib/runtime';


export class AppConnectController {
  readonly #badge: BadgeControl;

  #identities: AppConnection[] = [];
  #confirm: AppConnection[] = [];

  get identities() {
    return this.#identities;
  }

  get confirm() {
    return this.#confirm;
  }

  constructor(badge: BadgeControl) {
    this.#badge = badge;
  }

  has(domain: string) {
    return this.#identities.find((a) => a.domain === domain);
  }

  async addAccountApps(indexies: number[], accountIndex: number) {
    for (let index = 0; index < indexies.length; index++) {
      this.#identities[index].accounts.push(accountIndex);
    }

    await BrowserStorage.set(
      buildObject(Fields.CONNECTIONS_LIST, this.identities)
    );
  }

  async checkConnection(domain: string) {
    let checkPopup = false;

    if (getManifestVersion() == ManifestVersions.V3) {
      const { id } = await Runtime.windows.getCurrent();

      checkPopup = String(id) == domain;
    } else if (getManifestVersion() == ManifestVersions.V2) {
      checkPopup = Runtime.runtime.id == domain;
    }

    assert((Boolean(this.has(domain)) || checkPopup), `${APP_NOT_CONNECTED} ${domain}`, ConnectionsError);
  }

  async updateAccounts(index: number, accounts: number[]) {
    assert(Boolean(this.identities[index]), INCORRECT_PARAM + 'index', ConnectionsError);

    this.identities[index].accounts = accounts;

    await BrowserStorage.set(
      buildObject(Fields.CONNECTIONS_LIST, this.identities)
    );
  }

  async addAppFroConfirm(connect: AppConnection) {
    assert(Boolean(connect.domain), INCORRECT_PARAM + 'domain', ConnectionsError);
    assert(Boolean(connect.icon), INCORRECT_PARAM + 'icon', ConnectionsError);
    assert(Boolean(connect.title), INCORRECT_PARAM + 'title', ConnectionsError);
    assert(Boolean(connect.uuid), INCORRECT_PARAM + 'uuid', ConnectionsError);

    const has = this.#confirm.some((a) => a.domain === connect.domain);

    assert(!has, QUEUED, ConnectionsError);

    this.#confirm.push(connect);

    await this.#badge.increase();
    await BrowserStorage.set(
      buildObject(Fields.CONNECT_DAPP, this.#confirm)
    );
  }

  async add(connect: AppConnection) {
    this.#isUnique(connect);

    this.#identities.push({
      ...connect,
      uuid: undefined
    });
    this.#confirm = this.#confirm.filter(
      (a) => a.domain !== connect.domain
    );

    await this.#badge.decrease();
    await BrowserStorage.set(
      buildObject(Fields.CONNECTIONS_LIST, this.identities)
    );
    await BrowserStorage.rm(Fields.CONNECT_DAPP);
  }

  async removeConfirmConnection(index: number) {
    const app = this.confirm[index];

    this.#confirm = this.confirm.filter(
      (a) => a.domain !== app.domain
    );

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
      await BrowserStorage.set(
        buildObject(Fields.CONNECT_DAPP, [])
      );
    }

    try {
      if (jsonData[Fields.CONNECTIONS_LIST]) {
        let data: AppConnection[] = JSON.parse(String(jsonData[Fields.CONNECTIONS_LIST]));

        this.#identities = data.filter((el) => el.accounts && el.domain);
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
