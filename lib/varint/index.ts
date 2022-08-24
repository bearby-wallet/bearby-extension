import { RANGE_DECODE, RANGE_ENCODE } from './errors';

const MSB = 0x80;
const REST = 0x7F;
const MSBALL = ~REST;
const INT = Math.pow(2, 31);


export class VarintDecode {
  #bytes = 0;

  get bytes() {
    return this.#bytes;
  }

  decode(buf: number[], offset = 0) {
    const l = buf.length;
  
    let res = 0;
    let shift  = 0;
    let counter = offset;
    let b: number;
  
    do {
      if (counter >= l || shift > 49) {
        this.#bytes = 0;
        throw new RangeError(RANGE_DECODE);
      }
  
      b = buf[counter++];
  
      res += shift < 28
        ? (b & REST) << shift
        : (b & REST) * Math.pow(2, shift);
  
      shift += 7;
    } while (b >= MSB);

    this.#bytes = counter - offset;
  
    return res;
  }
}

export class VarintEncode {
  #bytes = 0;

  get bytes() {
    return this.#bytes;
  }

  encode(num: number, out: number[] = [], offset = 0) {
    if (Number.MAX_SAFE_INTEGER && num > Number.MAX_SAFE_INTEGER) {
      this.#bytes = 0;
      throw new RangeError(RANGE_ENCODE);
    }

    const oldOffset = offset;

    while(num >= INT) {
      out[offset++] = (num & 0xFF) | MSB;
      num /= 128;
    }
  
    while(num & MSBALL) {
      out[offset++] = (num & 0xFF) | MSB;
      num >>>= 7;
    }
  
    out[offset] = num | 0;
    this.#bytes = offset - oldOffset + 1;
    
    return out;
  }
}
