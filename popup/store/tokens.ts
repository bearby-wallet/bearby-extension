import type { Token } from "types/token";
import { writable } from "svelte/store";

export default writable<Token[]>([]);
