import { utils } from "aes-js";
import { toByteArray } from "base64-js";
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

export class ExecuteSmartContractBuild {
  static operation = OperationsType.ExecuteSC;

  contractByteCode: Uint8Array;
  byteCodeLength: Uint8Array;
  gasLimit: number;
  amount: number;
  gasPrice: number;
  fee: number;
  expirePeriod: number

  constructor(
    fee: number,
    expirePeriod: number,
    contractDataBase64: string,
    gasLimit: number,
    amount: number,
    gasPrice: number
  ) {
    this.contractByteCode = toByteArray(contractDataBase64);
    this.byteCodeLength = new VarintEncode().encode(this.contractByteCode.length);
    this.gasLimit = gasLimit;
    this.amount = amount;
    this.gasPrice = gasPrice;
    this.fee = fee;
    this.expirePeriod = expirePeriod;
  }

  async bytes() {
    const fee = new VarintEncode().encode(this.fee);
		const expirePeriod = new VarintEncode().encode(this.expirePeriod);
		const typeIdEncoded = new VarintEncode().encode(ExecuteSmartContractBuild.operation);
    const amount = new VarintEncode().encode(this.amount);
    const gasPrice = new VarintEncode().encode(this.gasPrice);
    const gasLimit = new VarintEncode().encode(this.gasLimit);

    return Uint8Array.from([
      ...fee,
      ...expirePeriod,
      ...typeIdEncoded,
      ...gasLimit,
      ...amount,
      ...gasPrice,
      ...this.byteCodeLength,
      ...this.contractByteCode
    ]);
  }
}

export class CallSmartContractBuild {
  static operation = OperationsType.CallSC;

  functionByteCode: Uint8Array;
  functionByteCodeLength: Uint8Array;
  parametersByteCode: Uint8Array;
  parametersByteCodeLength: Uint8Array;

  gasLimit: number;
  parallelCoins: number;
  sequentialCoins: number;
  gasPrice: number;
  fee: number;
  recipientAddress: string;
  expirePeriod: number

  constructor(
    functionName: string,
    parameters: string,
    fee: number,
    expirePeriod: number,
    gasLimit: number,
    parallelCoins: number,
    sequentialCoins: number,
    gasPrice: number,
    recipientAddress: string
  ) {
    this.functionByteCode = utils.utf8.toBytes(functionName);
    this.functionByteCodeLength = new VarintEncode().encode(this.functionByteCode.length);

    this.parametersByteCode = utils.utf8.toBytes(parameters);
    this.parametersByteCodeLength = new VarintEncode().encode(this.parametersByteCode.length);

    this.gasLimit = gasLimit;
    this.parallelCoins = parallelCoins;
    this.sequentialCoins = sequentialCoins;
    this.gasPrice = gasPrice;
    this.fee = fee;
    this.expirePeriod = expirePeriod;
    this.recipientAddress = recipientAddress;
  }

  async bytes() {
    assert(await isBase58Address(this.recipientAddress), INVLID_RECIPIENT);

    const fee = new VarintEncode().encode(this.fee);
		const expirePeriod = new VarintEncode().encode(this.expirePeriod);
		const typeIdEncoded = new VarintEncode().encode(PaymentBuild.operation);
    const recipient = (await base58Decode(this.recipientAddress.slice(1))).slice(1);
    const parallelCoins = new VarintEncode().encode(this.parallelCoins);
    const sequentialCoins = new VarintEncode().encode(this.sequentialCoins);
    const gasPrice = new VarintEncode().encode(this.gasPrice);
    const gasLimit = new VarintEncode().encode(this.gasLimit);

    return Uint8Array.from([
      ...fee,
      ...expirePeriod,
      ...typeIdEncoded,
      ...gasLimit,
      ...parallelCoins,
      ...sequentialCoins,
      ...gasPrice,
      ...recipient,
      ...this.functionByteCodeLength,
      ...this.functionByteCode,
      ...this.parametersByteCodeLength,
      ...this.parametersByteCode
    ]);
  }
}
