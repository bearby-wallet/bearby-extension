
import type { BaseError } from "lib/error";
import type { StreamResponse } from "types";
import type { BackgroundState } from "./state";


export class BackgroundTokens {
  readonly #core: BackgroundState;

  constructor(state: BackgroundState) {
    this.#core = state;
  }

  async getFTStates(addresses: string[], sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      const states = await this.#core.tokens.tokenfetch(addresses);

      return sendResponse({
        resolve: states
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

}
