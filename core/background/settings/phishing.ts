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
      buildObject(
        Fields.PHISHING_DETECTION,
        String(this.phishingDetectionEnabled),
      ),
    );
  }

  async sync(content?: string | null) {
    if (!content) {
      return this.reset();
    }

    this.#phishingDetectionEnabled = content === "true";
  }

  async reset() {
    this.#phishingDetectionEnabled = true;

    await BrowserStorage.set(
      buildObject(
        Fields.PHISHING_DETECTION,
        String(this.phishingDetectionEnabled),
      ),
    );
  }
}
