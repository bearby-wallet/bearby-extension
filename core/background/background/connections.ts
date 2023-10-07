import type { AppConnection, ContentWalletData, RPCBody, StreamResponse } from "types";
import type { BackgroundState } from "./state";
import type { BaseError } from "lib/error";

import { MTypeTab } from "config/stream-keys";
import { PromptService } from "lib/prompt";
import { TabsMessage } from "lib/stream/tabs-message";
import { REJECTED } from "background/connections/errors";


export class BackgroundConnection {
  readonly #core: BackgroundState;

  constructor(state: BackgroundState) {
    this.#core = state;
  }

  async disconnect(domain: string, uuid: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      let foundIndex = this
        .#core
        .connections
        .identities
        .findIndex((el) => el.domain === domain);

      await this.#core.connections.rm(foundIndex);

      new TabsMessage({
        type: MTypeTab.DISCONNECT_APP_RESULT,
        payload: {
          uuid,
          net: this.#core.network.selected,
          base58: null,
          resolve: true
        }
      }).send();

      return sendResponse({
        resolve: true
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async getConnections(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      return sendResponse({
        resolve: this.#core.connections.identities
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async removeConnections(index: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.connections.rm(index);

      return sendResponse({
        resolve: this.#core.connections.identities
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async approveConnections(index: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      const connection = this.#core.connections.confirm[index];

      new TabsMessage({
        type: MTypeTab.RESPONSE_CONNECT_APP,
        payload: {
          uuid: connection.uuid,
          net: this.#core.network.selected,
          base58: this.#core.account.selectedAccount?.base58,
          resolve: true
        }
      }).send();

      if (this.#core.connections.has(connection.domain)) {
        await this.#core.connections.removeConfirmConnection(index);

        return sendResponse({
          resolve: this.#core.state
        });
      }

      await this.#core.connections.add(connection);
      await this.#core.connections.removeConfirmConnection(index);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
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
          reject: REJECTED
        }
      }).send();

      await this.#core.connections.removeConfirmConnection(index);

      if (this.#core.connections.has(app.domain)) {
        const foundIndex = this.#core.connections.identities.findIndex(
          (a) => a.domain === app.domain
        );
        await this.#core.connections.rm(foundIndex);

        return sendResponse({
          resolve: this.#core.state
        });
      }

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      if (app.uuid) {
        new TabsMessage({
          type: MTypeTab.RESPONSE_CONNECT_APP,
          payload: {
            uuid: app.uuid,
            reject: REJECTED
          }
        }).send();
      }
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async resolveContentData(domain: string, sendResponse: StreamResponse) {
    const enabled = this.#core.guard.isEnable;
    const connected = this.#core.connections.has(domain);
    const account = this.#core.account.selectedAccount;
    const base58 = (connected && enabled && account) ? account.base58 : undefined;
    const net = connected ? this.#core.network.selected : undefined;

    const data: ContentWalletData = {
      base58,
      connected,
      enabled,
      net,
      period: this.#core.worker.period,
      phishing: this.#core.settings.phishing.phishingDetectionEnabled
    };
    return sendResponse({
      resolve: data
    });
  }

  async makeProxyRequest(bodies: RPCBody[], sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      const rpcBodies = bodies.map(
        ({ method, params }) => this.#core.massa.provider.buildBody(method, params)
      );
      const respone = await this.#core.massa.sendJson(...rpcBodies);

      return sendResponse({
        resolve: respone
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async requestPubKey(payload: AppConnection, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      const prompt = new PromptService(this.#core.settings.popup.enabledPopup);

      await this.#core.account.setPubKeyRequest(payload);
      await prompt.open();

      return sendResponse({});
    } catch (err) {
      new TabsMessage({
        type: MTypeTab.RESPONSE_PUB_KEY,
        payload: {
          uuid: payload.uuid,
          reject: (err as BaseError).message
        }
      }).send();
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async requestPubKeyApproveReject(approved: boolean, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      if (approved) {
        new TabsMessage({
          type: MTypeTab.RESPONSE_PUB_KEY,
          payload: {
            uuid: this.#core.account.requestPubKey?.uuid,
            resolve: this.#core.account.selectedAccount?.pubKey
          }
        }).send();
      } else {
        new TabsMessage({
          type: MTypeTab.RESPONSE_PUB_KEY,
          payload: {
            uuid: this.#core.account.requestPubKey?.uuid,
            reject: REJECTED
          }
        }).send();
      }

      this.#core.account.setPubKeyRequest();

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
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
            resolve: true
          }
        }).send();

        return sendResponse({
          resolve: true
        });
      }

      const prompt = new PromptService(this.#core.settings.popup.enabledPopup);

      await this.#core.connections.addAppFroConfirm(app);
      await prompt.open();

      return sendResponse({
        resolve: true
      });
    } catch (err) {
      if (app.uuid) {
        new TabsMessage({
          type: MTypeTab.RESPONSE_CONNECT_APP,
          payload: {
            uuid: app.uuid,
            reject: (err as BaseError).message
          }
        }).send();
      }
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }
}
