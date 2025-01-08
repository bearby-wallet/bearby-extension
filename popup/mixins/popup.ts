import { ManifestVersions } from "config/manifest-versions";
import { Runtime } from "lib/runtime";
import { getManifestVersion } from "lib/runtime/manifest";
import { goto } from "@mateothegreat/svelte5-router";

export async function closePopup() {
  if (getManifestVersion() == ManifestVersions.V2) {
    try {
      window.close();
    } catch {
      ////
    }

    try {
      const { id } = await Runtime.windows.getCurrent();

      if (String(id)) {
        Runtime.windows.remove(Number(id), console.error);
      }
    } catch {
      ////
    }
  } else {
    const pop = await Runtime.windows.getCurrent();

    if (pop.type == "popup") {
      Runtime.windows.remove(Number(pop.id), console.error);
    } else if (pop.type == "normal") {
      goto("/");
    }
  }
}
