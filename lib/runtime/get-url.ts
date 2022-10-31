import { Runtime } from ".";


export function getExtensionURL(content: string) {
  return Runtime.runtime.getURL(content);
}
