import { Fields } from 'config/fields';
import { Locales } from 'config/locale';
import { BrowserStorage, buildObject } from 'lib/storage';


export class LocaleSettings {
  #selected = Locales.Auto;

  get selected() {
    return this.#selected;
  }

  async setLocale(newLocale: Locales) {
    this.#selected = newLocale;

    await BrowserStorage.set(
      buildObject(Fields.LOCALE, this.selected)
    );
  }

  async sync(content?: string | Locales | null) {
    if (!content) {
      return this.reset();
    }

    this.#selected = content as Locales;
  }

  async reset() {
    this.#selected = Locales.Auto;

    await BrowserStorage.set(
      buildObject(Fields.LOCALE, this.selected)
    );
  }
}
