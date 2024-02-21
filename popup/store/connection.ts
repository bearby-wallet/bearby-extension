import type { ConnectionStore } from 'types';
import { writable } from 'svelte/store';


export default writable<ConnectionStore>({
  domain: '',
  accounts: []
});

