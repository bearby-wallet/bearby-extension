export interface WalletState {
  guard: {
    isEnable: boolean;
    isReady: boolean;
  };
  settings: {
      currency: string;
      locale: Locales;
      theme: Themes;
      periodOffset: number;
  };
  netwrok: string;
  wallet: Wallet;
  tokens: Token[];
}
