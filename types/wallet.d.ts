import type { ConfirmParams } from "./transaction";
import type { GasState } from './gas';
import type { SettingsState } from './settings';
import type { ShaAlgorithms } from 'config/sha-algorithms';


export interface WalletState {
  guard: {
    isEnable: boolean;
    isReady: boolean;
    iteractions: number;
    algorithm: ShaAlgorithms;
  };
  settings: SettingsState;
  netwrok: string;
  wallet: Wallet;
  tokens: Token[];
  confirm: ConfirmParams[];
  gas: GasState;
  lockTime: number;
  confirmApps: AppConnection[];
  signMessage: SignMessageParams;
}
