import type { BaseError } from "lib/error";
import type { StreamResponse, MinTransactionParams, ConfirmParams, TransactionToken, HistoryTransaction } from "types";
import type { BackgroundState } from "./state";

import { assert } from "lib/assert";
import { NOT_FOUND_CONFIRM, TransactionsError, UNKONOW_TX_TYPE } from "background/transactions/errors";
import { OperationsType } from "background/provider/operations";
import { BuyRollsBuild, PaymentBuild, SellRollsBuild } from "background/provider/transaction";


export class BackgroundTransaction {
  readonly #core: BackgroundState;

  constructor(state: BackgroundState) {
    this.#core = state;
  }

  async getTransactionHistory(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      return sendResponse({
        resolve: this.#core.transaction.history
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async addToConfirm(params: MinTransactionParams, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      const confirmParams: ConfirmParams = {
        ...params,
        tokenAmount: String(params.amount),
        fee: params.gasLimit * params.gasPrice,
        recipient: params.toAddr
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

  async clearAllHistory(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.transaction.clearHistory();

      return sendResponse({
        resolve: this.#core.transaction.history
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

  async updateConfirmTx(confirmParams: ConfirmParams, index: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      const confirmTxns = this.#core.transaction.confirm;

      assert(Boolean(confirmTxns[index]), NOT_FOUND_CONFIRM, TransactionsError);

      confirmTxns[index] = confirmParams;

      await this.#core.transaction.updateConfirm(confirmTxns);

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

      const [slotResponse] = await this.#core.massa.getNodesStatus();

      assert(!slotResponse.error, `code: ${slotResponse.error?.code} message: ${slotResponse.error?.message}`, TransactionsError);

      const [massaToken] = this.#core.tokens.identities;
      const pair = await this.#core.account.getKeyPair();
      const nextSlot = Number(slotResponse.result?.next_slot.period);
      const expiryPeriod = nextSlot + this.#core.settings.period.periodOffset;
      const bytesCompact = await this.#confirmToBytes(confirmParams, expiryPeriod);
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

      assert(!error, `code: ${error?.code} message: ${error?.message}`, TransactionsError);

      const [hash] = result as string[];
      const token = confirmParams.token ? confirmParams.token : {
        decimals: massaToken.decimals,
        symbol: massaToken.symbol,
        base58: massaToken.base58
      };
      const newHistoryTx: HistoryTransaction = {
        token,
        hash,
        expiryPeriod,
        nextSlot,
        type: confirmParams.type,
        fee: confirmParams.fee,
        gasLimit: confirmParams.gasLimit,
        gasPrice: confirmParams.gasPrice,
        icon: confirmParams.icon,
        title: confirmParams.title,
        toAddr: confirmParams.toAddr,
        from: String(this.#core.account.selectedAccount?.base58),
        tokenAmount: confirmParams.tokenAmount,
        timestamp: new Date().getTime(),
        recipient: confirmParams.recipient,
        amount: confirmParams.amount,
        code: confirmParams.code,
        params: confirmParams.params,
        period: this.#core.settings.period.periodOffset,
        confirmed: false,
        success: false
      };

      await this.#core.transaction.addHistory(newHistoryTx);
      await this.#core.transaction.rmConfirm(index);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      console.error(err);
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async #confirmToBytes(confirmParams: ConfirmParams, expiryPeriod: number) {
    switch (confirmParams.type) {
      case OperationsType.Payment:
        return await new PaymentBuild(
          confirmParams.fee,
          confirmParams.amount,
          confirmParams.toAddr,
          expiryPeriod
        ).bytes();
      case OperationsType.RollBuy:
        return await new BuyRollsBuild(
          confirmParams.fee,
          confirmParams.amount,
          expiryPeriod
        ).bytes();
      case OperationsType.RollSell:
        return await new SellRollsBuild(
          confirmParams.fee,
          confirmParams.amount,
          expiryPeriod
        ).bytes();
      default:
        throw new TransactionsError(UNKONOW_TX_TYPE);
    }
  }
}
