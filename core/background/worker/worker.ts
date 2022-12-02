import type { NetworkControl } from "background/network";
import type { SettingsControl } from "background/settings";
import type { MassaControl } from "background/provider";

import { WORKER_POOLING } from "config/common";
import { BrowserStorage, buildObject } from "lib/storage";
import { Fields } from "config/fields";
import  { TransactionsController, HASH_OUT_OF_STORAGE } from "background/transactions";
import { NotificationController } from "lib/runtime/notifications";
import { MTypeTab } from "config/stream-keys";
import { TabsMessage } from "lib/stream/tabs-message";
import { NODES_SLICE } from "config/network";


enum Statuses {
  Confirmed = 'Confirmed',
  ExpirePeriod = 'Expire period'
}

export class WorkerController {
  readonly #massa: MassaControl;
  readonly #transactions: TransactionsController;
  readonly #network: NetworkControl;
  readonly #settings: SettingsControl;
    
  #delay = WORKER_POOLING;
  #period = 0;

  get period() {
    return this.#period;
  }

  get delay() {
    return this.#delay;
  }

  constructor(
    massa: MassaControl,
    transactions: TransactionsController,
    network: NetworkControl,
    settings: SettingsControl
  ) {
    this.#transactions = transactions;
    this.#massa = massa;
    this.#network = network;
    this.#settings = settings;
  }

  subscribe() {
    this.trackBlockNumber();
    const intervalId = globalThis.setInterval(() => {
      this.trackBlockNumber();
    }, this.delay);

    return {
      unsubscribe() {
        globalThis.clearInterval(intervalId);
      }
    }
  }

  async trackBlockNumber() {
    const lastPeriod = this.#period;
    const [{ result, error }] = await this.#massa.getNodesStatus();

    if (error || !result) {
      console.error(JSON.stringify(error, null, 4));
      return;
    }

    if (!result.last_slot) {
      return;
    }

    const newPeriod = Number(result.last_slot.period);

    if (newPeriod <= lastPeriod) {
      return;
    }

    await this.#setPeriod(newPeriod);
    await this.#trackTransactions();

    new TabsMessage({
      type: MTypeTab.NEW_SLOT,
      payload: newPeriod
    }).send();

    if (result.connected_nodes && this.#settings.network.downgrade) {
      const nodes = Object.values(result.connected_nodes).map(
        ([url]) => String(url)
      );
      await this.#updateProviders(nodes);
    }
  }

  async #trackTransactions() {
    const list =  this.#transactions.history;
    const now = new Date().getTime();
    const dilaySeconds = 3000;
    const identities = list.filter((t) => {
      return !t.confirmed && (now - t.timestamp) > dilaySeconds;
    });

    if (identities.length === 0) {
      return null;
    }

    const hashSet = identities.map((t) => t.hash);
    const replies = await this.#massa.getOperations(...hashSet);

    for (let index = 0; index < replies.length; index++) {
      const { error, result } = replies[index];
      const indicator = identities[index];
      const listIndex = list.findIndex((t) => t.hash === indicator.hash);

      if (error) {
        list[listIndex].confirmed = true;
        list[listIndex].error = error.message;
        list[listIndex].success = false;
        this.#makeNotify(
          String(list[listIndex].title),
          list[listIndex].hash,
          error.message
        );
        continue;
      }

      if (!result || result.length === 0) {
        list[listIndex].confirmed = true;
        list[listIndex].error = HASH_OUT_OF_STORAGE;
        list[listIndex].success = false;
        this.#makeNotify(
          String(list[listIndex].title),
          list[listIndex].hash,
          HASH_OUT_OF_STORAGE
        );
        continue;
      }

      const [transaction] = result;
      const expirePeriod = transaction.operation.content.expire_period;

      if (!transaction.is_final && expirePeriod < this.period) {
        list[listIndex].confirmed = true;
        list[listIndex].success = false;
        list[listIndex].error = Statuses.ExpirePeriod;

        this.#makeNotify(
          String(list[listIndex].title),
          list[listIndex].hash,
          Statuses.ExpirePeriod
        );

        continue;
      }

      list[listIndex].confirmed = transaction.is_final;
      list[listIndex].success = transaction.is_final;

      if (list[listIndex].confirmed) {
        this.#makeNotify(
          String(list[listIndex].title),
          list[listIndex].hash,
          Statuses.Confirmed
        );
      }
    }

    await this.#transactions.updateHistory(list);
  }

  async #updateProviders(connectedNodes: string[]) {
    if (connectedNodes.length === 0) return;

    const { URL } = globalThis;
    const config = this.#network.config; // TODO: doesn't work ipv6
    const hosts = config[this.#network.selected].PROVIDERS.map((url) => new URL(url).host);
    const newProviders = connectedNodes
      .filter((n) => !hosts.includes(n))
      .map((n) => `http://${n}:33035`).concat(config[this.#network.selected].PROVIDERS);
    const newNodesSet = new Set(newProviders);
    const nodes = Array.from(newNodesSet);

    config[this.#network.selected].PROVIDERS = nodes.slice(0, NODES_SLICE);

    await this.#network.setConfig(config);
  }

  async sync() {
    // TODO: enable only when mainnet will launch.
    // const content = await BrowserStorage.get(Fields.PERIOD);
    // const block = Number(content);

    // if (isNaN(block)) {
    //   await BrowserStorage.set(
    //     buildObject(Fields.PERIOD, String(this.#period))
    //   );

    //   return;
    // }

    // this.#period = block;
  }

  async #setPeriod(block: number) {
    this.#period = block;

    await BrowserStorage.set(
      buildObject(Fields.PERIOD, String(this.#period))
    );
  }

  #makeNotify(title: string, hash: string, message: string) {
    const url = hash;
    new NotificationController(
      url,
      title,
      message
    ).create();
  }
}
