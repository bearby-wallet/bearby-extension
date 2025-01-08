import type { Contact } from "types";
import { writable } from "svelte/store";

export default writable<Contact[]>([]);
