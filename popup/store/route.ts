import type { ParamsRecord, Route } from "app/routers";
import { writable } from "svelte/store";

export const currentRoute = writable<Route | null>(null);
export const currentParams = writable<ParamsRecord>({});
