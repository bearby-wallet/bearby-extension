import type { ReqBody } from 'types';

import { Runtime } from 'lib/runtime';


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
      type
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
  public send(): Promise<T> {
    return new Promise((resolve) => {
      try {
        Runtime
          .runtime
          .sendMessage(this._body, resolve);
      } catch (err) {
        console.error(this, err);
        window.location.reload();
      }
    })
  }
}
