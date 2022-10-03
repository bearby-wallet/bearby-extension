import { INCORRECT_NODE_RESPONSE, TransactionsController, TransactionsError } from "background/transactions";
import type { MassaControl } from "background/provider";
import { WORKER_POOLING } from "config/common";
import { BrowserStorage, buildObject } from "lib/storage";
import { Fields } from "config/fields";


export class WorkerController {
  readonly #massa: MassaControl;
  readonly #transactions: TransactionsController;

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
    transactions: TransactionsController
  ) {
    this.#transactions = transactions;
    this.#massa = massa;
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
        continue;
      }

      if (!result) {
        throw new TransactionsError(INCORRECT_NODE_RESPONSE);
      }

      list[listIndex].confirmed = result.is_final;
      list[listIndex].success = result.is_final;
    }

    await this.#transactions.updateHistory(list);
  }

  async sync() {
    const content = await BrowserStorage.get(Fields.PERIOD);
    const block = Number(content);

    if (isNaN(block)) {
      await BrowserStorage.set(
        buildObject(Fields.PERIOD, String(this.#period))
      );

      return;
    }

    this.#period = block;
  }

  async #setPeriod(block: number) {
    this.#period = block;

    await BrowserStorage.set(
      buildObject(Fields.PERIOD, String(this.#period))
    );
  }
}
