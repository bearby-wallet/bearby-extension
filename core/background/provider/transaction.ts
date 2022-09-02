import { base58Decode, isBase58Address } from "lib/address";
import { assert } from "lib/assert";
import { VarintEncode } from 'lib/varint';
import { INVLID_RECIPIENT } from "./errors";
import { OperationsType } from "./operations";


export class PaymentBuild {
  static operation = OperationsType.Payment;

  fee: number;
  amount: number;
  recipientAddress: string;
  expirePeriod: number;

  constructor(
    fee: number,
    amount: number,
    recipientAddress: string,
    expirePeriod: number
  ) {
    this.fee = fee;
    this.amount = amount;
    this.recipientAddress = recipientAddress;
    this.expirePeriod = expirePeriod;
  }

  async bytes() {
    assert(await isBase58Address(this.recipientAddress), INVLID_RECIPIENT);

		const fee = new VarintEncode().encode(this.fee);
		const expirePeriod = new VarintEncode().encode(this.expirePeriod);
		const typeIdEncoded = new VarintEncode().encode(PaymentBuild.operation);
    const recipient = (await base58Decode(this.recipientAddress.slice(1))).slice(1);
    const amount = new VarintEncode().encode(this.amount);

    return Uint8Array.from([
      ...fee,
      ...expirePeriod,
      ...typeIdEncoded,
      ...recipient,
      ...amount
    ]);
  }
}
