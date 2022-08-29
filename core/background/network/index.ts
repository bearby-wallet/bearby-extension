

import { NETWORK, NETWORK_KEYS } from 'config/network';
import { Fields } from 'config/fields';
import { BrowserStorage, buildObject } from 'lib/storage';

const [mainnet] = NETWORK_KEYS;

export class NetworkControl {
  public config = NETWORK;
  public selected = mainnet;
}
