import type { BaseError } from "lib/error";
import type { StreamResponse } from "types";
import type { BackgroundState } from "./state";


export class BackgroundSettings {
  readonly #core: BackgroundState;

  constructor(state: BackgroundState) {
    this.#core = state;
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

}
