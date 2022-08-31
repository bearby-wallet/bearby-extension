
import type {
  RPCBody,
  JsonRPCResponseNodeStatus,
  JsonRPCResponseNodeStatusAddresses,
  JsonRPCResponseStakers
} from 'types';
import type { NetworkControl } from "background/network";

import { HttpProvider } from "./http";
import { REQUEST_FALLED, MassaHttpError } from './errors';
import { JsonRPCRequestMethods } from './methods';


export class MassaControl {
  #network: NetworkControl;

  readonly provider = new HttpProvider();

  constructor(network: NetworkControl) {
    this.#network = network;
  }

  async getNodesStatus(): Promise<JsonRPCResponseNodeStatus[]> {
    const body = this.provider.buildBody(JsonRPCRequestMethods.GET_STATUS, []);
    return await this.sendJson(body);
  }

  async getAddresses(...addresses: string[]): Promise<JsonRPCResponseNodeStatusAddresses[]> {
    const body = this.provider.buildBody(JsonRPCRequestMethods.GET_ADDRESSES, [addresses]);
    return await this.sendJson(body);
  }

  async getBlocks(...blocks: string[]) {
    //  TODO: write type interface.
    const body = this.provider.buildBody(JsonRPCRequestMethods.GET_BLOCKS, [blocks]);
    return await this.sendJson(body);
  }

  async getStakers(): Promise<JsonRPCResponseStakers[]> {
    const body = this.provider.buildBody(JsonRPCRequestMethods.GET_STAKERS, []);
    return await this.sendJson(body);
  }

  async sendJson(...body: RPCBody[]) {
    const request = this.provider.json(...body);

    for (const provider of this.#network.providers) {
      try {
        const responce = await fetch(provider, request);
        if (!responce.ok) {
          continue;
        }
        const data = await responce.json();
        return data;
      } catch(err) {
        await this.#network.downgradeNodeStatus(provider);
        continue;
      }
    }

    throw new MassaHttpError(REQUEST_FALLED);
  }
}
