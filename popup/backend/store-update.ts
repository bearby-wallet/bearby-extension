import type { WalletState } from 'types';

import guardStore from 'popup/store/guard';
import settingsStore from 'popup/store/settings';
import walletStore from 'popup/store/wallet';
import tokensStore from 'popup/store/tokens';
import netwrokStore from 'popup/store/netwrok';


export function updateState(state: WalletState) {
  document.body.setAttribute('theme', state.settings.theme);

  console.log(state);
  guardStore.set(state.guard);
  settingsStore.set(state.settings);
  netwrokStore.set(state.netwrok);
  walletStore.set(state.wallet);
  tokensStore.set(state.tokens);
}
