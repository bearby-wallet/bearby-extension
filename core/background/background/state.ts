import type { WalletState } from "types/wallet";

import { AccountController } from "background/account";
import { ContactController } from "background/contacts";
import { Guard } from "background/guard";
import { NetworkControl } from "background/network";
import { MassaControl } from "background/provider";
import { SettingsControl } from "background/settings";
import { TokenControl } from "background/tokens";


export class BackgroundState {
  readonly netwrok = new NetworkControl();
  readonly guard = new Guard();
  readonly settings = new SettingsControl();
  readonly contacts = new ContactController();
  readonly account = new AccountController(this.guard);
  readonly massa = new MassaControl(this.netwrok, this.account);
  readonly tokens = new TokenControl(this.netwrok, this.massa, this.account);

  get state(): WalletState {
    return {
      guard: this.guard.state,
      settings: this.settings.state,
      netwrok: this.netwrok.state,
      wallet: this.account.wallet,
      tokens: this.tokens.identities
    };
  }
}
