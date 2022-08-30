import type { RPCBody, Params } from 'types';


export class HttpProvider {
  readonly #rpc = {
    id: 0,
    jsonrpc: '2.0'
  };

  json(...rpcBody: RPCBody[]) {
    let body = JSON.stringify(rpcBody);

    return {
      body,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }

  buildBody(method: string, params: Params) {
    return {
      ...this.#rpc,
      method,
      params
    };
  }
}
