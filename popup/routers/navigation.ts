export let currentPath = window.location.hash.slice(1) || '/';

export function getCurrentRoute(): string {
    const path = currentPath;
    return path.split('?')[0];
}

export function push(path: string) {
    window.location.hash = path;
    currentPath = path;
}

export function replace(path: string) {
    const currentHash = window.location.hash;
    if (currentHash !== `#${path}`) {
        window.location.replace(`#${path}`);
        currentPath = path;
    }
}

export function pop() {
    window.history.back();
}

export function route(node: HTMLAnchorElement) {
  const handleClick = (event: Event) => {
    event.preventDefault();
    push(node.href);
    const navigationEvent = new CustomEvent("navigation", {
      detail: { href: node.href },
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
