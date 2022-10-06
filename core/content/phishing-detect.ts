import { Runtime } from 'lib/runtime';
import type { ContentProvider } from './http-provider';


export class PhishingDetect {
  #host = String(globalThis.location.host).replace('www.', '');
  #url = Runtime.extension.getURL('phishing.html');
  #checked = false;

  get checked() {
    return this.#checked;
  }

  phishing = false;

  async check(provider: ContentProvider) {
    // TODO: deploy a contract which check the domain on phishing domains
    console.log(
      `host: ${this.#host}, url: ${this.#url}, checked: ${this.#checked}, providers: ${provider.providers.join('.')}`
    );
  }
}
