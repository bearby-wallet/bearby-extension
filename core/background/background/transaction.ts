import type { BaseError } from "lib/error";
import type { StreamResponse, MinTransactionParams, ConfirmParams } from "types";
import type { BackgroundState } from "./state";

import { assert } from "lib/assert";
import { NOT_FOUND_CONFIRM, TransactionsError, UNKONOW_TX_TYPE } from "background/transactions/errors";
import { OperationsType } from "background/provider/operations";
import { PaymentBuild } from "background/provider/transaction";


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

  async signAndSendTx(index: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      const confirmParams = this.#core.transaction.confirm[index];

      assert(Boolean(confirmParams), NOT_FOUND_CONFIRM, TransactionsError);

      const pair = await this.#core.account.getKeyPair();
      const bytesCompact = await this.#confirmToBytes(confirmParams);
      const txBytes = Uint8Array.from([
        ...pair.pubKey,
        ...bytesCompact
      ]);
      const sigTest1 = await this.#core.massa.sign(txBytes, pair);
      const txDataObject = await this.#core.massa.getTransactionData(
        bytesCompact,
        sigTest1,
        pair.pubKey
      );
      const [{ result, error }] = await this.#core.massa.sendTransaction(txDataObject);

      assert(Boolean(error), `code: ${error?.code} message: ${error?.message}`, TransactionsError);

      const [hash] = result as string[];

      console.log(hash);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async #confirmToBytes(confirmParams: ConfirmParams) {
    const [{ result }] = await this.#core.massa.getNodesStatus();
    const expiryPeriod = Number(result?.next_slot.period) + this.#core.settings.period.periodOffset;

    switch (confirmParams.type) {
      case OperationsType.Payment:
        return await new PaymentBuild(
          confirmParams.fee,
          confirmParams.amount,
          confirmParams.toAddr,
          expiryPeriod
        ).bytes();
      default:
        throw new TransactionsError(UNKONOW_TX_TYPE);
    }
  }
}
