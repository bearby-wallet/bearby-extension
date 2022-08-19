import type { StorageKeyValue } from 'lib/storage';
import type { Fields } from 'config/fields';

import { Runtime } from 'lib/runtime';


type CallBack = {
  [key: string]: chrome.storage.StorageChange;
};

/**
 * Default class for working with browser Storage.
 * @example
 * import { BrowserStorage } from 'lib/storage'
 * new BrowserStorage().get('KEY')
 */
 export const BrowserStorage = Object.freeze({

  /**
   * Create subscribe
   * @example
   * import { BrowserStorage } from 'lib/storage'
   * BrowserStorage
   *   .subscribe(store => / Do something... /)
   *   .unsubscribe()
   */
  subscribe(cb: (changes: CallBack) => void) {
    Runtime
      .storage
      .onChanged
      .addListener(cb);

    return {
      unsubscribe() {
        Runtime
          .storage
          .onChanged
          .removeListener(cb);
      }
    }
  },

  /**
   * Set value by someting key.
   * @example
   * import { BrowserStorage, buildObject } from 'lib/storage'
   * BrowserStorage.set(
   *   buildObject('example-key', { example: 'set method'})
   * ).then(/ Do something... /)
   * // OR
   * BrowserStorage.set(
   *   buildObject('example-key', { example: 'set method'}),
   *   buildObject('example-key', { example: 'set method'})
   *   //...
   * ).then(/ Do something... /)
   */
  async set(...args: StorageKeyValue[]) {
    const list: Promise<void>[] = [];

    for (let index = 0; index < args.length; index++) {
      const arg = args[index];

      list.push(new Promise<void>((resolve) => {
        Runtime
            .storage
            .local.set(arg, () => resolve());
      }));
    }

    await Promise.all(list);
  },

  /**
   * Get value from storage by keys.
   * @example
   * import { BrowserStorage } from 'lib/storage'
   * BrowserStorage.get(key).then(recievePaylod => / Do something... /)
   */
  get(...keys: Fields[] | string[]): Promise<StorageKeyValue | string> {
    return new Promise((resolve) => {
      Runtime.storage.local.get(keys, (elements: StorageKeyValue) => {
        if (keys.length === 1) {
          resolve(elements[keys[0]]);
        } else {
          resolve(elements);
        }
      });
    });
  },

  /**
   * @example
   * import { BrowserStorage } from 'lib/storage'
   * const storage = new BrowserStorage()
   * storage.getAll(key).then(fullStorageObject => / Do something... /)
   */
  getAll(): Promise<StorageKeyValue> {
    return new Promise((resolve) => {
      Runtime.storage.local.get(null, (items) => {
        resolve(items);
      });
    });
  },

  /**
   * Remove one item from storage.
   * @example
   * import { BrowserStorage } from 'lib/storage'
   * const storage = new BrowserStorage()
   * storage.rm('any-key-item').then(() => / Do something... /)
   */
  rm(...keys: string[]) {
    return new Promise<void>((resolve) => {
      Runtime.storage.local.remove(keys, () => resolve());
    });
  },
  clear() {
    return new Promise<void>((resolve) => {
      Runtime.storage.local.clear(() => resolve());
    });
  }
});
