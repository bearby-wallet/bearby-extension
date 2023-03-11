export class Massa {
  #url = 'https://massexplo.io';

  address(addr: string) {
    return `${this.#url}/address/${addr}`;
  }

  transaction(hash: string) {
    return `${this.#url}/tx/${hash}`;
  }

  block(blocknumber: number) {
    return `${this.#url}/block/${blocknumber}`;
  }
}
