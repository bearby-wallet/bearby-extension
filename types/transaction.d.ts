import type { OperationsType } from "background/provider/operations";
import type { KeyValue } from "types/general";
import type { CallParam } from "./contacts";

export interface ConnectionStore {
  domain: string;
  accounts: number[];
}

export interface TransactionToken {
  decimals: number;
  symbol: string;
  base58: string;
}

export interface SignMessageParams {
  domain: string;
  message: string;
  uuid: string;
  title: string;
  icon: string;
  hash?: string;
}

export interface SignedMessage {
  publicKey: string;
  signature: string;
  message: string;
}

export interface MinTransactionParams {
  coins: string;
  amount: string;
  toAddr: string;
  type: OperationsType;
  token: TransactionToken;
  fee?: string;
  maxGas?: string;
  gasLimit?: string; /// TODO: Remove after some time to void break users space.
  //
  icon?: string;
  uuid?: string;
  title?: string;
  domain?: string;
  func?: string;
  bytecode: string; // Bytecode to be executed (potentially deployer) (Base64 str)
  bytecodeToDeploy?: string; // Bytecode to be deployed (Base64 str)
  params?: CallParam[];
  unsafeParams?: string; // in hex string
  maxCoins?: string;
  datastore?: Record<string, string>; // key: value serialized as hex string. used in executeSC
}

export interface ConfirmParams extends MinTransactionParams {
  tokenAmount: string;
  fee: string;
  maxGas: string;
  recipient: string;
}

export interface HistoryTransaction {
  type: OperationsType;
  token: TransactionToken;
  fee: string;
  toAddr: string;
  from: string;
  hash: string;
  tokenAmount: string;
  timestamp: number;
  recipient: string;
  coins: string;
  expiryPeriod: number;
  nextSlot: number;
  period: number;
  confirmed: boolean;
  success: boolean;
  code?: string;
  params?: CallParam[];
  func?: string;
  icon?: string;
  title?: string;
  error?: string;
}
