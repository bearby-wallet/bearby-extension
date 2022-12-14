import type { AccountTypes } from 'config/account-type';
import type { Balance } from './token';
import type { ShaAlgorithms } from "config/sha-algorithms";


export interface Account {
  name: string;
  index: number;
  type: AccountTypes;
  base58: string;
  privKey?: string;
  pubKey: string;
  productId?: number;
  tokens: Balance;
  nft: {
    [key: string]: object[];
  };
}

export interface Wallet {
  selectedAddress: number;
  identities: Account[];
}

export interface KeyPair {
  pubKey: Uint8Array;
  privKey: Uint8Array;
  base58: string;
}

export interface GuardType {
  isEnable: boolean;
  isReady: boolean;
  algorithm: ShaAlgorithms;
  iteractions: number;
};

export interface WordsPayloadToEncrypt {
  words: string;
  password: string;
  name: string;
  algorithm: string;
  iteractions: number;
}

export interface SetPasswordPayload {
  password: string;
  current: string;
  algorithm: string;
  iteractions: number;
}

export interface KeyAccountPayload {
  name: string;
  key: string;
}
