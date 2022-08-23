import type { AccountTypes } from 'config/account-type';

export interface Account {
  name: string;
  index: number;
  type: AccountTypes;
  base16: string;
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
