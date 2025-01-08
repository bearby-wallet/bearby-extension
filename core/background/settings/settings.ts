import type { SettingsState } from "types/settings";

import { CurrenciesController } from "./currencies";
import { LocaleSettings } from "./locale";
import { PhishingDetection } from "./phishing";
import { PeriodOffset } from "./expiry-period";
import { ThemeSettings } from "./theme";
import { BrowserStorage, type StorageKeyValue } from "lib/storage";
import { Fields } from "config/fields";
import { NetworkSettings } from "./network";
import { PopupSettings } from "./popup";
import { FormatSettings } from "./format";

export class SettingsControl {
  readonly currencies = new CurrenciesController();
  readonly locale = new LocaleSettings();
  readonly phishing = new PhishingDetection();
  readonly theme = new ThemeSettings();
  readonly period = new PeriodOffset();
  readonly network = new NetworkSettings();
  readonly popup = new PopupSettings();
  readonly format = new FormatSettings();

  get state(): SettingsState {
    return {
      currency: this.currencies.selected,
      locale: this.locale.selected,
      theme: this.theme.selected,
      network: this.network.state,
      periodOffset: this.period.periodOffset,
      phishing: this.phishing.phishingDetectionEnabled,
      popup: this.popup.enabledPopup,
      format: this.format.enabled,
    };
  }

  async sync() {
    const data = (await BrowserStorage.get(
      Fields.SELECTED_CURRENCY,
      Fields.LOCALE,
      Fields.PHISHING_DETECTION,
      Fields.UI_THEME,
      Fields.PERIOD_OFFSET,
      Fields.NETWORK_SETTINGS,
      Fields.POPUP_ENABLED,
      Fields.FORMAT_ENABLED,
    )) as StorageKeyValue;

    await this.currencies.sync(data[Fields.SELECTED_CURRENCY]);
    await this.locale.sync(data[Fields.LOCALE]);
    await this.phishing.sync(data[Fields.PHISHING_DETECTION]);
    await this.theme.sync(data[Fields.UI_THEME]);
    await this.period.sync(data[Fields.PERIOD_OFFSET]);
    await this.network.sync(data[Fields.NETWORK_SETTINGS]);
    await this.popup.sync(data[Fields.POPUP_ENABLED]);
    await this.format.sync(data[Fields.FORMAT_ENABLED]);
  }

  async reset() {
    await this.currencies.reset();
    await this.locale.reset();
    await this.phishing.reset();
    await this.theme.reset();
    await this.period.reset();
    await this.network.reset();
    await this.popup.reset();
    await this.format.reset();
  }
}
