import type { ConfirmParams } from "./transaction";


export interface WalletState {
  guard: {
    isEnable: boolean;
    isReady: boolean;
  };
  settings: {
      currency: string;
      locale: Locales;
      theme: Themes;
      periodOffset: number;
      downgradeNode: boolean;
  };
  netwrok: string;
  wallet: Wallet;
  tokens: Token[];
  confirm: ConfirmParams[];
}
