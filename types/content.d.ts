import type { Params, RPCBody } from 'types';


export interface ContentWalletData {
  enabled: boolean;
  net?: string;
  smartRequest: boolean;
  connected: boolean;
  phishing: boolean;
  providers: string[];
  base58?: string;
}

export interface ProxyContentType {
  body: RPCBody[];
  uuid: string;
}
