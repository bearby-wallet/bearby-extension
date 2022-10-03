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


export class BackgroundState {
  readonly netwrok = new NetworkControl();
  readonly guard = new Guard();
  readonly badge = new BadgeControl();
  readonly settings = new SettingsControl();
  readonly contacts = new ContactController();
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
      confirm: this.transaction.confirm
    };
  }

  async sync() {
    await this.guard.sync();
    await this.netwrok.sync();
    await this.account.sync();
    await this.tokens.sync();
    await this.transaction.sync();
    await this.settings.sync();
    await this.contacts.sync();
  }
}
