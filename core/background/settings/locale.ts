import { Fields } from 'config/fields';
import { Locales } from 'config/locale';
import { BrowserStorage, buildObject } from 'lib/storage';


export class ThemeSettings {
  #locale = Locales.Auto;

  get locale() {
    return this.#locale;
  }

  async setLocale(newLocale: Locales) {
    this.#locale = newLocale;

    await BrowserStorage.set(
      buildObject(Fields.LOCALE, this.locale)
    );
  }

  async syncLocale(content?: string | Locales | null) {
    if (!content) {
      return this.resetLocale();
    }

    this.#locale = content as Locales;
  }

  async resetLocale() {
    this.#locale = Locales.Auto;

    await BrowserStorage.set(
      buildObject(Fields.LOCALE, this.locale)
    );
  }
}
