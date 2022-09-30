export interface TransactionParam {
  recipient: string;
  contractDataBase64: string;
  parameters: string;
  amount: number;
  gasPrice: number;
  gasLimit: number;
  icon?: string;
  uuid?: string;
  title?: string;
}
