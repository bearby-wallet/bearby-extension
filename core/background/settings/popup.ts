import { Fields } from "config/fields";
import { BrowserStorage, buildObject } from "lib/storage";


export class PopupSettings {
  #enabledPopup = false;

  get enabledPopup() {
    return this.#enabledPopup;
  }

  async togglePopupEnabled() {
    this.#enabledPopup = !this.enabledPopup;

    await BrowserStorage.set(
      buildObject(Fields.POPUP_ENABLED, String(this.enabledPopup))
    );
  }

  async sync(content?: string | null) {
    if (!content) {
      return this.reset();
    }

    this.#enabledPopup = (content === 'true');
  }

  async reset() {
    this.#enabledPopup = false;

    await BrowserStorage.set(
      buildObject(Fields.POPUP_ENABLED, String(this.enabledPopup))
    );
  }
}
