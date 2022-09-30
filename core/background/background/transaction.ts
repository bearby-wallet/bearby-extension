import type { BaseError } from "lib/error";
import type { StreamResponse, TransactionParam } from "types";
import type { BackgroundState } from "./state";


export class BackgroundTransaction {
  readonly #core: BackgroundState;

  constructor(state: BackgroundState) {
    this.#core = state;
  }

  async addToConfirm(params: TransactionParam, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.transaction.addConfirm(params);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

}
