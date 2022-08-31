import { Fields } from "config/fields";
import { BrowserStorage, buildObject } from "lib/storage";


export class PhishingDetection {
  #phishingDetectionEnabled = true;

  get phishingDetectionEnabled() {
    return this.#phishingDetectionEnabled;
  }

  async togglePhishing() {
    this.#phishingDetectionEnabled = !this.phishingDetectionEnabled;

    await BrowserStorage.set(
      buildObject(Fields.PHISHING_DETECTION, String(this.phishingDetectionEnabled))
    );
  }

  async syncPhishing(content?: string | null) {
    if (!content) {
      return this.resetPhishing();
    }

    this.#phishingDetectionEnabled = (content === 'true');
  }

  async resetPhishing() {
    this.#phishingDetectionEnabled = true;

    await BrowserStorage.set(
      buildObject(Fields.PHISHING_DETECTION, String(this.phishingDetectionEnabled))
    );
  }
}
