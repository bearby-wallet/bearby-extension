
import type {
  RPCBody,
  JsonRPCResponseNodeStatus,
  JsonRPCResponseNodeStatusAddresses,
  JsonRPCResponseStakers,
  OperationTransaction,
  MassaBlock,
  KeyPair,
  TransactionData,
  OperationResponse
} from 'types';
import type { SettingsControl } from 'background/settings';
import type { NetworkControl } from "background/network";
import type { AccountController } from 'background/account';

import blake3 from 'blake3-js';
import { utils } from 'aes-js';
import { sign, verify } from "@noble/ed25519";

import { HttpProvider } from "../../../lib/http/http";
import { REQUEST_FALLED, MassaHttpError, EMPTY_ACCOUNT, INCORRECT_PUB_KEY } from './errors';
import { JsonRPCRequestMethods } from './methods';
import { assert } from 'lib/assert';
import { base58Encode, pubKeyFromBytes } from 'lib/address';


export class MassaControl {
  #network: NetworkControl;
  #account: AccountController;
  #settings: SettingsControl;

  readonly provider = new HttpProvider();

  constructor(
    network: NetworkControl,
    account: AccountController,
    settings: SettingsControl
  ) {
    this.#network = network;
    this.#account = account;
    this.#settings = settings;
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

  async sign(data: Uint8Array, pair: KeyPair) {
    const account = this.#account.selectedAccount;

    assert(Boolean(account), EMPTY_ACCOUNT, MassaHttpError);

    const messageHashDigest = Uint8Array.from(utils.hex.toBytes(
      blake3.newRegular().update(data).finalize()
    ));
    const sig = await sign(messageHashDigest, pair.privKey);
    const isVerified = await verify(sig, messageHashDigest, Uint8Array.from(pair.pubKey));

    assert(isVerified, INCORRECT_PUB_KEY, MassaHttpError);

    return sig;
  }

  async getTransactionData(byteCode: Uint8Array, sig: Uint8Array, pubKey: Uint8Array): Promise<TransactionData> {
    const signature = await base58Encode(sig);
    const publicKey = await pubKeyFromBytes(pubKey);
    return {
      signature,
      serialized_content: Array.from(byteCode),
      creator_public_key: publicKey
    };
  }

  async sendTransaction(...data: TransactionData[]): Promise<OperationResponse[]> {
    const body = this.provider.buildBody(JsonRPCRequestMethods.SEND_OPERATIONS, [data]);
    return await this.sendJson(body);
  }

  async sendJson(...body: RPCBody[]) {
    const request = this.provider.json(...body);
    const timeout = 15000;
    const abortController = new AbortController();
    const id = setTimeout(() => abortController.abort(), timeout);

    for (const provider of this.#network.providers) {
      try {
        const responce = await fetch(provider, {
          ...request,
          signal: abortController.signal  
        });
        clearTimeout(id);
        if (!responce.ok) {
          continue;
        }
        const data = await responce.json();
        return data;
      } catch(err) {
        if (this.#settings.network.state.downgrade) {
          console.info(provider, err);
          await this.#network.removeProvider(provider);
        } else {
          break;
        }
        continue;
      }
    }

    throw new MassaHttpError(REQUEST_FALLED);
  }
}
