import type { GuardType } from 'types/account';

import { writable } from 'svelte/store';
import { ShaAlgorithms } from "config/sha-algorithms";
import { ITERACTIONS } from 'config/guard';


export default writable<GuardType>({
  isEnable: false,
  isReady: false,
  algorithm: ShaAlgorithms.Sha512,
  iteractions: ITERACTIONS
});
