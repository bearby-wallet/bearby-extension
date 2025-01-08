import { writable } from "svelte/store";
import { NETWORK_KEYS } from "config/network";

export default writable<string>(NETWORK_KEYS[0]);
