import { Fields } from "config/fields";
import { BrowserStorage, buildObject } from "lib/storage";


export class FormatSettings {
  #enabled = true;

  get enabled() {
    return this.#enabled;
  }

  async toggleFormatEnabled() {
    this.#enabled = !this.enabled;

    await BrowserStorage.set(
      buildObject(Fields.FORMAT_ENABLED, String(this.enabled))
    );
  }

  async sync(content?: string | null) {
    if (!content) {
      return this.reset();
    }

    this.#enabled = (content === 'true');
  }

  async reset() {
    this.#enabled = true;

    await BrowserStorage.set(
      buildObject(Fields.FORMAT_ENABLED, String(this.enabled))
    );
  }
}
