import { derived } from 'svelte/store';
import {
  dictionary,
  locale,
  _,
  date,
  time,
  number
} from 'svelte-i18n';

const MESSAGE_FILE_URL_TEMPLATE = '/lang/{locale}.json';

let cachedLocale: string | string[];

async function setupI18n({ withLocale: _locale } = { withLocale: 'en' }) {
  const messsagesFileUrl = MESSAGE_FILE_URL_TEMPLATE.replace('{locale}', _locale);
  const response = await fetch(messsagesFileUrl);
  const messages = await response.json();
  dictionary.set({ [_locale]: messages });
  cachedLocale = _locale;
  locale.set(_locale);
}

function formatDate(date: string | number | Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(cachedLocale, options)
    .format(new Date(date));
}

const isLocaleLoaded = derived(locale, $locale => typeof $locale === 'string');
const dir = derived(locale, $locale => $locale === 'en' ? 'rtl' : 'ltr');

export {
  _,
  locale,
  dir,
  setupI18n,
  formatDate,
  isLocaleLoaded,
  date,
  time,
  number
};
