import type { Params, RPCBody } from 'types';


export interface ContentWalletData {
  enabled: boolean;
  period: number;
  connected: boolean;
  phishing: boolean;
  net?: string;
  base58?: string;
}

export interface ProxyContentType {
  body: RPCBody[];
  uuid: string;
}
