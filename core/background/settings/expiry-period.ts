import { PERIOD_OFFSET } from 'config/common';
import { Fields } from 'config/fields';
import { Locales } from 'config/locale';
import { BrowserStorage, buildObject } from 'lib/storage';


export class PeriodOffset {
  #periodOffset = PERIOD_OFFSET;

  get periodOffset() {
    return this.#periodOffset;
  }

  async setPeriodOffset(newPeriodOffset: number) {
    this.#periodOffset = newPeriodOffset;

    await BrowserStorage.set(
      buildObject(Fields.PERIOD_OFFSET, String(this.periodOffset))
    );
  }

  async sync(content?: string | Number | null) {
    if (!content) {
      return this.reset();
    }

    if (isNaN(Number(content))) {
      return this.reset();
    }

    this.#periodOffset = Number(content);
  }

  async reset() {
    this.#periodOffset = PERIOD_OFFSET;

    await BrowserStorage.set(
      buildObject(Fields.PERIOD_OFFSET, String(this.periodOffset))
    );
  }
}
