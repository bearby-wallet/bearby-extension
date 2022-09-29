export interface TransactionParam {
  recipient: string;
  fee: number;
  contractDataBase64: string;
  parameters: string;
  amount: number;
  gasPrice: number;
}
