import type { OperationsType } from "background/provider/operations";

export interface TransactionToken {
  decimals: number;
  symbol: string;
  base58: string;
}

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
  token?: TransactionToken;
}

export interface ConfirmParams extends MinTransactionParams {
  tokenAmount: string;
  fee: number;
  recipient: string;
}

export interface HistoryTransaction {
  type: OperationsType;
  token: TransactionToken;
  fee: number;
  gasLimit: number;
  gasPrice: number;
  toAddr: string;
  from: string;
  hash: string;
  tokenAmount: string;
  timestamp: number;
  recipient: string;
  amount: number;
  code: string;
  params: string;
  expiryPeriod: number;
  nextSlot: number;
  period: number;
  confirmed: boolean;
  success: boolean;
  icon?: string;
  title?: string;
  error?: string;
  teg?: string;
}
