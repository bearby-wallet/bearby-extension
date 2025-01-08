import type { Wallet } from "types";

import { writable } from "svelte/store";

export default writable<Wallet>({
  selectedAddress: 0,
  identities: [],
});
