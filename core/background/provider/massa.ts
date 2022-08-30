import type { RPCBody } from 'types';
import type { NetworkControl } from "background/network";

import { HttpProvider } from "./http";
import { assert } from 'lib/assert';
import { REQUEST_FALLED, MassaHttpError } from './errors';
import { JsonRPCRequestMethods } from './methods';


export class MassaControl {
  #network: NetworkControl;

  readonly provider = new HttpProvider();

  constructor(network: NetworkControl) {
    this.#network = network;
  }

  async sendJson(...body: RPCBody[]) {
    const request = this.provider.json(...body);

    for (const provider of this.#network.providers) {
      try {
        const responce = await fetch(provider, request);
        const data = await responce.json();
    
        return data;
      } catch {
        /// TODO: add sort for providers.
        continue;
      }
    }

    throw new MassaHttpError(REQUEST_FALLED);
  }
}
