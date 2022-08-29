import type { NetwrokConfig } from 'types';


export const NETWORK: NetwrokConfig = {
  mainnet: {
    PROVIDER: 'https://massa.net/api/v2'
  },
  testnet: {
    PROVIDER: 'https://test.massa.net/api/v2'
  },
  custom: {
    PROVIDER: 'http://127.0.0.1:33034'
  }
}
export const NETWORK_KEYS = Object.keys(NETWORK);
