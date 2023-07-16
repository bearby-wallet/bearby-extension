import type { KeyValue } from "types/general";
import type { CallParam } from "types/contacts";

import { utils } from "aes-js";
import { toByteArray } from "base64-js";
import { base58Decode, isBase58Address } from "lib/address";
import { assert } from "lib/assert";
import { VarintEncode } from 'lib/varint';
import { INVLID_RECIPIENT } from "./errors";
import { OperationsType } from "./operations";
import { ADDRESS_PREFIX, CONTRACT_ADDRESS_PREFIX, VERSION_NUMBER } from "config/common";
import { Args, parseParams } from "lib/args";


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
    const amount = new VarintEncode().encode(this.amount);
    let recipient = (await base58Decode(this.recipientAddress.slice(ADDRESS_PREFIX.length)));

    recipient = Uint8Array.from([VERSION_NUMBER, ...recipient]);

    return Uint8Array.from([
      ...fee,
      ...expirePeriod,
      ...typeIdEncoded,
      ...recipient,
      ...amount
    ]);
  }
}

export class BuyRollsBuild {
  static operation = OperationsType.RollBuy;

  fee: number;
  amount: number;
  expirePeriod: number;

  constructor(
    fee: number,
    amount: number,
    expirePeriod: number
  ) {
    this.fee = fee;
    this.amount = amount;
    this.expirePeriod = expirePeriod;
  }

  async bytes() {
    const fee = new VarintEncode().encode(this.fee);
    const expirePeriod = new VarintEncode().encode(this.expirePeriod);
    const typeIdEncoded = new VarintEncode().encode(BuyRollsBuild.operation);
    const amount = new VarintEncode().encode(this.amount);

    return Uint8Array.from([
      ...fee,
      ...expirePeriod,
      ...typeIdEncoded,
      ...amount
    ]);
  }
}

export class SellRollsBuild {
  static operation = OperationsType.RollSell;

  fee: number;
  amount: number;
  expirePeriod: number;

  constructor(
    fee: number,
    amount: number,
    expirePeriod: number
  ) {
    this.fee = fee;
    this.amount = amount;
    this.expirePeriod = expirePeriod;
  }

  async bytes() {
    const fee = new VarintEncode().encode(this.fee);
    const expirePeriod = new VarintEncode().encode(this.expirePeriod);
    const typeIdEncoded = new VarintEncode().encode(SellRollsBuild.operation);
    const amount = new VarintEncode().encode(this.amount);

    return Uint8Array.from([
      ...fee,
      ...expirePeriod,
      ...typeIdEncoded,
      ...amount
    ]);
  }
}

export class ExecuteSmartContractBuild {
  static operation = OperationsType.ExecuteSC;

  contractDataBase64: string;
  gasLimit: number;
  fee: number;
  expirePeriod: number;
  datastore = new Map<Uint8Array, Uint8Array>();

  constructor(
    fee: number,
    expirePeriod: number,
    contractDataBase64: string,
    gasLimit: number,
    datastore?: KeyValue<string>
  ) {
    this.contractDataBase64 = contractDataBase64;
    this.gasLimit = Number(gasLimit);
    this.fee = Number(fee);
    this.expirePeriod = Number(expirePeriod);

    if (datastore) {
      for (const key in datastore) {
        const element = datastore[key];
        this.datastore.set(
          utils.utf8.toBytes(key),
          utils.utf8.toBytes(element)
        );
      }
    }
  }

  bytes() {
    const decodedScBinaryCode = toByteArray(this.contractDataBase64);
    const dataLengthEncoded = new VarintEncode().encode(decodedScBinaryCode.length);
    const feeEncoded = new VarintEncode().encode(this.fee);
    const expirePeriodEncoded = new VarintEncode().encode(this.expirePeriod);
    const typeIdEncoded = new VarintEncode().encode(ExecuteSmartContractBuild.operation);
    const maxGasEncoded = new VarintEncode().encode(this.gasLimit);
    let datastoreSerialized = new Uint8Array();

    for (let [encodedKeyBytes, encodedValueBytes] of this.datastore) {
      const encodedKeyLen = new VarintEncode().encode(encodedKeyBytes.length);
      const encodedValueLen = new VarintEncode().encode(encodedValueBytes.length);

      datastoreSerialized = Uint8Array.from([
        ...datastoreSerialized,
        ...encodedKeyLen,
        ...encodedKeyBytes,
        ...encodedValueLen,
        ...encodedValueBytes
      ]);
    }

    const datastoreSerializedLen = new VarintEncode().encode(this.datastore.size);

    return Uint8Array.from([
      ...feeEncoded,
      ...expirePeriodEncoded,
      ...typeIdEncoded,
      ...maxGasEncoded,
      ...dataLengthEncoded,
      ...decodedScBinaryCode,
      ...datastoreSerializedLen,
      ...datastoreSerialized
    ]);
  }
}

export class CallSmartContractBuild {
  static operation = OperationsType.CallSC;

  functionName: string;
  gasLimit: number;
  coins: number;
  gasPrice: number;
  fee: number;
  targetAddress: string;
  expirePeriod: number;

  args: Args;

  constructor(
    functionName: string,
    parameters: CallParam[],
    fee: number,
    expirePeriod: number,
    gasLimit: number,
    gasPrice: number,
    coins: string,
    targetAddress: string
  ) {
    this.functionName = functionName;
    this.gasLimit = gasLimit;
    this.coins = Number(coins);
    this.gasPrice = gasPrice;
    this.fee = fee;
    this.expirePeriod = expirePeriod;
    this.targetAddress = targetAddress;
    this.args = parseParams(parameters);
  }

  async bytes() {
    assert(await isBase58Address(this.targetAddress), INVLID_RECIPIENT);

    const fee = new VarintEncode().encode(this.fee);
    const expirePeriod = new VarintEncode().encode(this.expirePeriod);
    const typeIdEncoded = new VarintEncode().encode(CallSmartContractBuild.operation);
    const targetAddressEncoded = Uint8Array.from([1, ...(await base58Decode(this.targetAddress.slice(CONTRACT_ADDRESS_PREFIX.length))).slice(1)]);
    const coinsEncoded = new VarintEncode().encode(this.coins);
    const gasLimit = new VarintEncode().encode(this.gasLimit);
    const functionNameEncoded = utils.utf8.toBytes(this.functionName);
    const parametersEncoded = this.args.serialize();
    const functionNameLengthEncoded = new VarintEncode().encode(functionNameEncoded.length);
    const parametersLengthEncoded = new VarintEncode().encode(parametersEncoded.length);

    return Uint8Array.from([
      ...fee,
      ...expirePeriod,
      ...typeIdEncoded,
      ...gasLimit,
      ...coinsEncoded,
      ...targetAddressEncoded,
      ...functionNameLengthEncoded,
      ...functionNameEncoded,
      ...parametersLengthEncoded,
      ...parametersEncoded
    ]);
  }
}
