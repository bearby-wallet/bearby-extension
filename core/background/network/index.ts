import type { NetwrokConfig } from 'types';

import { NETWORK, NETWORK_KEYS } from 'config/network';
import { Fields } from 'config/fields';
import { BrowserStorage, buildObject, StorageKeyValue } from 'lib/storage';
import { assert } from 'lib/assert';
import { FAIL_SYNC, INVALID_CONFIG, INVALID_SELECTED, NetworkError } from './errors';


const [mainnet] = NETWORK_KEYS;

export class NetworkControl {
  public config = NETWORK;
  public selected = mainnet;

  get provider() {
    return this.#getURL(this.selected);
  }

  get version() {
    return this.config[this.selected].VERSION;
  }

  async sync() {
    const data = await BrowserStorage.get(
      Fields.NETWROK_CONFIG,
      Fields.NETWROK_SELECTED
    ) as StorageKeyValue;

    try {
      if (data[Fields.NETWROK_SELECTED]) {
        this.selected = data[Fields.NETWROK_SELECTED];
      }

      if (data[Fields.NETWROK_CONFIG]) {
        this.config = JSON.parse(data[Fields.NETWROK_CONFIG]);
      }

      assert(Boolean(this.provider), FAIL_SYNC, NetworkError);
    } catch {
      await this.reset();
    }
  }

  async reset() {
    this.selected = mainnet;
    this.config = NETWORK;

    await BrowserStorage.set(
      buildObject(Fields.NETWROK_CONFIG, this.config),
      buildObject(Fields.NETWROK_SELECTED, this.selected)
    );
  }

  async changeNetwork(selected: string) {
    const keys = Object.keys(NETWORK);

    assert(keys.includes(selected), INVALID_SELECTED, NetworkError);

    if (selected === this.selected) {
      return {
        selected,
        config: this.config,
        provider: this.provider
      };
    }

    await BrowserStorage.set(
      buildObject(Fields.NETWROK_SELECTED, selected)
    );

    this.selected = selected;

    return {
      selected,
      config: this.config,
      provider: this.provider
    };
  }

  async changeConfig(newConfig: NetwrokConfig) {
    for (const key in newConfig) {
      assert(Boolean(newConfig[key].PROVIDER), INVALID_CONFIG, NetworkError);
      assert(!isNaN(Number(newConfig[key].VERSION)), INVALID_CONFIG, NetworkError);
    }

    await BrowserStorage.set(
      buildObject(Fields.NETWROK_CONFIG, newConfig)
    );
  }

  #getURL(selected: string) {
    return this.config[selected].PROVIDER[0];
  }
}
