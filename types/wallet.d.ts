import type { ConfirmParams } from "./transaction";
import type { GasState } from './gas';
import type { SettingsState } from './settings';


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
  gas: GasState;
  lockTime: number;
}
