import type { WalletState } from 'types';

import guardStore from 'popup/store/guard';
import settingsStore from 'popup/store/settings';
import walletStore from 'popup/store/wallet';
import tokensStore from 'popup/store/tokens';
import netwrokStore from 'popup/store/netwrok';
import { Themes } from 'config/theme';
import { themeDetect } from 'app/mixins/theme';


export function updateState(state: WalletState) {
  let theme = state.settings.theme;

  if (state.settings.theme === Themes.System) {
    theme = themeDetect();
  }

  document.body.setAttribute('theme', theme);

  console.log(state);
  guardStore.set(state.guard);
  settingsStore.set(state.settings);
  netwrokStore.set(state.netwrok);
  walletStore.set(state.wallet);
  tokensStore.set(state.tokens);
}
