import type { BaseError } from "lib/error";
import type {
  StreamResponse,
  MinTransactionParams,
  ConfirmParams,
  HistoryTransaction,
  SignMessageParams,
  SignedMessage
} from "types";
import type { BackgroundState } from "./state";

import { utils } from 'aes-js';
import blake3 from 'blake3-js';
import { assert } from "lib/assert";
import { NOT_FOUND_CONFIRM, TransactionsError, UNKONOW_TX_TYPE } from "background/transactions/errors";
import { OperationsType } from "background/provider/operations";
import { BuyRollsBuild, CallSmartContractBuild, ExecuteSmartContractBuild, PaymentBuild, SellRollsBuild } from "background/provider/transaction";
import { PromptService } from "lib/prompt";
import { MTypeTab } from "config/stream-keys";
import { TabsMessage } from "lib/stream/tabs-message";
import { INCORRECT_PARAM, REJECTED } from "background/connections/errors";
import { base58Encode, pubKeyFromBytes } from "lib/address";


export class BackgroundTransaction {
  readonly #core: BackgroundState;

  constructor(state: BackgroundState) {
    this.#core = state;
  }

  async addSignMessage(params: SignMessageParams, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.connections.checkConnection(params.domain);

      const prompt = new PromptService(this.#core.settings.popup.enabledPopup);
      const messageBytes = utils.utf8.toBytes(params.message);

      params.hash = blake3.newRegular().update(messageBytes).finalize();

      await this.#core.transaction.addMessage(params);
      await prompt.open();

      return sendResponse({});
    } catch (err) {
      new TabsMessage({
        type: MTypeTab.SING_MESSAGE_RESULT,
        payload: {
          uuid: params.uuid,
          reject: (err as BaseError).message
        }
      }).send(params.domain);
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
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
      await this.#core.connections.checkConnection(String(params.domain));

      if (!params.token) {
        const [massa, rolls] = this.#core.tokens.identities;
        const token = params.type === OperationsType.RollBuy || params.type === OperationsType.RollSell ?
          rolls : massa;
        params.token = {
          decimals: token.decimals,
          base58: token.base58,
          symbol: token.symbol
        };
      }

      if (params.gasLimit && !params.maxGas) {
        /// TODO: remove after some time...
        params.maxGas = params.gasLimit;
      }

      if (!params.fee) {
        params.fee = String(this.#core.gas.fee);
      }

      const prompt = new PromptService(
        this.#core.settings.popup.enabledPopup && Boolean(params.uuid)
      );
      const confirmParams: ConfirmParams = {
        ...params,
        tokenAmount: String(params.coins ?? 0),
        fee: String(params.fee),
        maxGas: String(params.maxGas ?? this.#core.gas.state.gasLimit),
        recipient: params.toAddr
      };

      await this.#core.transaction.addConfirm(confirmParams);
      await prompt.open();

      if (params.uuid) {
        return sendResponse({});
      }

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      if (params.uuid && params.domain) {
        new TabsMessage({
          type: MTypeTab.TX_TO_SEND_RESULT,
          payload: {
            uuid: params.uuid,
            reject: (err as BaseError).message
          }
        }).send(params.domain);
      }
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

      const confirmTxns = this.#core.transaction.confirm;

      if (confirmTxns[index].uuid && confirmTxns[index].domain) {
        new TabsMessage({
          type: MTypeTab.TX_TO_SEND_RESULT,
          payload: {
            uuid: confirmTxns[index].uuid,
            reject: REJECTED
          }
        }).send(String(confirmTxns[index].domain));
      }

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
    const confirmParams = this.#core.transaction.confirm[index];

    try {
      this.#core.guard.checkSession();

      assert(Boolean(confirmParams), NOT_FOUND_CONFIRM, TransactionsError);

      const [slotResponse] = await this.#core.massa.getNodesStatus();

      assert(!slotResponse.error, `code: ${slotResponse.error?.code} message: ${slotResponse.error?.message}`, TransactionsError);

      const pair = await this.#core.account.getKeyPair();
      const nextSlot = Number(slotResponse.result?.next_slot.period);
      const expiryPeriod = nextSlot + this.#core.settings.period.periodOffset;
      const bytesCompact = await this.#confirmToBytes(confirmParams, expiryPeriod);
      let array = [];

      const chainIdBuffer = new ArrayBuffer(8);
      const view = new DataView(chainIdBuffer);
      view.setBigUint64(0, BigInt(this.#core.network.chainId), false);
      array = [
        ...new Uint8Array(chainIdBuffer),
        ...pair.pubKey,
        ...bytesCompact
      ];
      const txBytes = Uint8Array.from(array);
      const sig = await this.#core.massa.sign(txBytes, pair);
      const txDataObject = await this.#core.massa.getTransactionData(
        bytesCompact,
        sig,
        pair.pubKey
      );
      const [{ result, error }] = await this.#core.massa.sendTransaction(txDataObject);

      assert(!error, `code: ${error?.code} message: ${error?.message}`, TransactionsError);

      const [hash] = result as string[];
      const token = confirmParams.token;

      if (confirmParams.uuid && confirmParams.domain) {
        await new TabsMessage({
          type: MTypeTab.TX_TO_SEND_RESULT,
          payload: {
            uuid: confirmParams.uuid,
            resolve: hash
          }
        }).send(confirmParams.domain);
      }

      const newHistoryTx: HistoryTransaction = {
        token,
        hash,
        expiryPeriod,
        nextSlot,
        func: confirmParams.func,
        type: confirmParams.type,
        fee: confirmParams.fee,
        icon: confirmParams.icon,
        title: confirmParams.title,
        toAddr: confirmParams.toAddr,
        from: String(this.#core.account.selectedAccount?.base58),
        tokenAmount: confirmParams.tokenAmount,
        timestamp: new Date().getTime(),
        recipient: confirmParams.recipient,
        coins: confirmParams.coins,
        code: confirmParams.code,
        params: confirmParams.params,
        period: this.#core.settings.period.periodOffset,
        confirmed: false,
        success: false
      };

      await this.#core.transaction.addHistory(newHistoryTx);
      await this.#core.transaction.rmConfirm(index);

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      console.log(err);
      const message = (err as BaseError).serialize ?
        (err as BaseError).serialize().message : (err as Error).message;

      return sendResponse({
        reject: {
          message: String(message)
        }
      });
    }
  }

  async approveMessage(sendResponse: StreamResponse) {
    const message = this.#core.transaction.message;
    try {
      this.#core.guard.checkSession();

      if (!message) {
        throw new TransactionsError(INCORRECT_PARAM);
      }

      const pair = await this.#core.account.getKeyPair();
      const messageBytes = utils.hex.toBytes(String(message.hash));
      const signatureBytes = await this.#core.massa.sign(messageBytes, pair);
      const signature = await base58Encode(signatureBytes);
      const payload: SignedMessage = {
        signature,
        message: message.message,
        publicKey: await pubKeyFromBytes(pair.pubKey)
      };

      await new TabsMessage({
        type: MTypeTab.SING_MESSAGE_RESULT,
        payload: {
          uuid: message.uuid,
          resolve: payload
        }
      }).send(message.domain);

      await this.#core.transaction.removeMessage();

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      if (message) {
        new TabsMessage({
          type: MTypeTab.SING_MESSAGE_RESULT,
          payload: {
            uuid: message.uuid,
            reject: (err as BaseError).message
          }
        }).send(message.domain);
      }
      await this.#core.transaction.removeMessage();
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async rejectMessage(sendResponse: StreamResponse) {
    const message = this.#core.transaction.message;
    try {
      this.#core.guard.checkSession();

      if (!message) {
        throw new TransactionsError(INCORRECT_PARAM);
      }

      await this.#core.transaction.removeMessage();

      await new TabsMessage({
        type: MTypeTab.SING_MESSAGE_RESULT,
        payload: {
          uuid: message.uuid,
          reject: REJECTED
        }
      }).send(message.domain);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
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
          confirmParams.coins,
          confirmParams.toAddr, expiryPeriod
        ).bytes();
      case OperationsType.RollBuy:
        return await new BuyRollsBuild(
          confirmParams.fee,
          confirmParams.coins,
          expiryPeriod
        ).bytes();
      case OperationsType.RollSell:
        return await new SellRollsBuild(
          confirmParams.fee,
          confirmParams.coins,
          expiryPeriod
        ).bytes();
      case OperationsType.ExecuteSC:
        assert(Boolean(confirmParams.code), INCORRECT_PARAM);
        assert(Boolean(confirmParams.deployer), INCORRECT_PARAM);

        return new ExecuteSmartContractBuild(
          BigInt(confirmParams.fee),
          BigInt(confirmParams.maxGas),
          BigInt(confirmParams.maxCoins || 0),
          BigInt(confirmParams.coins || 0),
          expiryPeriod,
          confirmParams.code || '',
          confirmParams.deployer || '',
          confirmParams.params,
          confirmParams.unsafeParams ? utils.hex.toBytes(confirmParams.unsafeParams) : undefined
        ).bytes();
      case OperationsType.CallSC:
        assert(Boolean(confirmParams.func), INCORRECT_PARAM);

        return await new CallSmartContractBuild(
          confirmParams.func || '',
          confirmParams.params || [],
          confirmParams.fee,
          expiryPeriod,
          BigInt(confirmParams.maxGas),
          confirmParams.coins || '0',
          confirmParams.toAddr,
          confirmParams.unsafeParams ? utils.hex.toBytes(confirmParams.unsafeParams) : undefined
        ).bytes();
      default:
        throw new TransactionsError(UNKONOW_TX_TYPE);
    }
  }
}
