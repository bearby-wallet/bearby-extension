import { PROMT_PAGE } from "config/common";
import { Runtime } from "lib/runtime";

export function linksExpand(url = "") {
  Runtime.tabs.create({ url: PROMT_PAGE + `#${url}` });
  window.close();
}

export function openTab(url: string) {
  Runtime.tabs.create({ url });
}

export function linkToDomain(domain: string) {
  if (!domain.includes("http")) {
    domain = `http://${domain}`;
  }

  Runtime.tabs.create({ url: domain });
}
