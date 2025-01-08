import type { NetworkSettingsState } from "types/network";

import { Fields } from "config/fields";
import { BrowserStorage, buildObject } from "lib/storage";
import { NETWORK_INIT_STATE } from "config/network";

export class NetworkSettings {
  #downgrade = NETWORK_INIT_STATE.downgrade;
  #https = NETWORK_INIT_STATE.https;
  #abortTimeout = NETWORK_INIT_STATE.abortTimeout;
  #numberOfNodes = NETWORK_INIT_STATE.numberOfNodes;

  get state(): NetworkSettingsState {
    return {
      downgrade: this.#downgrade,
      https: this.#https,
      abortTimeout: this.#abortTimeout,
      numberOfNodes: this.#numberOfNodes,
    };
  }

  async setDowngrade(downgrade: boolean) {
    this.#downgrade = downgrade;

    await BrowserStorage.set(buildObject(Fields.NETWORK_SETTINGS, this.state));
  }

  async setHttps(https: boolean) {
    this.#https = https;

    await BrowserStorage.set(buildObject(Fields.NETWORK_SETTINGS, this.state));
  }

  async setAbortTimeout(abortTimeout: number) {
    this.#abortTimeout = abortTimeout;

    await BrowserStorage.set(buildObject(Fields.NETWORK_SETTINGS, this.state));
  }

  async setNumberOfNodes(numberOfNodes: number) {
    this.#numberOfNodes = numberOfNodes;

    await BrowserStorage.set(buildObject(Fields.NETWORK_SETTINGS, this.state));
  }

  async sync(content?: string | null) {
    if (!content) {
      return this.reset();
    }

    try {
      const parsed = JSON.parse(content);

      this.#downgrade = parsed.downgrade;
      this.#https = parsed.https;
      this.#abortTimeout = parsed.abortTimeout;
      this.#numberOfNodes = parsed.numberOfNodes;
    } catch {
      await this.reset();
    }
  }

  async reset() {
    this.#downgrade = NETWORK_INIT_STATE.downgrade;
    this.#https = NETWORK_INIT_STATE.https;
    this.#abortTimeout = NETWORK_INIT_STATE.abortTimeout;
    this.#numberOfNodes = NETWORK_INIT_STATE.numberOfNodes;

    await BrowserStorage.set(buildObject(Fields.NETWORK_SETTINGS, this.state));
  }
}
