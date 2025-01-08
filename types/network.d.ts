export interface NetworkConfig {
  [key: string]: {
    PROVIDERS: string[];
    VERSION: number;
    CHAIN_ID: number;
  };
}

export interface NetworkSettingsState {
  downgrade: boolean;
  https: boolean;
  abortTimeout: number;
  numberOfNodes: number;
}

export type Params =
  | object[]
  | string[]
  | number[]
  | (string | string[] | number[])[];

export interface RPCBody {
  id: number;
  jsonrpc: string;
  method: string;
  params: Params;
}
