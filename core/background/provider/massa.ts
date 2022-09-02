
import type {
  RPCBody,
  JsonRPCResponseNodeStatus,
  JsonRPCResponseNodeStatusAddresses,
  JsonRPCResponseStakers,
  OperationTransaction,
  MassaBlock
} from 'types';
import type { NetworkControl } from "background/network";
import type { AccountController } from 'background/account';

import blake3 from 'blake3-js';
import { utils } from 'aes-js';
import { sign, verify } from "@noble/ed25519";

import { HttpProvider } from "./http";
import { REQUEST_FALLED, MassaHttpError, EMPTY_ACCOUNT, INCORRECT_PUB_KEY } from './errors';
import { JsonRPCRequestMethods } from './methods';
import { assert } from 'lib/assert';
import { base58Encode } from 'lib/address';


export class MassaControl {
  #network: NetworkControl;
  #account: AccountController;

  readonly provider = new HttpProvider();

  constructor(network: NetworkControl, account: AccountController) {
    this.#network = network;
    this.#account = account;
  }

  async getNodesStatus(): Promise<JsonRPCResponseNodeStatus[]> {
    const body = this.provider.buildBody(JsonRPCRequestMethods.GET_STATUS, []);
    return await this.sendJson(body);
  }

  async getAddresses(...addresses: string[]): Promise<JsonRPCResponseNodeStatusAddresses[]> {
    const body = this.provider.buildBody(JsonRPCRequestMethods.GET_ADDRESSES, [addresses]);
    return await this.sendJson(body);
  }

  async getBlocks(...blocks: string[]): Promise<MassaBlock[]> {
    const body = this.provider.buildBody(JsonRPCRequestMethods.GET_BLOCKS, [blocks]);
    return await this.sendJson(body);
  }

  async getOperations(...operations: string[]): Promise<OperationTransaction[]> {
    const body = this.provider.buildBody(JsonRPCRequestMethods.GET_OPERATIONS, [operations]);
    return await this.sendJson(body);
  }

  async getStakers(): Promise<JsonRPCResponseStakers[]> {
    const body = this.provider.buildBody(JsonRPCRequestMethods.GET_STAKERS, []);
    return await this.sendJson(body);
  }

  async sign(data: Uint8Array) {
    const account = this.#account.selectedAccount;

    assert(Boolean(account), EMPTY_ACCOUNT, MassaHttpError);

    const pair = await this.#account.getKeyPair();
    const messageHashDigest = Uint8Array.from(utils.hex.toBytes(
      blake3.newRegular().update(data).finalize()
    ));
    const sig = await sign(messageHashDigest, pair.privKey);
    const isVerified = await verify(sig, messageHashDigest, pair.pubKey);

    assert(isVerified, INCORRECT_PUB_KEY, MassaHttpError);

    return {
      sig,
      pubKey: pair.pubKey
    };
  }

  async sendTransaction(byteCode: Uint8Array, sig: Uint8Array, pubKey: Uint8Array) {
    const signature = base58Encode(sig);
    const data = {
      signature,
      serialized_content: Array.prototype.slice.call(byteCode),
      creator_public_key: sender.publicKey,
      signature: signature.base58Encoded,
  };
  }

  async sendJson(...body: RPCBody[]) {
    const request = this.provider.json(...body);

    for (const provider of this.#network.providers) {
      try {
        const responce = await fetch(provider, request);
        if (!responce.ok) {
          continue;
        }
        const data = await responce.json();
        return data;
      } catch(err) {
        await this.#network.downgradeNodeStatus(provider);
        continue;
      }
    }

    throw new MassaHttpError(REQUEST_FALLED);
  }
}
