import type { NetworkControl } from "background/network";
import type { SettingsControl } from "background/settings";
import type { MassaControl } from "background/provider";

import { WORKER_POOLING } from "config/common";
import { BrowserStorage, buildObject } from "lib/storage";
import { Fields } from "config/fields";
import { TransactionsController, HASH_OUT_OF_STORAGE } from "background/transactions";
import { NotificationController } from "lib/runtime/notifications";
import { MTypeTab } from "config/stream-keys";
import { TabsMessage } from "lib/stream/tabs-message";
import { NETWORK, NODE_PORT } from "config/network";
import { isIPV6 } from "lib/validator/ip";
import { Massa } from 'lib/explorer';
import { Runtime } from "lib/runtime";
import { getManifestVersion } from "lib/runtime/manifest";
import { ManifestVersions } from "config/manifest-versions";


enum Statuses {
  Confirmed = 'Confirmed',
  ExpirePeriod = 'Expire period'
}

export class WorkerController {
  readonly #massa: MassaControl;
  readonly #transactions: TransactionsController;
  readonly #network: NetworkControl;
  readonly #settings: SettingsControl;

  readonly #fieldAlarm = "massa-block-tracker";
    
  #delay = WORKER_POOLING;
  #period = 0;
  #cycle = 0;

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
    const alarmName = this.#fieldAlarm;
    let intervalId: NodeJS.Timer;
    this.trackBlockNumber();

    if (getManifestVersion() === ManifestVersions.V2) {
      intervalId = globalThis.setInterval(() => {
        this.trackBlockNumber();
      }, this.delay);
    } else {
      Runtime.alarms.create(alarmName, {
        delayInMinutes: 0.16667,
        periodInMinutes: 0.16667
      });
      Runtime.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === alarmName) {
          this.trackBlockNumber();
        }
      });
    }

    return {
      unsubscribe() {
        if (intervalId !== undefined) {
          globalThis.clearInterval(intervalId);
        } else {
          Runtime.alarms.clear(alarmName);
        }
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
    const newCycle = Number(result.current_cycle);

    if (newPeriod <= lastPeriod) {
      return;
    }

    await this.#setPeriod(newPeriod);
    await this.#trackTransactions();

    new TabsMessage({
      type: MTypeTab.NEW_SLOT,
      payload: newPeriod
    }).send();

    if (newCycle > this.#cycle) {
      await this.#setCycle(newCycle);

      if (result.connected_nodes && this.#settings.network.state.downgrade) {
        const nodes = Object.values(result.connected_nodes).map(
          ([url]) => String(url)
        );
        await this.#updateProviders(nodes);
      }
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

      if (transaction.is_operation_final === false && expirePeriod < this.period) {
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

      list[listIndex].confirmed = transaction.is_operation_final;
      list[listIndex].success = transaction.is_operation_final;

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

    const config = this.#network.config;
    const hosts = config[this.#network.selected].PROVIDERS;
    const newNodes = connectedNodes
      .map((ip) => {
        const { https } = this.#settings.network.state;
        let url = isIPV6(ip) ? `[${ip}]` : `${ip.replace('::ffff:', '')}`;

        return https ? `https://${url}` : `http://${url}:${NODE_PORT}`;
      });
    const [defaultHost] = NETWORK[this.#network.selected].PROVIDERS;
    const newHosts = [defaultHost, ...hosts, ...newNodes].slice(0, this.#settings.network.state.numberOfNodes);
    const uniqueHosts = new Set(newHosts);

    config[this.#network.selected].PROVIDERS = Array.from(uniqueHosts);

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

  async #setCycle(cycle: number) {
    this.#cycle = cycle;

    await BrowserStorage.set(
      buildObject(Fields.CYCLE, String(this.#cycle))
    );
  }

  #makeNotify(title: string, hash: string, message: string) {
    const url = new Massa().transaction(hash);
    new NotificationController(
      url,
      title,
      message
    ).create();
  }
}
