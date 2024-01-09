import type { NetworkSettingsState, NetworkConfig } from 'types';


export const NETWORK: NetworkConfig = Object.freeze({
  mainnet: {
    PROVIDERS: ['https://mainnet.massa.net/api/v2'],
    VERSION: 0,
    CHAIN_ID: 77658377
  },
  buildnet: {
    PROVIDERS: ['https://buildnet.massa.net/api/v2'],
    VERSION: 0,
    CHAIN_ID: 77658366
  },
  custom: {
    PROVIDERS: ['http://127.0.0.1:33035'],
    VERSION: 0,
    CHAIN_ID: 77
  }
});
export const NETWORK_INIT_STATE: NetworkSettingsState = {
  downgrade: true,
  https: false,
  abortTimeout: 8000,
  numberOfNodes: 100
};
export const NETWORK_KEYS = Object.keys(NETWORK);
export const NODE_PORT = 33035;
