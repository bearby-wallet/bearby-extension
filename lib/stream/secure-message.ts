import type { ReqBody } from 'types';
import type { TabStream } from './tab-stream';


 export class ContentMessage {
  readonly #body: ReqBody;

  get type() {
    return this.#body.type;
  }

  get payload() {
    return this.#body.payload;
  }

  constructor(msg: ReqBody) {
    this.#body = msg;
  }

  /**
   * Method for send message.
   */
  send(stream: TabStream, recipient: string) {
    const seralized = JSON.stringify(this.#body);
    const deserialized = JSON.parse(seralized);

    stream.send(deserialized, recipient);
  }

}
