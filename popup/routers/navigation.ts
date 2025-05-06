import { get } from "svelte/store";
import { currentRoute } from "popup/store/route";

export function getCurrentRoute(): string {
  let rote = get(currentRoute);

  return rote?.path || "";
}

export function push(path: string) {
  window.location.hash = path;
}

export function replace(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const targetHash = `#${normalizedPath}`;

  if (window.location.hash !== targetHash) {
    window.location.replace(targetHash);
  }
}

export function pop() {
  window.history.back();
}

export function route(node: HTMLAnchorElement) {
  const handleClick = (event: Event) => {
    event.preventDefault();
    const path = new URL(node.href).pathname;
    push(path);

    const navigationEvent = new CustomEvent("navigation", {
      detail: { href: path },
    });
    window.dispatchEvent(navigationEvent);
  };

  node.addEventListener("click", handleClick);

  return {
    destroy() {
      node.removeEventListener("click", handleClick);
    },
  };
}
