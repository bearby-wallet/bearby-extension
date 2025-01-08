import type { SettingsState } from "types/settings";

import { PERIOD_OFFSET } from "config/common";
import { Locales } from "config/locale";
import { Themes } from "config/theme";
import { writable } from "svelte/store";

export default writable<SettingsState>({
  currency: "usd",
  locale: Locales.Auto,
  periodOffset: PERIOD_OFFSET,
  theme: Themes.System,
  phishing: true,
  network: {
    downgrade: false,
    https: false,
    abortTimeout: 0,
    numberOfNodes: 0,
  },
  popup: true,
  format: true,
});
