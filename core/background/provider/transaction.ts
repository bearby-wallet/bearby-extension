import type { CallParam } from "types/contacts";

import { utils } from "aes-js";
import { toByteArray } from "base64-js";
import { base58Decode, isBase58Address } from "lib/address";
import { assert } from "lib/assert";
import { VarintEncode } from 'lib/varint';
import { INVLID_RECIPIENT } from "./errors";
import { OperationsType } from "./operations";
import { ADDRESS_PREFIX, CONTRACT_VERSION_NUMBER, VERSION_NUMBER } from "config/common";
import { Args, parseParams } from "lib/args";
import { u64ToBytes, u8toByte } from "lib/args/numbers";


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

  code: Uint8Array;
  deployer: Uint8Array;
  maxGas: bigint;
  fee: bigint;
  maxCoins: bigint;
  coins: bigint;
  expirePeriod: number;
  datastore = new Map<Uint8Array, Uint8Array>();

  constructor(
    fee: bigint,
    maxGas: bigint,
    maxCoins: bigint,
    coins: bigint,
    expirePeriod: number,
    code: string, // as Base58
    deployer: string, // deployer contract as base58.
    parameters?: CallParam[]
  ) {
    this.fee = fee;
    this.maxGas = maxGas;
    this.coins = coins;
    this.maxCoins = maxCoins;
    this.expirePeriod = expirePeriod;
    this.code = toByteArray(code);
    this.deployer = toByteArray(deployer);

    const datastore = new Map<Uint8Array, Uint8Array>();

    datastore.set(
      new Uint8Array([0x00]),
      u64ToBytes(1n),
    );

    datastore.set(u64ToBytes(1n), this.code);

    if (parameters && parameters.length > 0) {
      const args = parseParams(parameters);

      datastore.set(
        Uint8Array.from(
          new Args()
            .addU64(1n)
            .addUint8Array(u8toByte(0))
            .serialize(),
        ),
        Uint8Array.from(args.serialize())
      );
    }

    if (coins > 0n) {
      datastore.set(
        new Uint8Array(
          new Args()
            .addU64(BigInt(1))
            .addUint8Array(u8toByte(1))
            .serialize()
        ),
        u64ToBytes(coins)
      );
    }

    this.datastore = datastore;
  }

  bytes() {
    const feeEncoded = new VarintEncode().encode(Number(this.fee)); // TODO: Replace encode to bigint.
    const maxGasEncoded = new VarintEncode().encode(Number(this.maxGas)); // TODO: Replace encode to bigint.
    const maxCoinEncoded = new VarintEncode().encode(Number(this.maxCoins)); // TODO: Replace encode to bigint.
    const expirePeriodEncoded = new VarintEncode().encode(this.expirePeriod);
    const typeIdEncoded = new VarintEncode().encode(ExecuteSmartContractBuild.operation);
    const dataLengthEncoded = new VarintEncode().encode(this.deployer.length);

    // smart contract operation datastore
    const datastoreKeyMap = this.datastore;
    let datastoreSerializedBuffer = new Uint8Array();

    for (const [key, value] of datastoreKeyMap) {
      const encodedKeyLen = new VarintEncode().encode(key.length);
      const encodedValueLen = new VarintEncode().encode(value.length);

      datastoreSerializedBuffer = Uint8Array.from([
        ...datastoreSerializedBuffer,
        ...encodedKeyLen,
        ...key,
        ...encodedValueLen,
        ...value
      ]);
    }

    const datastoreSerializedBufferLen = new VarintEncode().encode(this.datastore.size);

    return Uint8Array.from([
      ...feeEncoded,
      ...expirePeriodEncoded,
      ...typeIdEncoded,
      ...maxGasEncoded,
      ...maxCoinEncoded,
      ...dataLengthEncoded,
      ...this.deployer,
      ...datastoreSerializedBufferLen,
      ...datastoreSerializedBuffer
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
    const coinsEncoded = new VarintEncode().encode(this.coins);
    const gasLimit = new VarintEncode().encode(this.gasLimit);
    const functionNameEncoded = utils.utf8.toBytes(this.functionName);
    const parametersEncoded = this.args.serialize();
    const functionNameLengthEncoded = new VarintEncode().encode(functionNameEncoded.length);
    const parametersLengthEncoded = new VarintEncode().encode(parametersEncoded.length);
    let targetAddressEncoded = (await base58Decode(this.targetAddress.slice(ADDRESS_PREFIX.length)));

    targetAddressEncoded = Uint8Array.from([
      CONTRACT_VERSION_NUMBER,
      ...targetAddressEncoded
    ]);

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
