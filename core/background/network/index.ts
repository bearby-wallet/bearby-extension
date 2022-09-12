import type { NetwrokConfig } from 'types';

import { NETWORK, NETWORK_KEYS } from 'config/network';
import { Fields } from 'config/fields';
import { BrowserStorage, buildObject, StorageKeyValue } from 'lib/storage';
import { assert } from 'lib/assert';
import { FAIL_SYNC, INVALID_CONFIG, INVALID_NODES_COUNTER, INVALID_SELECTED, NetworkError } from './errors';
import { COUNT_NODES } from 'config/common';


const [mainnet] = NETWORK_KEYS;

export class NetworkControl {
  #config = NETWORK;
  #selected = mainnet;
  #count = COUNT_NODES;

  get config() {
    return this.#config;
  }

  get count() {
    return this.#count;
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
      Fields.NETWROK_CONFIG,
      Fields.NETWROK_SELECTED,
      Fields.NETWROK_NODES_COUNT
    ) as StorageKeyValue;

    try {
      if (data[Fields.NETWROK_SELECTED]) {
        this.#selected = data[Fields.NETWROK_SELECTED];
      }

      if (data[Fields.NETWROK_CONFIG]) {
        this.#config = JSON.parse(data[Fields.NETWROK_CONFIG]);
      }

      if (data[Fields.NETWROK_NODES_COUNT]) {
        const count = Number(data[Fields.NETWROK_NODES_COUNT]);

        if (!isNaN(count)) {
          this.#count = count;
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
    this.#count = COUNT_NODES;

    await BrowserStorage.set(
      buildObject(Fields.NETWROK_CONFIG, this.config),
      buildObject(Fields.NETWROK_SELECTED, this.selected),
      buildObject(Fields.NETWROK_NODES_COUNT, String(this.#count))
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
      buildObject(Fields.NETWROK_SELECTED, selected)
    );

    this.#selected = selected;
  }

  async setConfig(newConfig: NetwrokConfig) {
    for (const key in newConfig) {
      assert(Boolean(newConfig[key].PROVIDERS), INVALID_CONFIG, NetworkError);
      assert(!isNaN(Number(newConfig[key].VERSION)), INVALID_CONFIG, NetworkError);
    }

    this.#config = newConfig;

    await BrowserStorage.set(
      buildObject(Fields.NETWROK_CONFIG, this.config)
    );
  }

  async setNodesCount(newCount: number) {
    assert(newCount > 0 && newCount < 255, INVALID_NODES_COUNTER, NetworkError);

    this.#count = newCount;

    await BrowserStorage.set(
      buildObject(Fields.NETWROK_NODES_COUNT, String(this.#count))
    );
  }

  async downgradeNodeStatus(node: string) {
    if (this.count === 1) return;

    const chunk = this.providers.sort((a, b) => {
      if (a === node) return 1;
      if (b === node) return -1;
      return 0;
    });
    const lastChunk = this.config[this.selected].PROVIDERS.slice(this.count);
 
    this.#config[this.selected].PROVIDERS = [
      ...chunk,
      ...lastChunk
    ];

    await BrowserStorage.set(
      buildObject(Fields.NETWROK_CONFIG, this.config)
    );
  }

  #getURL(selected: string) {
    return this.config[selected].PROVIDERS.slice(0, this.count);
  }
}
