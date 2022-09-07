import { CurrenciesController } from './currencies';
import { LocaleSettings } from './locale';
import { PhishingDetection } from './phishing';
import { PeriodOffset } from './expiry-period';
import { ThemeSettings } from './theme';
import { BrowserStorage, StorageKeyValue } from "lib/storage";
import { Fields } from 'config/fields';


export class SettingsControl {
  readonly currencies = new CurrenciesController();
  readonly locale = new LocaleSettings();
  readonly phishing = new PhishingDetection();
  readonly theme = new ThemeSettings();
  readonly period = new PeriodOffset();

  get state() {
    return {
      currency: this.currencies.selected,
      locale: this.locale.selected,
      theme: this.theme.selected,
      periodOffset: this.period.periodOffset
    };
  }

  async sync() {
    const data = await BrowserStorage.get(
      Fields.SELECTED_CURRENCY,
      Fields.LOCALE,
      Fields.PHISHING_DETECTION,
      Fields.UI_THEME,
      Fields.PERIOD_OFFSET
    ) as StorageKeyValue;

    await this.currencies.sync(data[Fields.SELECTED_CURRENCY]);
    await this.locale.sync(data[Fields.LOCALE]);
    await this.phishing.sync(data[Fields.PHISHING_DETECTION]);
    await this.theme.sync(data[Fields.UI_THEME]);
    await this.period.sync(data[Fields.PERIOD_OFFSET]);
  }

  async reset() {
    await this.currencies.reset();
    await this.locale.reset();
    await this.phishing.reset();
    await this.theme.reset();
    await this.period.reset();
  }
}
