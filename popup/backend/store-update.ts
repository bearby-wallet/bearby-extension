import type { WalletState } from 'types';

import guardStore from 'popup/store/guard';
import settingsStore from 'app/store/settings';
import walletStore from 'app/store/wallet';
import tokensStore from 'app/store/tokens';


export function updateState(state: WalletState) {
  document.body.setAttribute('theme', state.settings.theme);

  console.log(state);
  guardStore.set(state.guard);
  settingsStore.set(state.settings);
  walletStore.set(state.wallet);
  tokensStore.set(state.tokens);
}
