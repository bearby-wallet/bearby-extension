import { NETWORK_KEYS } from "config/network";

const [mainnet] = NETWORK_KEYS;

export class Massa {
  #network = mainnet;
  #url = `https://massexplo.io`;

  get network() {
    return `network=${this.#network}`;
  }

  setNetwork(net: string): Massa {
    this.#network = net;

    return this;
  }

  address(addr: string) {
    return `${this.#url}/address/${addr}?${this.network}`;
  }

  transaction(hash: string) {
    return `${this.#url}/tx/${hash}?${this.network}`;
  }

  block(blocknumber: number) {
    return `${this.#url}/block/${blocknumber}?${this.network}`;
  }
}
