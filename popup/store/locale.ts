import { Locales } from 'config/locale';
import { writable } from 'svelte/store';

export default writable<string>(Locales.Auto);
