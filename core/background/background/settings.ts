import type { Locales } from "config/locale";
import type { Themes } from "config/theme";
import type { BaseError } from "lib/error";
import type { GasState, StreamResponse } from "types";
import type { BackgroundState } from "./state";


export class BackgroundSettings {
  readonly #core: BackgroundState;

  constructor(state: BackgroundState) {
    this.#core = state;
  }

  async setPeriodOffest(value: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.settings.period.setPeriodOffset(value);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async setNodeDowngrade(flag: boolean, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.settings.network.setDowngrade(flag);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async setGasConfig(config: GasState, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.gas.setConfig(config);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async setLogOutTimer(timer: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.guard.setLogOutTimer(timer);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async togglePopupEnabled(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.settings.popup.togglePopupEnabled();

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async toggleFormatEnabled(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.settings.format.toggleFormatEnabled();

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async setCurrency(currency: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.settings.currencies.update(currency);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async setTheme(theme: Themes, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.settings.theme.setTheme(theme);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async setPthishing(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.settings.phishing.togglePhishing();

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }
  
  async setLocale(locale: Locales, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.settings.locale.setLocale(locale);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

}
