import { CurrenciesController } from './currencies';
import { LocaleSettings } from './locale';
import { PhishingDetection } from './phishing';
import { ThemeSettings } from './theme';
import { BrowserStorage, buildObject, StorageKeyValue } from "lib/storage";
import { Fields } from 'config/fields';


export class SettingsControl {
  readonly currencies = new CurrenciesController();
  readonly locale = new LocaleSettings();
  readonly phishing = new PhishingDetection();
  readonly theme = new ThemeSettings();

  get state() {
    return {
      currency: this.currencies.selected,
      locale: this.locale.selected,
      theme: this.theme.selected
    };
  }

  async sync() {
    const data = await BrowserStorage.get(
      Fields.SELECTED_CURRENCY,
      Fields.LOCALE,
      Fields.PHISHING_DETECTION,
      Fields.UI_THEME
    ) as StorageKeyValue;

    await this.currencies.sync(data[Fields.SELECTED_CURRENCY]);
    await this.locale.sync(data[Fields.LOCALE]);
    await this.phishing.sync(data[Fields.PHISHING_DETECTION]);
    await this.theme.sync(data[Fields.UI_THEME]);
  }

  async reset() {
    await this.currencies.reset();
    await this.locale.reset();
    await this.phishing.reset();
    await this.theme.reset();
  }
}
