import type { Params } from 'types';


export interface ContentWalletData {
  enabled: boolean;
  smartRequest: boolean;
  connected: boolean;
  phishing: boolean;
  providers: string[];
  base58?: string;
}

export interface ProxyContentType {
  params: Params;
  method: string;
  uuid: string;
}
