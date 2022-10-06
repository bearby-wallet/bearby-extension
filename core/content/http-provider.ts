import type { RPCBody } from "types/network";

import { HttpProvider } from "lib/http";
import { NODE_IS_DOWN } from "./errors";
import type { JsonRPCResponse } from "types/massa";


export class ContentProvider extends HttpProvider {

  smartRequest: boolean;
  providers: string[];

  constructor(smartRequest: boolean, providers: string[]) {
    super();
    this.smartRequest = smartRequest;
    this.providers = providers;
  }

  async sendJson(...body: RPCBody[]) {
    const request = this.json(...body);

    for (const provider of this.providers) {
      try {
        const responce = await fetch(provider, request);
        if (!responce.ok) {
          if (this.smartRequest) {
            continue;
          } else {
            throw new Error(NODE_IS_DOWN);
          }
        }
        const data = await responce.json();
        return data;
      } catch(err) {
        if (this.smartRequest) {
          continue;
        } else {
          throw err;
        }
      }
    }

    throw new Error(NODE_IS_DOWN);
  }
}
