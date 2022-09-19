export interface NetwrokConfig {
  [key: string]: {
    PROVIDERS: string[];
    VERSION: number;
    LIMIT: number;
  };
}

export type Params = object[] | string[] | number[] | (string | string[] | number[])[];

export interface RPCBody {
  id: number;
  jsonrpc: string;
  method: string;
  params: Params;
};
