import { DEFAULT_CURRENCIES } from 'config/currencies';
import { Fields } from 'config/fields';
import { assert } from 'lib/assert';
import { BrowserStorage, buildObject } from 'lib/storage';
import { INVALID_CURREENCY, SettingsError } from './errors';


export class CurrenciesController {
  #currency = DEFAULT_CURRENCIES[0];

  get currency() {
    return this.#currency;
  }

  async update(newSelected: string) {
    assert(
      DEFAULT_CURRENCIES.includes(newSelected),
      INVALID_CURREENCY,
      SettingsError
    );

    this.#currency = newSelected;

    await BrowserStorage.set(
      buildObject(Fields.SELECTED_CURRENCY, this.currency)
    );
  }

  syncCurrency(content?: string | null) {
    if (!content || !DEFAULT_CURRENCIES.includes(String(content))) {
      return this.resetCurrency();
    }

    const selected = String(content);

    this.#currency = selected;
  }

  async resetCurrency() {
    this.#currency = DEFAULT_CURRENCIES[0];

    await BrowserStorage.set(
      buildObject(Fields.SELECTED_CURRENCY, this.currency)
    );
  }
}
