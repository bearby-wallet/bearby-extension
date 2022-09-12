import type { AccountTypes } from 'config/account-type';

export interface Account {
  name: string;
  index: number;
  type: AccountTypes;
  base58: string;
  privKey?: string;
  pubKey: string;
  productId?: number;
  tokens: {
    [key: string]: string;
  };
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
};

interface WordsPayloadToEncrypt {
  words: string;
  password: string;
  name: string;
}
