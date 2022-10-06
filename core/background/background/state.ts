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
  readonly netwrok = new NetworkControl();
  readonly gas = new GasControl();
  readonly guard = new Guard();
  readonly badge = new BadgeControl();
  readonly settings = new SettingsControl();
  readonly contacts = new ContactController();
  readonly connections = new AppConnectController(this.badge);
  readonly account = new AccountController(this.guard);
  readonly massa = new MassaControl(this.netwrok, this.account, this.settings);
  readonly tokens = new TokenControl(this.netwrok, this.massa, this.account);
  readonly transaction = new TransactionsController(
    this.netwrok,
    this.account,
    this.badge
  );
  readonly worker = new WorkerController(
    this.massa,
    this.transaction
  );


  get state(): WalletState {
    return {
      guard: this.guard.state,
      settings: this.settings.state,
      netwrok: this.netwrok.selected,
      wallet: this.account.wallet,
      tokens: this.tokens.identities,
      confirm: this.transaction.confirm,
      gas: this.gas.state,
      lockTime: this.guard.lockTime
    };
  }

  async sync() {
    console.log('start sync');
    await this.guard.sync();
    await this.netwrok.sync();
    await this.gas.sync();
    await this.account.sync();
    await this.tokens.sync();
    await this.transaction.sync();
    await this.settings.sync();
    await this.worker.sync();
    await this.contacts.sync();
    await this.connections.sync();

    this.badge.setCounter(
      this.transaction.confirm.length + this.connections.confirm.length
    );

    Runtime.runtime.onInstalled.addListener(this.#onInstalled);

    console.log('end sync');
  }

  triggerAccount() {
    const account = this.account.selectedAccount;

    new TabsMessage({
      type: MTypeTab.ACCOUNT_CHANGED,
      payload: {
        base58: account?.base58
      }
    }).send();
  }

  triggerNetwork() {
    new TabsMessage({
      type: MTypeTab.NETWORK_CHANGED,
      payload: {
        net: this.netwrok.selected
      }
    }).send();
  }

  triggerLock() {
    new TabsMessage({
      type: MTypeTab.LOCKED,
      payload: {
        enabled: this.guard.isEnable
      }
    }).send();
  }

  #onInstalled(event: chrome.runtime.InstalledDetails) {
    if(event.reason === Runtime.runtime.OnInstalledReason.INSTALL) {
      const url = Runtime.runtime.getURL(PROMT_PAGE);
      Runtime.tabs.create({ url });
      Runtime.runtime.onInstalled.removeListener(this.#onInstalled);
    }
  }
}
