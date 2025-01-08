import { getExtensionURL } from "lib/runtime/get-url";

export class PhishingDetect {
  #host = String(globalThis.location.host).replace("www.", "");
  #url = getExtensionURL("phishing.html");
  #checked = false;

  get checked() {
    return this.#checked;
  }

  phishing = false;

  async check() {
    // TODO: deploy a contract which check the domain on phishing domains
    // console.log(
    //   `host: ${this.#host}, url: ${this.#url}, checked: ${this.#checked}, providers: ${provider.providers.join('.')}`
    // );
  }
}
