import type { BaseError } from "lib/error";
import type { StreamResponse } from "types";
import type { BackgroundState } from "./state";


export class BackgroundNetwork {
  readonly #core: BackgroundState;

  constructor(state: BackgroundState) {
    this.#core = state;
  }

  async selectNetwork(net: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.netwrok.setNetwork(net);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      console.error(err);
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }
}
