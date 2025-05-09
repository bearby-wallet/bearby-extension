import type {
  AppConnection,
  ContentWalletData,
  RPCBody,
  StreamResponse,
} from "types";
import type { BackgroundState } from "./state";
import type { BaseError } from "lib/error";
import type { CallParam } from "types";

import { MTypeTab } from "config/stream-keys";
import { PromptService } from "lib/prompt";
import { TabsMessage } from "lib/stream/tabs-message";
import { REJECTED } from "background/connections/errors";
import { TypeOf } from "lib/type";
import { parseParams } from "lib/args";
import { JsonRPCRequestMethods } from "background/provider";

export class BackgroundConnection {
  readonly #core: BackgroundState;

  constructor(state: BackgroundState) {
    this.#core = state;
  }

  async disconnect(domain: string, uuid: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.connections.checkConnection(domain);

      let foundIndex = this.#core.connections.identities.findIndex(
        (el) => el.domain === domain,
      );

      await this.#core.connections.rm(foundIndex);

      new TabsMessage({
        type: MTypeTab.DISCONNECT_APP_RESULT,
        payload: {
          uuid,
          net: this.#core.network.selected,
          base58: null,
          resolve: true,
        },
      }).send(domain);

      return sendResponse({
        resolve: true,
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize(),
      });
    }
  }

  async getConnections(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      return sendResponse({
        resolve: this.#core.connections.identities,
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize(),
      });
    }
  }

  async removeConnections(index: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.connections.rm(index);

      return sendResponse({
        resolve: this.#core.connections.identities,
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize(),
      });
    }
  }

  async updateConnections(
    index: number,
    accounts: number[],
    sendResponse: StreamResponse,
  ) {
    try {
      this.#core.guard.checkSession();
      await this.#core.connections.updateAccounts(index, accounts);

      const app = this.#core.connections.identities[index];

      await new TabsMessage({
        type: MTypeTab.CONNECTION_CHANGED,
        payload: {
          base58: this.#core.account.selectedAccount?.base58,
          accounts: accounts
            .map((index) => this.#core.account.wallet.identities[index])
            .filter(Boolean)
            .map((value) => value.base58),
        },
      }).signal(app.domain);
      this.#core.triggerAccount();

      return sendResponse({
        resolve: this.#core.state,
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize(),
      });
    }
  }

  async approveConnections(
    index: number,
    accounts: number[],
    sendResponse: StreamResponse,
  ) {
    try {
      this.#core.guard.checkSession();

      let connection = this.#core.connections.confirm[index];

      connection.accounts = accounts;

      new TabsMessage({
        type: MTypeTab.RESPONSE_CONNECT_APP,
        payload: {
          uuid: connection.uuid,
          net: this.#core.network.selected,
          base58: this.#core.account.selectedAccount?.base58,
          accounts: accounts
            .map((index) => this.#core.account.wallet.identities[index])
            .filter(Boolean)
            .map((value) => value.base58),
          resolve: true,
        },
      }).send(connection.domain);

      if (this.#core.connections.has(connection.domain)) {
        await this.#core.connections.removeConfirmConnection(index);

        return sendResponse({
          resolve: this.#core.state,
        });
      }

      await this.#core.connections.add(connection);
      await this.#core.connections.removeConfirmConnection(index);

      return sendResponse({
        resolve: this.#core.state,
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize(),
      });
    }
  }

  async rejectConnections(index: number, sendResponse: StreamResponse) {
    const app = this.#core.connections.confirm[index];

    try {
      this.#core.guard.checkSession();

      new TabsMessage({
        type: MTypeTab.RESPONSE_CONNECT_APP,
        payload: {
          uuid: app.uuid,
          reject: REJECTED,
        },
      }).send(app.domain);

      await this.#core.connections.removeConfirmConnection(index);

      if (this.#core.connections.has(app.domain)) {
        const foundIndex = this.#core.connections.identities.findIndex(
          (a) => a.domain === app.domain,
        );
        await this.#core.connections.rm(foundIndex);

        return sendResponse({
          resolve: this.#core.state,
        });
      }

      return sendResponse({
        resolve: this.#core.state,
      });
    } catch (err) {
      if (app.uuid) {
        new TabsMessage({
          type: MTypeTab.RESPONSE_CONNECT_APP,
          payload: {
            uuid: app.uuid,
            reject: REJECTED,
          },
        }).send(app.domain);
      }
      return sendResponse({
        reject: (err as BaseError).serialize(),
      });
    }
  }

  async resolveContentData(domain: string, sendResponse: StreamResponse) {
    const enabled = this.#core.guard.isEnable;
    const app = this.#core.connections.has(domain);
    const connected = Boolean(app);
    const account = this.#core.account.selectedAccount;
    const base58 = connected && enabled && account ? account.base58 : undefined;
    const net = connected ? this.#core.network.selected : undefined;
    const accounts =
      enabled && app
        ? app.accounts
            .map((index) => this.#core.account.wallet.identities[index])
            .filter(Boolean)
            .map((value) => value.base58)
        : [];

    const data: ContentWalletData = {
      accounts,
      base58,
      connected,
      enabled,
      net,
      period: this.#core.worker.period,
      phishing: this.#core.settings.phishing.phishingDetectionEnabled,
    };
    return sendResponse({
      resolve: data,
    });
  }

  async makeProxyRequest(bodies: RPCBody[], sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      const rpcBodies = bodies.map(({ method, params }) => {
        if (method == JsonRPCRequestMethods.EXECUTE_READ_ONLY_CALL) {
          params = params.map((param) => {
            if (TypeOf.isArray(param)) {
              return (param as any).map((req: any) => ({
                ...req,
                parameter: Array.from(parseParams(req.parameter).serialize()),
              }));
            }

            return param;
          });
        }

        return this.#core.massa.provider.buildBody(method, params);
      });
      const respone = await this.#core.massa.sendJson(...rpcBodies);

      return sendResponse({
        resolve: respone,
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize(),
      });
    }
  }

  async requestPubKey(payload: AppConnection, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.connections.checkConnection(payload.domain);

      const prompt = new PromptService(this.#core.settings.popup.enabledPopup);

      await this.#core.account.setPubKeyRequest(payload);
      await prompt.open();

      return sendResponse({});
    } catch (err) {
      new TabsMessage({
        type: MTypeTab.RESPONSE_PUB_KEY,
        payload: {
          uuid: payload.uuid,
          reject: (err as BaseError).message,
        },
      }).send(payload.domain);
      return sendResponse({
        reject: (err as BaseError).serialize(),
      });
    }
  }

  async requestPubKeyApproveReject(
    approved: boolean,
    sendResponse: StreamResponse,
  ) {
    try {
      this.#core.guard.checkSession();

      if (approved) {
        new TabsMessage({
          type: MTypeTab.RESPONSE_PUB_KEY,
          payload: {
            uuid: this.#core.account.requestPubKey?.uuid,
            resolve: this.#core.account.selectedAccount?.pubKey,
          },
        }).send(String(this.#core.account.requestPubKey?.domain));
      } else {
        new TabsMessage({
          type: MTypeTab.RESPONSE_PUB_KEY,
          payload: {
            uuid: this.#core.account.requestPubKey?.uuid,
            reject: REJECTED,
          },
        }).send(String(this.#core.account.requestPubKey?.domain));
      }

      this.#core.account.setPubKeyRequest();

      return sendResponse({
        resolve: this.#core.state,
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize(),
      });
    }
  }

  async addConnectAppConfirm(app: AppConnection, sendResponse: StreamResponse) {
    try {
      if (this.#core.guard.isEnable && this.#core.connections.has(app.domain)) {
        new TabsMessage({
          type: MTypeTab.RESPONSE_CONNECT_APP,
          payload: {
            uuid: app.uuid,
            net: this.#core.network.selected,
            base58: this.#core.account.selectedAccount?.base58,
            resolve: true,
          },
        }).send(app.domain);

        return sendResponse({
          resolve: true,
        });
      }

      const prompt = new PromptService(this.#core.settings.popup.enabledPopup);

      await this.#core.connections.addAppFroConfirm(app);
      await prompt.open();

      return sendResponse({
        resolve: true,
      });
    } catch (err) {
      if (app.uuid) {
        new TabsMessage({
          type: MTypeTab.RESPONSE_CONNECT_APP,
          payload: {
            uuid: app.uuid,
            reject: (err as BaseError).message,
          },
        }).send(app.domain);
      }
      return sendResponse({
        reject: (err as BaseError).serialize(),
      });
    }
  }
}
