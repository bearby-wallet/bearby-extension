import { EXTENSION_ID } from 'lib/runtime/id';

import connectionsStore from 'app/store/connection';
import { getConnections } from 'popup/backend/connections';


export async function loadTab(tab: chrome.tabs.Tab) {
  if (!tab) {
    return;
  }

  try {
    const url = new URL(String(tab.url));
    const domain = url.hostname;

    if (EXTENSION_ID === domain) {
      return;
    }

    let connections = await getConnections();
    let found = connections.find((c) => c.domain == domain);

    connectionsStore.set({
      domain,
      accounts: found ? found.accounts : []
    });
  } catch {
    ///
  }
}
