import { Runtime } from "./index";

export function getManifestVersion() {
  return Runtime.runtime.getManifest().manifest_version;
}
