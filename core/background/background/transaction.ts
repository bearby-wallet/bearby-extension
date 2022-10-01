import { OperationsType } from "background/provider/operations";
import type { BaseError } from "lib/error";
import type { StreamResponse, MinTransactionParams, ConfirmParams } from "types";
import type { BackgroundState } from "./state";


export class BackgroundTransaction {
  readonly #core: BackgroundState;

  constructor(state: BackgroundState) {
    this.#core = state;
  }

  async addToConfirm(params: MinTransactionParams, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      const confirmParams: ConfirmParams = {
        ...params,
        tokenAmount: String(params.amount),
        fee: params.gasLimit * params.gasPrice,
        recipient: params.toAddr,
      };

      await this.#core.transaction.addConfirm(confirmParams);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async removeConfirmTx(index: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.transaction.rmConfirm(index);

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
