import type { TransactionParam } from 'types';
import { writable } from 'svelte/store';


export default writable<TransactionParam[]>([]);

