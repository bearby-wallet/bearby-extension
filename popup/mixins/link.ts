import { PROMT_PAGE } from "config/common";
import { Runtime } from "lib/runtime";


export function linksExpand(url = '') {
  Runtime.tabs.create({ url: PROMT_PAGE + `#${url}` });
  window.close();
}

export function openTab(url: string) {
  Runtime.tabs.create({ url });
}
