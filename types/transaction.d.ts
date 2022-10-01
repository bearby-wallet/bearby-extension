import type { OperationsType } from "background/provider/operations";


export interface MinTransactionParams {
  code: string;
  params: string;
  amount: number;
  gasPrice: number;
  gasLimit: number;
  toAddr: string;
  type: OperationsType;
  //
  icon?: string;
  uuid?: string;
  title?: string;
  token?: {
    decimals: number;
    symbol: string;
    base58: string;
  };
}

export interface ConfirmParams extends MinTransactionParams {
  tokenAmount: string;
  fee: number;
  recipient: string;
}
