import type { HistoryTransaction } from 'types';

import { writable } from 'svelte/store';


export default writable<HistoryTransaction[]>([]);

