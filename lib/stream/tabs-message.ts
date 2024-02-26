import type { ReqBody } from 'types';

import { Runtime } from 'lib/runtime';


/**
 * TabsMessage is class for send messages for any tabs.
 * @example
 * import { TabsMessage } from 'lib/stream/message'
 * const msg = { type: '@/tab/example', payload: {} }
 * new TabsMessage(msg)
 *   .send()
 *   .then(() => / Do something... /)
 */
export class TabsMessage {
  readonly _body: ReqBody;

  static tabs(): Promise<chrome.tabs.Tab[]> {
    return new Promise(resolve => {
      Runtime.tabs.query({}, resolve);
    })
  }

  /**
   * Recieve msg object.
   */
  constructor(msg: ReqBody) {
    this._body = msg;
  }

  /// sending to the current tab
  async signal(domain: string) {
    return new Promise((resolve, reject) => {
      Runtime.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab) {
          return reject(new Error('no active tabs'));
        }

        const { hostname } = new URL(String(tab.url));

        if (hostname !== domain) {
          return reject(new Error('invalid domain'));
        }

        const seralized = JSON.stringify(this._body);
        const deserialized = JSON.parse(seralized);

        Runtime.tabs.sendMessage(Number(tab.id), deserialized);

        return resolve('');
      });
    });
  }

  async send(...domains: string[]) {
    const tabs = await TabsMessage.tabs();

    tabs.forEach((tab) => {
      if (tab && tab.url && domains.includes(new URL(tab.url).hostname)) {
        const seralized = JSON.stringify(this._body);
        const deserialized = JSON.parse(seralized);

        Runtime.tabs.sendMessage(Number(tab.id), deserialized);
      }
    });
  }

  /**
   * Send msg for tabs.
   */
  async sendAll() {
    // Get all active tabs.
    const tabs = (await TabsMessage.tabs())
      .filter((tab) => tab.url && !tab.url.includes('chrome://'));

    try {
      for (let index = 0; index < tabs.length; index++) {
        const tab = tabs[index];
        const seralized = JSON.stringify(this._body);
        const deserialized = JSON.parse(seralized);

        // Sending to each tabs(pages)
        Runtime.tabs.sendMessage(Number(tab.id), deserialized);
      }
    } catch (err) {
      console.error('TabsMessage', err);
      // If not tabs with injected script.
    }
  }

}
