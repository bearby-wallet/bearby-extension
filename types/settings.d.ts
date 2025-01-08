import type { NetworkSettingsState } from "types/network";

export interface SettingsState {
  currency: string;
  locale: Locales;
  theme: Themes;
  periodOffset: number;
  network: NetworkSettingsState;
  phishing: boolean;
  popup: boolean;
  format: boolean;
}
