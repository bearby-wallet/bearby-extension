import type {
  ReqBody,
  SendResponseParams,
  ContentWalletData,
  ProxyContentType,
  JsonRPCResponse
} from "types";

import { MTypeTab, MTypeTabContent } from "config/stream-keys";
import { TabStream } from "lib/stream/tab-stream";
import { Message } from "lib/stream/message";
import { warpMessage } from "lib/stream/warp-message";
import { ContentMessage } from "lib/stream/secure-message";
import { ContentProvider } from "./http-provider";
import { assert } from "lib/assert";
import { WALLET_NOT_CONNECTED, WALLET_NOT_ENABLED } from "./errors";
import { PhishingDetect } from "./phishing-detect";


export class ContentTabStream {
  readonly #stream: TabStream;
  readonly #domain = globalThis.document.domain;

  #provider: ContentProvider;
  #phishing = new PhishingDetect();

  get stream() {
    return this.#stream;
  }

  get domain() {
    return this.#domain;
  }

  constructor() {
    this.#provider = new ContentProvider(true, []);
    this.#stream = new TabStream(MTypeTabContent.CONTENT);
    this.#stream.listen((msg) => this.#fromInpage(msg));
    this.#start();
  }

  #fromInpage(msg: ReqBody) {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case MTypeTab.GET_DATA:
        this.#start();
        break;
      case MTypeTab.CONTENT_PROXY_MEHTOD:
        this.#proxy(msg.payload);
        break;
      case MTypeTab.CONNECT_APP:
        new Message(msg).send();
        break;
      case MTypeTab.DISCONNECT_APP:
        new Message(msg).send();
        break;
      default:
        break;
    }
  }

  async #proxy(payload: ProxyContentType) {
    const { params, method, uuid } = payload;
    const recipient = MTypeTabContent.INJECTED;
    const data = await new Message<SendResponseParams>({
      type: MTypeTab.GET_DATA,
      payload: {
        domain: this.domain
      }
    }).send();
    let result: JsonRPCResponse = {
      ...this.#provider.rpc,
      result: undefined,
      error: undefined
    };

    try {
      const resolve = warpMessage(data) as ContentWalletData;

      this.#provider = new ContentProvider(
        resolve.smartRequest,
        resolve.providers
      );

      assert(resolve.connected, WALLET_NOT_CONNECTED);
      assert(resolve.enabled, WALLET_NOT_ENABLED);

      const body = this.#provider.buildBody(method, params);

      result = await this.#provider.sendJson(body);
    } catch (err) {
      result.error = {
        code: -1,
        message: (err as Error).message
      };
    }

    if (result.error) {
      return new ContentMessage({
        type: MTypeTab.CONTENT_PROXY_RESULT,
        payload: {
          reject: result.error.message,
          uuid
        }
      }).send(this.#stream, recipient);
    }

    return new ContentMessage({
      type: MTypeTab.CONTENT_PROXY_RESULT,
      payload: {
        resolve: result,
        uuid
      }
    }).send(this.#stream, recipient);
  }

  async #start() {
    const data = await new Message<SendResponseParams>({
      type: MTypeTab.GET_DATA,
      payload: {
        domain: this.domain
      }
    }).send();
    const resolve = warpMessage(data) as ContentWalletData;

    this.#phishing.phishing = resolve.phishing;

    this.#provider = new ContentProvider(
      resolve.smartRequest,
      resolve.providers
    );

    if (resolve.connected) {
      new ContentMessage({
        type: MTypeTab.GET_DATA,
        payload: resolve,
      }).send(this.#stream, MTypeTabContent.INJECTED);
    }

    if (!this.#phishing.checked) {
      await this.#phishing.check(this.#provider);
    }
  }
}
