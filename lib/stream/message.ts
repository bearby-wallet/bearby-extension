import type { ReqBody } from "types";

import { Runtime } from "lib/runtime";
import { ManifestVersions } from "config/manifest-versions";
import { getManifestVersion } from "lib/runtime/manifest";

/**
 * Message class can send payload or make signal message.
 * @example
 * import { Message } from 'lib/stream/message'
 * const msg = { type: '@example/type', payload: { test: 1} }
 * const message = new Message(msg)
 * message.send().then(() => / Do something... /)
 * or
 * Message.signal('@example/type').send().then(() => / Do something... /)
 */
export class Message<T> {
  /**
   * Make just signal message.
   */
  public static signal(type: string): Message<object> {
    return new Message({
      type,
    });
  }

  private readonly _body: ReqBody;

  /**
   * Recieve msg object.
   * @param {Object} msg - Message for send.
   */
  constructor(msg: ReqBody) {
    this._body = msg;
  }

  /**
   * Send MessageSelf object.
   */
  async send(): Promise<T> {
    if (ManifestVersions.V2 == getManifestVersion()) {
      const res = await this.#trySend();

      return res;
    } else {
      for (let index = 0; index < 100; index++) {
        const res = await this.#trySend();

        if (res) {
          return res;
        }
      }
    }

    throw new Error("service_worker_stoped");
  }

  #trySend(): Promise<T> {
    return new Promise((resolve) => {
      try {
        // firefox problem with proxy type.
        let data = JSON.parse(JSON.stringify(this._body));
        Runtime.runtime.sendMessage(data, resolve);
      } catch (err) {
        console.error(this, err);
        window.location.reload();
      }
    });
  }
}
