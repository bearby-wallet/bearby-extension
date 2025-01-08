import { TIME_BEFORE_LOCK } from "config/common";
import { writable } from "svelte/store";

export default writable<number>(TIME_BEFORE_LOCK);
