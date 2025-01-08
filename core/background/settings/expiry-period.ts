import { PERIOD_OFFSET } from "config/common";
import { Fields } from "config/fields";
import { assert } from "lib/assert";
import { BrowserStorage, buildObject } from "lib/storage";
import { INVALID_PERIOD, SettingsError } from "./errors";

export class PeriodOffset {
  #periodOffset = PERIOD_OFFSET;

  get periodOffset() {
    return this.#periodOffset;
  }

  async setPeriodOffset(newPeriodOffset: number) {
    assert(newPeriodOffset > 0, INVALID_PERIOD, SettingsError);

    this.#periodOffset = newPeriodOffset;

    await BrowserStorage.set(
      buildObject(Fields.PERIOD_OFFSET, String(this.periodOffset)),
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
      buildObject(Fields.PERIOD_OFFSET, String(this.periodOffset)),
    );
  }
}
