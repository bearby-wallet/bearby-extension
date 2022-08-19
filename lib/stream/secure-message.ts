import type { ReqBody } from 'types';
import type { TabStream } from './tab-stream';

/**
 * Can send encrypted msg.
 */
 export class ContentMessage {
  private readonly _body: ReqBody;

  public get type() {
    return this._body.type;
  }

  public get payload() {
    return this._body.payload;
  }

  constructor(msg: ReqBody) {
    this._body = msg;
  }

  /**
   * Method for send message.
   */
  public send(stream: TabStream, recipient: string) {
    const seralized = JSON.stringify(this._body);
    const deserialized = JSON.parse(seralized);

    stream.send(deserialized, recipient);
  }

}
