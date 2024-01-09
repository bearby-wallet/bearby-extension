import type { NetworkConfig } from 'types';

import { NETWORK, NETWORK_KEYS } from 'config/network';
import { Fields } from 'config/fields';
import { BrowserStorage, buildObject, StorageKeyValue } from 'lib/storage';
import { assert } from 'lib/assert';
import { FAIL_SYNC, INVALID_CONFIG, INVALID_SELECTED, NetworkError, ONLY_CUSTOM, UNIQUE_PROVIDER } from './errors';
import { TypeOf } from 'lib/type';


const [mainnet,,custom] = NETWORK_KEYS;

export class NetworkControl {
  #config = NETWORK;
  #selected = mainnet;

  get config() {
    return this.#config;
  }

  get selected() {
    return this.#selected;
  }

  get providers() {
    return this.#getURL(this.selected);
  }

  get version() {
    return this.config[this.selected].VERSION;
  }

  get state() {
    return {
      selected: this.selected,
      config: this.config
    };
  }

  async sync() {
    const data = await BrowserStorage.get(
      Fields.NETWORK_CONFIG,
      Fields.NETWORK_SELECTED
    ) as StorageKeyValue;

    try {
      if (data[Fields.NETWORK_SELECTED]) {
        this.#selected = data[Fields.NETWORK_SELECTED];
      }

      if (data[Fields.NETWORK_CONFIG]) {
        const config = JSON.parse(data[Fields.NETWORK_CONFIG]);

        if (!TypeOf.isNumber(config[mainnet].CHAIN_ID)) {
          // reset
          throw new Error();
        }

        if (Object.keys(config).length < NETWORK_KEYS.length) {
          this.#config = NETWORK;
        } else {
          this.#config = config;
        }
      }

      assert(Boolean(this.providers && this.providers.length > 0), FAIL_SYNC, NetworkError);
    } catch {
      await this.reset();
    }
  }

  async reset() {
    this.#selected = mainnet;
    this.#config = NETWORK;

    await BrowserStorage.set(
      buildObject(Fields.NETWORK_CONFIG, this.config),
      buildObject(Fields.NETWORK_SELECTED, this.selected)
    );
  }

  async setNetwork(selected: string) {
    const keys = Object.keys(NETWORK);

    assert(keys.includes(selected), INVALID_SELECTED, NetworkError);

    if (selected === this.selected) {
      return {
        selected,
        config: this.config,
        provider: this.providers
      };
    }

    await BrowserStorage.set(
      buildObject(Fields.NETWORK_SELECTED, selected)
    );

    this.#selected = selected;
  }

  async setConfig(newConfig: NetworkConfig) {
    for (const key in newConfig) {
      assert(Boolean(newConfig[key].PROVIDERS), INVALID_CONFIG, NetworkError);
      assert(!isNaN(Number(newConfig[key].VERSION)), INVALID_CONFIG, NetworkError);
    }

    this.#config = newConfig;

    await BrowserStorage.set(
      buildObject(Fields.NETWORK_CONFIG, this.config)
    );
  }

  async addProvider(node: string) {
    const providers = this.config[this.selected].PROVIDERS;
    const unique = providers.some(
      (n) => n.toLowerCase() === node.toLowerCase()
    );

    assert(!unique, UNIQUE_PROVIDER, NetworkError);

    this.#config[this.selected].PROVIDERS.push(node);

    await BrowserStorage.set(
      buildObject(Fields.NETWORK_CONFIG, this.config)
    );
  }

  async setChainID(newChainID: number) {
    assert(this.selected == custom, ONLY_CUSTOM, NetworkError);

    this.#config[this.selected].CHAIN_ID = newChainID;

    await BrowserStorage.set(
      buildObject(Fields.NETWORK_CONFIG, this.config)
    );
  }

  async sortProvider(node: string) {
    const providers = this.config[this.selected].PROVIDERS;

    this.#config[this.selected].PROVIDERS = providers.sort((a, b) => {
      if (a === node) {
        return -1;
      }

      return 0;
    });

    await BrowserStorage.set(
      buildObject(Fields.NETWORK_CONFIG, this.config)
    );
  }

  async removeProvider(node: string) {
    if (node === NETWORK[this.selected].PROVIDERS[0]) {
      return;
    }

    const providers = this.config[this.selected].PROVIDERS;

    this.#config[this.selected].PROVIDERS = providers.filter(
      (n) => node !== n
    );

    await BrowserStorage.set(
      buildObject(Fields.NETWORK_CONFIG, this.config)
    );
  }

  #getURL(selected: string) {
    return this.config[selected].PROVIDERS;
  }
}
