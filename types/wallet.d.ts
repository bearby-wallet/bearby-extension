import type { ConfirmParams } from "./transaction";


export interface WalletState {
  guard: {
    isEnable: boolean;
    isReady: boolean;
  };
  settings: SettingsState;
  netwrok: string;
  wallet: Wallet;
  tokens: Token[];
  confirm: ConfirmParams[];
}
