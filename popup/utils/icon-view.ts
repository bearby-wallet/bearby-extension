import { get } from 'svelte/store';
import settingsStore from 'app/store/settings';
import { META_URL } from 'config/common';
import { Themes } from 'config/theme';
import { themeDetect } from 'popup/mixins/theme';

export enum TokenType {
  FT = 'ft',
  NFT = 'nft'
}

export function viewIcon(address: string, tokenType: TokenType): string {
  let settings = get(settingsStore);
  let theme = Themes.Light;

  if (settings.theme === Themes.System) {
    theme = themeDetect();
  }

  return `${META_URL}/${tokenType}/${address}/${theme}.svg`;
}

