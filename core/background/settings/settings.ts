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

  async sync() {
    const data = await BrowserStorage.get(
      Fields.SELECTED_CURRENCY,
      Fields.LOCALE,
      Fields.PHISHING_DETECTION,
      Fields.UI_THEME
    ) as StorageKeyValue;

    await this.currencies.syncCurrency(data[Fields.SELECTED_CURRENCY]);
    await this.locale.syncLocale(data[Fields.LOCALE]);
    await this.phishing.syncPhishing(data[Fields.PHISHING_DETECTION]);
    await this.theme.syncTheme(data[Fields.UI_THEME]);
  }
}
