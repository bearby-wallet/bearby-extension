import type { SignMessageParams } from "types/transaction";

import { writable } from "svelte/store";

export default writable<SignMessageParams | undefined>();
