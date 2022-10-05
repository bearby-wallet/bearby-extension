import type { WalletState } from 'types';

import { openTab } from 'popup/mixins/link';
import { closePopup } from 'popup/mixins/popup';
import { PROMT_PAGE } from 'config/common';
import { themeDetect } from 'app/mixins/theme';

import guardStore from 'popup/store/guard';
import settingsStore from 'popup/store/settings';
import walletStore from 'popup/store/wallet';
import tokensStore from 'popup/store/tokens';
import netwrokStore from 'popup/store/netwrok';
import { Themes } from 'config/theme';
import confirmStore from 'app/store/confirm';
import gasStore from 'app/store/gas';
import lockTimerStore from 'app/store/lock-timer';


export function updateState(state: WalletState) {
  let theme = state.settings.theme;

  if (state.settings.theme === Themes.System) {
    theme = themeDetect();
  }

  document.body.setAttribute('theme', theme);

  console.log(state);
  guardStore.set(state.guard);
  settingsStore.set(state.settings);
  lockTimerStore.set(state.lockTime);
  gasStore.set(state.gas);
  netwrokStore.set(state.netwrok);
  walletStore.set(state.wallet);
  tokensStore.set(state.tokens);
  confirmStore.set(state.confirm);

  if (!state.guard.isReady && globalThis.innerHeight === 600 && globalThis.innerWidth === 320) {
    openTab(PROMT_PAGE);
    closePopup();
  }
}
