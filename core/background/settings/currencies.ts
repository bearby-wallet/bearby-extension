import { DEFAULT_CURRENCIES } from 'config/currencies';
import { Fields } from 'config/fields';
import { assert } from 'lib/assert';
import { BrowserStorage, buildObject } from 'lib/storage';
import { INVALID_CURREENCY, SettingsError } from './errors';


export class CurrenciesController {
  #selected = DEFAULT_CURRENCIES[0];

  get selected() {
    return this.#selected;
  }

  async update(newSelected: string) {
    assert(
      DEFAULT_CURRENCIES.includes(newSelected),
      INVALID_CURREENCY,
      SettingsError
    );

    this.#selected = newSelected;

    await BrowserStorage.set(
      buildObject(Fields.SELECTED_CURRENCY, this.selected)
    );
  }

  async sync(content?: string | null) {
    if (!content || !DEFAULT_CURRENCIES.includes(String(content))) {
      return this.reset();
    }

    const selected = String(content);

    this.#selected = selected;
  }

  async reset() {
    this.#selected = DEFAULT_CURRENCIES[0];

    await BrowserStorage.set(
      buildObject(Fields.SELECTED_CURRENCY, this.selected)
    );
  }
}
