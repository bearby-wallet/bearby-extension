import { isByteString } from './hex';


export const isPrivateKey = (privateKey: string) => {
  if (!isByteString(privateKey, 64)) {
    throw new Error('BadPrivateKey');
  }
};
