import type { NetwrokConfig } from 'types';
import { COUNT_NODES } from './common';


export const NETWORK: NetwrokConfig = {
  mainnet: {
    PROVIDERS: ['https://massa.net/api/v2'],
    VERSION: 0,
    LIMIT: COUNT_NODES
  },
  testnet: {
    PROVIDERS: ['https://test.massa.net/api/v2'],
    VERSION: 0,
    LIMIT: COUNT_NODES
  },
  custom: {
    PROVIDERS: ['http://127.0.0.1:33035'],
    VERSION: 0,
    LIMIT: COUNT_NODES
  }
}
export const NETWORK_KEYS = Object.keys(NETWORK);
