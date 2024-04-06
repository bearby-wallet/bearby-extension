
import type { BaseError } from "lib/error";
import type { StreamResponse, TokenRes } from "types";
import type { BackgroundState } from "./state";


export class BackgroundTokens {
  readonly #core: BackgroundState;

  constructor(state: BackgroundState) {
    this.#core = state;
  }

  async addFTToken(state: TokenRes, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.tokens.addFT(state);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async removeFTStates(index: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.tokens.removeFT(index);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
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
