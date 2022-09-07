export interface Token {
  decimals: number;
  rate: number;
  name: string;
  symbol: string;
  base58: string;
}

export interface Balance {
  [key: string]: {
    candidate: string;
    final: string;
    locked: string;
  }
}
