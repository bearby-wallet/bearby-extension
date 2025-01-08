import type { GasState } from "types/gas";

import { Fields } from "config/fields";
import { BrowserStorage, buildObject } from "lib/storage";
import { GAS_LIMIT, MULTIPLIER } from "config/gas";
import { TypeOf } from "lib/type";
import {
  GasError,
  INVALID_STATE,
  INVALID_GAS_LIMIT,
  INVALID_MULTIPLIER,
} from "./errors";

export class GasControl {
  #gasLimit = GAS_LIMIT;
  #multiplier = MULTIPLIER;

  get state(): GasState {
    return {
      gasLimit: this.#gasLimit,
      multiplier: this.#multiplier,
    };
  }

  get fee(): number {
    return this.#gasLimit * this.#multiplier;
  }

  async setGasLimit(gasLimit: number) {
    const state = this.state;

    this.#checkState(state);
    this.#gasLimit = gasLimit;

    await BrowserStorage.set(buildObject(Fields.GAS, this.state));
  }

  async setConfig(state: GasState) {
    this.#checkState(state);

    this.#gasLimit = state.gasLimit;
    this.#multiplier = state.multiplier;

    await BrowserStorage.set(buildObject(Fields.GAS, this.state));
  }

  async sync() {
    const jsonState = await BrowserStorage.get(Fields.GAS);

    try {
      const state: GasState = JSON.parse(String(jsonState));

      this.#checkState(state);

      this.#gasLimit = state.gasLimit;
      this.#multiplier = state.multiplier;
    } catch {
      await this.reset();
    }
  }

  async reset() {
    this.#gasLimit = GAS_LIMIT;
    this.#multiplier = MULTIPLIER;

    await BrowserStorage.set(buildObject(Fields.GAS, this.state));
  }

  #checkState(state: GasState) {
    if (!state || !TypeOf.isObject(state)) {
      throw new GasError(INVALID_STATE);
    }

    if (!state.gasLimit) {
      throw new GasError(INVALID_GAS_LIMIT);
    }

    if (!state.multiplier) {
      throw new GasError(INVALID_MULTIPLIER);
    }

    if (state.gasLimit < GAS_LIMIT) {
      throw new GasError(INVALID_GAS_LIMIT);
    }
  }
}
