import { Runtime } from ".";
import { getManifestVersion } from "./manifest";


export function getExtensionURL(content: string) {
  const mv = getManifestVersion();

  if (mv === 3) {
    return Runtime.runtime.getURL(content);
  }

  return Runtime.extension.getURL(content);
}
