import { Fields } from 'config/fields';
import { BrowserStorage, buildObject } from 'lib/storage';


export class NetworkSettings {
  #downgrade = false;

  get downgrade() {
    return this.#downgrade;
  }

  async setDowngrade(downgrade: boolean) {
    this.#downgrade = downgrade;

    await BrowserStorage.set(
      buildObject(Fields.NETWORK_DOWNGRADE, String(this.downgrade))
    );
  }

  async sync(content?: string | null) {
    if (!content) {
      return this.reset();
    }

    this.#downgrade = content === 'true';
  }

  async reset() {
    this.#downgrade = true;

    await BrowserStorage.set(
      buildObject(Fields.NETWORK_DOWNGRADE, String(this.downgrade))
    );
  }
}
