import type { WalletState } from "types/wallet";

import { AccountController } from "background/account";
import { ContactController } from "background/contacts";
import { Guard } from "background/guard";
import { NetworkControl } from "background/network";
import { MassaControl } from "background/provider";
import { SettingsControl } from "background/settings";
import { TokenControl } from "background/tokens";
import { TransactionsController } from "background/transactions/transactions";
import { BadgeControl } from "background/notifications";
import { WorkerController } from "background/worker";
import { Runtime } from "lib/runtime";
import { PROMT_PAGE } from "config/common";
import { GasControl } from "background/gas";
import { AppConnectController } from "background/connections";
import { MTypeTab } from "config/stream-keys";
import { TabsMessage } from "lib/stream/tabs-message";


export class BackgroundState {
  readonly network = new NetworkControl();
  readonly gas = new GasControl();
  readonly guard = new Guard();
  readonly badge = new BadgeControl();
  readonly settings = new SettingsControl();
  readonly contacts = new ContactController();
  readonly connections = new AppConnectController(this.badge);
  readonly account = new AccountController(this.guard, this.badge);
  readonly massa = new MassaControl(this.network, this.account, this.settings);
  readonly tokens = new TokenControl(this.network, this.massa, this.account);
  readonly transaction = new TransactionsController(
    this.network,
    this.account,
    this.badge
  );
  readonly worker = new WorkerController(
    this.massa,
    this.transaction,
    this.network,
    this.settings
  );

  get state(): WalletState {
    return {
      guard: this.guard.state,
      settings: this.settings.state,
      network: this.network.selected,
      wallet: this.account.wallet,
      tokens: this.tokens.identities,
      confirm: this.transaction.confirm,
      gas: this.gas.state,
      reqPubKey: this.account.requestPubKey,
      lockTime: this.guard.lockTime,
      confirmApps: this.connections.confirm,
      signMessage: this.transaction.message
    };
  }

  async sync() {
    console.log('start sync');

    try {
      Runtime.runtime.onInstalled.addListener(this.#onInstalled);
    } catch (err) {
      console.warn(err);
    }

    await this.guard.sync();
    await this.network.sync();
    await this.gas.sync();
    await this.account.sync();
    await this.tokens.sync();
    await this.transaction.sync();
    await this.settings.sync();
    await this.worker.sync();
    await this.contacts.sync();
    await this.connections.sync();

    const counter = this.transaction.message ? 1 : 0;
    this.badge.setCounter(
      this.transaction.confirm.length + this.connections.confirm.length + counter
    );

    console.log('end sync');
  }

  triggerAccount() {
    const domains = this
      .connections
      .identities
      .filter((app) => app.accounts.includes(this.account.wallet.selectedAddress))
      .map((app) => app.domain);
    const account = this.account.selectedAccount;

    try {
      new TabsMessage({
        type: MTypeTab.ACCOUNT_CHANGED,
        payload: {
          base58: account?.base58
        }
      }).send(...domains);
    } catch (err) {
      console.warn(err);
    }
  }

  triggerNetwork() {
    const domains = this.connections.identities.map((app) => app.domain);

    try {
      new TabsMessage({
        type: MTypeTab.NETWORK_CHANGED,
        payload: {
          net: this.network.selected,
          period: this.worker.period
        }
      }).send(...domains);
    } catch (err) {
      console.warn(err);
    }
  }

  triggerLock() {
    try {
      new TabsMessage({
        type: MTypeTab.LOCKED,
        payload: {
          enabled: this.guard.isEnable
        }
      }).sendAll();
    } catch (err) {
      console.warn(err);
    }
  }

  #onInstalled(event: chrome.runtime.InstalledDetails) {
    try {
      if (event.reason === Runtime.runtime.OnInstalledReason.INSTALL) {
        const url = Runtime.runtime.getURL(PROMT_PAGE);
        Runtime.tabs.create({ url });
        Runtime.runtime.onInstalled.removeListener(this.#onInstalled);
      }
    } catch {
      ///
    }
  }
}
