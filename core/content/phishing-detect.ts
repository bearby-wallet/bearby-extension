import { Runtime } from 'lib/runtime';


export class PhishingDetect {
  #host = String(globalThis.location.host).replace('www.', '');
  #url = Runtime.extension.getURL('phishing.html');
  #checked = false;

  get checked() {
    return this.#checked;
  }

  phishing = false;
  http = '';

  async check() {
  }
}
