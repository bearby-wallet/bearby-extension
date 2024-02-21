import { NETWORK_KEYS } from "config/network";

const [mainnet] = NETWORK_KEYS;

export class Massa {
  #network = mainnet;
  #url = `https://explorer.massa.net`;
  
  setNetwork(net: string): Massa {
    this.#network = net;

    return this;
  }

  address(addr: string) {
    return `${this.#url}/${this.#network}/address/${addr}`;
  }

  transaction(hash: string) {
    return `${this.#url}/${this.#network}/operation/${hash}`;
  }

  block(blocknumber: number) {
    return `${this.#url}/${this.#network}/block/${blocknumber}`;
  }
}
