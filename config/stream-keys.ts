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
  WALET_PASSWORD_CHANGE: `@/${app}/change-password`,
  BIP39_WORD_CHECK: `@/${app}/bip39-word`,

  REMOVE_ACCOUNT: `@/${app}/remove-account`,
  SELECT_ACCOUNT: `@/${app}/select-account`,
  ADD_ACCOUNT: `@/${app}/add-account`,
  RESTORE_KEY: `@/${app}/restore-key`,
  SET_ACCOUNT_NAME: `@/${app}/set-account-name`,
  EXPORT_SECRET_WORDS: `@/${app}/export-secret-words`,
  EXPORT_KEY: `@/${app}/export-privatekey`,
  IMPORT_TRACK_ACCOUNT: `@/${app}/popup-import-track-account`,

  BALANCE_UPDATE: `@/${app}/balance-update`,

  SELECT_NETWORK: `@/${app}/select-network`,
  GET_NETWORK_CONFIG: `@/${app}/get-network-config`,
  RESET_NETWORK_CONFIG: `@/${app}/reset-network-config`,
  ADD_NODE: `@/${app}/add-network-node`,
  SORT_NODES: `@/${app}/sort-nodes-apis`,
  REMOVE_NODES: `@/${app}/remove-nodes-api`,

  SET_DOWNGRADE_NODE: `@/${app}/set-downgrade-node-flag`,
  SET_ABORT_TIMEOUT: `@/${app}/set-abort-timeout`,
  SET_NUMBER_OF_NODES: `@/${app}/set-number-of-nodes`,
  SET_HTTPS_ONLY: `@/${app}/set-https-only-flag`,
  SET_CURRENCY: `@/${app}/set-currency`,
  SET_THEME: `@/${app}/set-theme`,
  SET_LOCALE: `@/${app}/set-locale`,
  SET_PHISHING: `@/${app}/set-phishing-flag`,
  SET_GAS_CONFIG: `@/${app}/set-gas-config`,
  SET_LOCK_TIMER: `@/${app}/set-lock-timer`,
  SET_PERIOD: `@/${app}/set-priod-offset`,
  SET_CHAIN_ID: `@/${app}/set-chain-id`,

  TOGGLE_POPUP_ENABLED: `@/${app}/toggle-popup-emabled`,
  TOGGLE_FORMAT_ENABLED: `@/${app}/toggle-format-emabled`,

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
  REMOVE_CONNECTION: `@/${app}/remove-connection`,
  APPROVE_CONNECTION: `@/${app}/approve-connection`,
  UPDATE_CONNECTION: `@/${app}/update-connection`,
  REJECT_CONNECTION: `@/${app}/reject-connection`,

  REJECT_MESSAGE: `@/${app}/reject-message`,
  APPROVE_MESSAGE: `@/${app}/approve-message`,

  APPROVE_PUB_KEY_REQ: `@/${app}/apprvoe-pub-key-request`
};

export const MTypeTab = {
  GET_DATA: `@/${app}/get-wallet-data`,
  REQUEST_RPC_PROXY: `@/${app}/make-request-rpc-proxy`,
  NEW_SLOT: `@/${app}/new-slot-emited`,
  ACCOUNT_CHANGED: `@/${app}/accounts-just-changed`,
  CONTENT_PROXY_MEHTOD: `@/${app}/proxy-method`,
  CONTENT_PROXY_RESULT: `@/${app}/response-from-content`,
  DISCONNECT_APP: `@/${app}/disconnect_app`,
  DISCONNECT_APP_RESULT: `@/${app}/disconnect_app_result`,
  CONNECT_APP: `@/${app}/connect-app`,
  REQUEST_PUB_KEY: `@/${app}/request-pub-key`,
  RESPONSE_CONNECT_APP: `@/${app}/respoonse-connect-app`,
  NETWORK_CHANGED: `@/${app}/network-just-changed`,
  LOCKED: `@/${app}/guard-just-lock`,
  TX_TO_SEND: `@/${app}/add-tx-to-send`,
  TX_TO_SEND_RESULT: `@/${app}/response-tx-result`,
  SIGN_MESSAGE: `@/${app}/sign-message-call`,
  SING_MESSAGE_RESULT: `@/${app}/sign-message-response`,
  RESPONSE_PUB_KEY: `@/${app}/response-pub-key`,
  CHECK_MASSA_ADDRESS: `@/${app}/check-massa-address`,
  CHECK_MASSA_ADDRESS_RES: `@/${app}/check-massa-address-response`,
  REQUEST_PING: `@/${app}/req-content-ping`,
  PING_RESPONSE: `@/${app}/res-content-ping`,
};
