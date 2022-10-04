import { CurrenciesController } from './currencies';
import { LocaleSettings } from './locale';
import { PhishingDetection } from './phishing';
import { PeriodOffset } from './expiry-period';
import { ThemeSettings } from './theme';
import { BrowserStorage, StorageKeyValue } from "lib/storage";
import { Fields } from 'config/fields';
import { NetworkSettings } from './network';


export class SettingsControl {
  readonly currencies = new CurrenciesController();
  readonly locale = new LocaleSettings();
  readonly phishing = new PhishingDetection();
  readonly theme = new ThemeSettings();
  readonly period = new PeriodOffset();
  readonly network = new NetworkSettings();

  get state() {
    return {
      currency: this.currencies.selected,
      locale: this.locale.selected,
      theme: this.theme.selected,
      downgradeNode: this.network.downgrade,
      periodOffset: this.period.periodOffset,
      phishing: this.phishing.phishingDetectionEnabled
    };
  }

  async sync() {
    const data = await BrowserStorage.get(
      Fields.SELECTED_CURRENCY,
      Fields.LOCALE,
      Fields.PHISHING_DETECTION,
      Fields.UI_THEME,
      Fields.PERIOD_OFFSET,
      Fields.NETWORK_DOWNGRADE
    ) as StorageKeyValue;

    await this.currencies.sync(data[Fields.SELECTED_CURRENCY]);
    await this.locale.sync(data[Fields.LOCALE]);
    await this.phishing.sync(data[Fields.PHISHING_DETECTION]);
    await this.theme.sync(data[Fields.UI_THEME]);
    await this.period.sync(data[Fields.PERIOD_OFFSET]);
    await this.network.sync(data[Fields.NETWORK_DOWNGRADE]);
  }

  async reset() {
    await this.currencies.reset();
    await this.locale.reset();
    await this.phishing.reset();
    await this.theme.reset();
    await this.period.reset();
    await this.network.reset();
  }
}
