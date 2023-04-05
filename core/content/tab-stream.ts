import type {
  ReqBody,
  SendResponseParams,
  ContentWalletData,
  ProxyContentType
} from "types";

import { MTypeTab, MTypeTabContent } from "config/stream-keys";
import { TabStream } from "lib/stream/tab-stream";
import { Message } from "lib/stream/message";
import { warpMessage } from "lib/stream/warp-message";
import { ContentMessage } from "lib/stream/secure-message";
import { assert } from "lib/assert";
import { WALLET_NOT_CONNECTED, WALLET_NOT_ENABLED } from "./errors";
import { PhishingDetect } from "./phishing-detect";


export class ContentTabStream {
  readonly #stream: TabStream;
  readonly #domain = globalThis.document.domain;

  #phishing = new PhishingDetect();
  #connected = false;

  get stream() {
    return this.#stream;
  }

  get domain() {
    return this.#domain;
  }

  get connected() {
    return this.#connected;
  }

  constructor() {
    this.#stream = new TabStream(MTypeTabContent.CONTENT);
    this.#stream.listen((msg) => this.#fromInpage(msg));
    this.#updateState();
  }

  #fromInpage(msg: ReqBody) {
    if (!msg || !msg.type) return;

    msg.payload.domain = this.domain;

    switch (msg.type) {
      case MTypeTab.GET_DATA:
        this.#updateState();
        break;
      case MTypeTab.CONTENT_PROXY_MEHTOD:
        this.#proxy(msg.payload);
        break;
      case MTypeTab.DISCONNECT_APP:
        new Message(msg).send();
        break;
      case MTypeTab.CONNECT_APP:
        new Message(msg).send();
        break;
      case MTypeTab.TX_TO_SEND:
        new Message(msg).send();
        break;
      case MTypeTab.SIGN_MESSAGE:
        new Message(msg).send();
        break;
      default:
        break;
    }
  }

  async #proxy(payload: ProxyContentType) {
    const { body, uuid } = payload;
    const recipient = MTypeTabContent.INJECTED;

    try {
      const responses = await new Message<SendResponseParams>({
        type: MTypeTab.REQUEST_RPC_PROXY,
        payload: {
          bodies: body
        }
      }).send();
      const resolve = warpMessage(responses) as ContentWalletData;

      return new ContentMessage({
        type: MTypeTab.CONTENT_PROXY_RESULT,
        payload: {
          resolve,
          uuid
        }
      }).send(this.#stream, recipient);
    } catch (err) {
      return new ContentMessage({
        type: MTypeTab.CONTENT_PROXY_RESULT,
        payload: {
          reject: (err as Error).message,
          uuid
        }
      }).send(this.#stream, recipient);
    }
  }

  async #updateState() {
    const data = await new Message<SendResponseParams>({
      type: MTypeTab.GET_DATA,
      payload: {
        domain: this.domain
      }
    }).send();
    const resolve = warpMessage(data) as ContentWalletData;

    this.#phishing.phishing = resolve.phishing;
    this.#connected = resolve.connected;

    new ContentMessage({
      type: MTypeTab.GET_DATA,
      payload: resolve,
    }).send(this.#stream, MTypeTabContent.INJECTED);

    if (!this.#phishing.checked) {
      // TODO: make SC for pthishing detect.
    }
  }
}
