import type { RPCBody, Params } from 'types';


export class HttpProvider {
  readonly rpc = {
    id: 0,
    jsonrpc: '2.0'
  };

  json(...rpcBody: RPCBody[]) {
    const body = JSON.stringify(rpcBody);
    const headers = new Headers();

    headers.append("Content-Type", "application/json");
    headers.append("Access-Control-Allow-Origin", "*");

    return {
      body,
      headers,
      method: 'POST'
    };
  }

  buildBody(method: string, params: Params) {
    return {
      ...this.rpc,
      method,
      params
    };
  }
}
