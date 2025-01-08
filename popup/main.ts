import { mount } from 'svelte';
import { Runtime } from "lib/runtime";
import App from "./App.svelte";
import { getWalletState } from "./backend/wallet";
import { getTransactionHistory } from "popup/backend/transactions";
import { loadTab } from "popup/utils/tabs";

let app = {};

getWalletState().finally(() => {
  app = mount(App, {
    target: document.body,
  });
  
  const events = Runtime.storage.local.onChanged;

  Runtime.tabs.query({ active: true, currentWindow: true }, ([tab]) =>
    loadTab(tab),
  );
  
  Runtime.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, async (tab) => loadTab(tab));
  });

  async function listener() {
    await getWalletState();

    if (window.location.hash === "#/history") {
      await getTransactionHistory();
    }
  }

  if (!events) {
    return null;
  }

  if (events && events.hasListeners && events.hasListeners()) {
    events.removeListener(listener);
  }

  events.addListener(listener);
});

export default app;
