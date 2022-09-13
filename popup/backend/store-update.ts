import type { WalletState } from 'types';

import guardStore from 'popup/store/guard';
import settingsStore from 'app/store/settings';


export function updateState(state: WalletState) {
  document.body.setAttribute('theme', state.settings.theme);

  console.log(state);
  guardStore.set(state.guard);
  settingsStore.set(state.settings);
}
