import type { CallParam } from "types/contacts";

import { utils } from "aes-js";
import { toByteArray } from "base64-js";
import { base58Decode, isBase58Address } from "lib/address";
import { assert } from "lib/assert";
import { varintEncode } from "lib/varint";
import { INVLID_RECIPIENT, INVLID_ADDRESS_PREFIX } from "./errors";
import { OperationsType } from "./operations";
import {
  ADDRESS_PREFIX,
  USER_VERSION_NUMBER,
  CONTRACT_VERSION_NUMBER,
  CONTRACT_ADDRESS_PREFIX,
} from "config/common";
import { Args, parseParams } from "lib/args";
import { u64ToBytes, u8toByte } from "lib/args/numbers";
import { BaseError } from "lib/error";
import { GAS_LIMIT } from "config/gas";

export class PaymentBuild {
  static operation = OperationsType.Payment;

  fee: bigint;
  amount: bigint;
  recipientAddress: string;
  expirePeriod: number;

  constructor(
    fee: string | undefined,
    amount: string | undefined,
    recipientAddress: string,
    expirePeriod: number,
  ) {
    this.fee = BigInt(fee ?? GAS_LIMIT);
    this.amount = BigInt(amount ?? 0);
    this.recipientAddress = recipientAddress;
    this.expirePeriod = expirePeriod;
  }

  async bytes() {
    assert(await isBase58Address(this.recipientAddress), INVLID_RECIPIENT);

    const fee = varintEncode(this.fee);
    const expirePeriod = varintEncode(this.expirePeriod);
    const typeIdEncoded = varintEncode(PaymentBuild.operation);
    const amount = varintEncode(this.amount);
    const prefix = this.recipientAddress.slice(0, ADDRESS_PREFIX.length);
    let recipient = await base58Decode(
      this.recipientAddress.slice(ADDRESS_PREFIX.length),
    );

    if (prefix == ADDRESS_PREFIX) {
      recipient = Uint8Array.from([USER_VERSION_NUMBER, ...recipient]);
    } else if (prefix == CONTRACT_ADDRESS_PREFIX) {
      recipient = Uint8Array.from([CONTRACT_VERSION_NUMBER, ...recipient]);
    } else {
      throw new BaseError(INVLID_ADDRESS_PREFIX);
    }

    return Uint8Array.from([
      ...fee,
      ...expirePeriod,
      ...typeIdEncoded,
      ...recipient,
      ...amount,
    ]);
  }
}

export class BuyRollsBuild {
  static operation = OperationsType.RollBuy;

  fee: bigint;
  amount: bigint;
  expirePeriod: number;

  constructor(
    fee: string | undefined,
    amount: string | undefined,
    expirePeriod: number,
  ) {
    this.fee = BigInt(fee ?? GAS_LIMIT);
    this.amount = BigInt(amount ?? 0);
    this.expirePeriod = expirePeriod;
  }

  async bytes() {
    const fee = varintEncode(this.fee);
    const expirePeriod = varintEncode(this.expirePeriod);
    const typeIdEncoded = varintEncode(BuyRollsBuild.operation);
    const amount = varintEncode(this.amount);

    return Uint8Array.from([
      ...fee,
      ...expirePeriod,
      ...typeIdEncoded,
      ...amount,
    ]);
  }
}

export class SellRollsBuild {
  static operation = OperationsType.RollSell;

  fee: bigint;
  amount: bigint;
  expirePeriod: number;

  constructor(
    fee: string | undefined,
    amount: string | undefined,
    expirePeriod: number,
  ) {
    this.fee = BigInt(fee ?? GAS_LIMIT);
    this.amount = BigInt(amount ?? 0);
    this.expirePeriod = expirePeriod;
  }

  async bytes() {
    const fee = varintEncode(this.fee);
    const expirePeriod = varintEncode(this.expirePeriod);
    const typeIdEncoded = varintEncode(SellRollsBuild.operation);
    const amount = varintEncode(this.amount);

    return Uint8Array.from([
      ...fee,
      ...expirePeriod,
      ...typeIdEncoded,
      ...amount,
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
    parameters?: CallParam[],
    unsafeParameters?: Uint8Array,
  ) {
    this.fee = fee;
    this.maxGas = maxGas;
    this.coins = coins;
    this.maxCoins = maxCoins;
    this.expirePeriod = expirePeriod;
    this.code = toByteArray(code);
    this.deployer = toByteArray(deployer);

    const datastore = new Map<Uint8Array, Uint8Array>();

    datastore.set(new Uint8Array([0x00]), u64ToBytes(1n));

    datastore.set(u64ToBytes(1n), this.code);

    if (parameters && parameters.length > 0) {
      const args = parseParams(parameters);

      datastore.set(
        Uint8Array.from(
          new Args().addU64(1n).addUint8Array(u8toByte(0)).serialize(),
        ),
        Uint8Array.from(args.serialize()),
      );
    }

    if (unsafeParameters) {
      datastore.set(
        Uint8Array.from(
          new Args().addU64(1n).addUint8Array(u8toByte(0)).serialize(),
        ),
        Uint8Array.from(unsafeParameters),
      );
    }

    if (coins > 0n) {
      datastore.set(
        new Uint8Array(
          new Args().addU64(BigInt(1)).addUint8Array(u8toByte(1)).serialize(),
        ),
        u64ToBytes(coins),
      );
    }

    this.datastore = datastore;
  }

  bytes() {
    const feeEncoded = varintEncode(this.fee);
    const maxGasEncoded = varintEncode(this.maxGas);
    const maxCoinEncoded = varintEncode(this.maxCoins);
    const expirePeriodEncoded = varintEncode(this.expirePeriod);
    const typeIdEncoded = varintEncode(ExecuteSmartContractBuild.operation);
    const dataLengthEncoded = varintEncode(this.deployer.length);

    // smart contract operation datastore
    const datastoreKeyMap = this.datastore;
    let datastoreSerializedBuffer = new Uint8Array();

    for (const [key, value] of datastoreKeyMap) {
      const encodedKeyLen = varintEncode(key.length);
      const encodedValueLen = varintEncode(value.length);

      datastoreSerializedBuffer = Uint8Array.from([
        ...datastoreSerializedBuffer,
        ...encodedKeyLen,
        ...key,
        ...encodedValueLen,
        ...value,
      ]);
    }

    const datastoreSerializedBufferLen = varintEncode(this.datastore.size);

    return Uint8Array.from([
      ...feeEncoded,
      ...expirePeriodEncoded,
      ...typeIdEncoded,
      ...maxGasEncoded,
      ...maxCoinEncoded,
      ...dataLengthEncoded,
      ...this.deployer,
      ...datastoreSerializedBufferLen,
      ...datastoreSerializedBuffer,
    ]);
  }
}

export class CallSmartContractBuild {
  static operation = OperationsType.CallSC;

  functionName: string;
  maxGas: bigint;
  coins: bigint;
  fee: bigint;
  targetAddress: string;
  expirePeriod: number;

  serializedArgs: Uint8Array;

  constructor(
    functionName: string,
    parameters: CallParam[],
    fee: string | undefined,
    expirePeriod: number,
    maxGas: bigint,
    coins: string,
    targetAddress: string,
    unsafeParameters?: Uint8Array,
  ) {
    this.functionName = functionName;
    this.maxGas = maxGas;
    this.coins = BigInt(coins);
    this.fee = BigInt(fee ?? GAS_LIMIT);
    this.expirePeriod = expirePeriod;
    this.targetAddress = targetAddress;

    if (parameters && parameters.length > 0) {
      this.serializedArgs = Uint8Array.from(
        parseParams(parameters).serialize(),
      );
    } else if (unsafeParameters) {
      this.serializedArgs = unsafeParameters;
    } else {
      this.serializedArgs = Uint8Array.from(new Args().serialize());
    }
  }

  async bytes() {
    assert(await isBase58Address(this.targetAddress), INVLID_RECIPIENT);

    const fee = varintEncode(this.fee);
    const expirePeriod = varintEncode(this.expirePeriod);
    const typeIdEncoded = varintEncode(CallSmartContractBuild.operation);
    const coinsEncoded = varintEncode(this.coins);
    const maxGas = varintEncode(this.maxGas);
    const functionNameEncoded = utils.utf8.toBytes(this.functionName);
    const functionNameLengthEncoded = varintEncode(functionNameEncoded.length);
    const parametersLengthEncoded = varintEncode(this.serializedArgs.length);
    let targetAddressEncoded = await base58Decode(
      this.targetAddress.slice(ADDRESS_PREFIX.length),
    );

    targetAddressEncoded = Uint8Array.from([
      CONTRACT_VERSION_NUMBER,
      ...targetAddressEncoded,
    ]);

    return Uint8Array.from([
      ...fee,
      ...expirePeriod,
      ...typeIdEncoded,
      ...maxGas,
      ...coinsEncoded,
      ...targetAddressEncoded,
      ...functionNameLengthEncoded,
      ...functionNameEncoded,
      ...parametersLengthEncoded,
      ...this.serializedArgs,
    ]);
  }
}
