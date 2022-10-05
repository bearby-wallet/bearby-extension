// This string need that sould did't have problem with conflicts.
const app = 'BearBy';


export const MTypeTabContent = {
  CONTENT: `@/${app}/content-script`,
  INJECTED: `@/${app}/injected-script`
};

export const MTypePopup = {
  GET_LATEST_BLOCK: `@/${app}/get-latest-block-number`,
  GET_RANDOM_WORDS: `@/${app}/generate-random-words`,

  GET_WALLET_STATE: `@/${app}/get-wallet-state`,
  CREATE_WALLET: `@/${app}/create-wallet`,
  UNLOCK_WALLET: `@/${app}/unlock-wallet`,
  WALET_LOGOUT: `@/${app}/wallet-logout`,

  REMOVE_ACCOUNT: `@/${app}/remove-account`,
  SELECT_ACCOUNT: `@/${app}/select-account`,
  ADD_ACCOUNT: `@/${app}/add-account`,
  RESTORE_KEY: `@/${app}/restore-key`,
  SET_ACCOUNT_NAME: `@/${app}/set-account-name`,
  EXPORT_SECRET_WORDS: `@/${app}/export-secret-words`,
  EXPORT_KEY: `@/${app}/export-privatekey`,

  BALANCE_UPDATE: `@/${app}/balance-update`,

  SELECT_NETWORK: `@/${app}/select-network`,
  GET_NETWORK_CONFIG: `@/${app}/get-network-config`,
  SET_COUNT: `@/${app}/set-network-count`,
  ADD_NODE: `@/${app}/add-network-node`,
  SORT_NODES: `@/${app}/sort-nodes-apis`,
  REMOVE_NODES: `@/${app}/remove-nodes-api`,

  SET_DOWNGRADE_NODE: `@/${app}/set-downgrade-node-flag`,
  SET_CURRENCY: `@/${app}/set-currency`,
  SET_THEME: `@/${app}/set-theme`,
  SET_LOCALE: `@/${app}/set-locale`,
  SET_PHISHING: `@/${app}/set-phishing-flag`,
  SET_GAS_CONFIG: `@/${app}/set-gas-config`,
  SET_LOCK_TIMER: `@/${app}/set-lock-timer`,
  TOGGLE_POPUP_ENABLED: `@/${app}/toggle-popup-emabled`,

  GET_CONTACTS: `@/${app}/get-contacts`,
  ADD_CONTACT: `@/${app}/add-contact`,
  REMOVE_CONTACT: `@/${app}/remove-contact`,

  ADD_TX_FOR_CONFIRM: `@/${app}/add-transaction-for-confirm`,
  UPDATE_TX_FOR_CONFIRM: `@/${app}/update-transaction-for-confirm`,
  REJECT_TX_FOR_CONFIRM: `@/${app}/reject-transaction-for-confirm`,
  SIGN_AND_SEND_TX: `@/${app}/sign-and-send-tx`,
  GET_TX_HISTORY: `@/${app}/get-transactions-history`,
  CLEAR_ALL_HISTORY: `@/${app}/clear-all-transactions-history`,

  GET_CONNECTIONS: `@/${app}/get-connections`,
  REMOVE_CONNECTION: `@/${app}/remove-connection`
};

export const MTypeTab = {
  GET_DATA: `@/${app}/get-wallet-data`,
  ACCOUNT_CHANGED: `@/${app}/accounts-just-changed`,
  CONTENT_PROXY_MEHTOD: `@/${app}/proxy-method`,
  CONNECT_APP: `@/${app}/connect-app`,
  DISCONNECT_APP: `@/${app}/disconnect-app`
};
