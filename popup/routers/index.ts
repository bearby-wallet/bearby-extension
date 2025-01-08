import type { Route } from "@mateothegreat/svelte5-router";

import Home from '../pages/Home.svelte';
import AccountsPage from '../pages/Accounts.svelte';
import TokensPage from '../pages/tokens.svelte';
import AddSeedAccountPage from '../pages/AddAccount.svelte';
import RestorePrivateKeyPage from '../pages/KeyRestore.svelte';
import SendPage from '../pages/Send.svelte';
import SettingsPage from '../pages/Settings.svelte';
import HistoryPage from '../pages/History.svelte';
import PopupPage from '../pages/Popup.svelte';
import RollsPage from '../pages/Rolls.svelte';
import ConnectPage from '../pages/Connect.svelte';
import AddTrackAccountPage from '../pages/AddTrack.svelte';
import SignMessagePage from '../pages/SignMessage.svelte';

import NetworkPage from '../pages/settings/Network.svelte';
import AccountPage from '../pages/settings/Account.svelte';
import GeneralPage from '../pages/settings/General.svelte';
import AdvancedPage from '../pages/settings/Advanced.svelte';
import ContactsPage from '../pages/settings/Contacts.svelte';
import ConnectionsPage from '../pages/settings/Connections.svelte';
import AboutPage from '../pages/settings/About.svelte';
import SecurityPage from '../pages/settings/Security.svelte';

import LockPage from '../pages/Lock.svelte';
import StartPage from '../pages/Start.svelte';
import CreatePage from '../pages/Create.svelte';
import WordsVerifyPage from '../pages/WordsVerify.svelte';
import SetupAccountPage from '../pages/SetupAccount.svelte';
import CreateSuccessPage from '../pages/CreateSuccess.svelte';
import RestorePage from '../pages/Restore.svelte';
import PubKeyRequestPage from '../pages/PubKeyRequest.svelte';

const routes: Route[] = [
  // Protected routes
  {
    path: "^/$",
    component: Home,
  },
  {
    path: "add-track",
    component: AddTrackAccountPage,
  },
  {
    path: "accounts",
    component: AccountsPage,
  },
  {
    path: "tokens",
    component: TokensPage,
  },
  {
    path: "confirm",
    component: PopupPage,
  },
  {
    path: "req-pubkey",
    component: PubKeyRequestPage,
  },
  {
    path: "history",
    component: HistoryPage,
  },
  {
    path: "rolls",
    component: RollsPage,
  },
  {
    path: "sign-message",
    component: SignMessagePage,
  },
  {
    path: "account",
    component: AccountPage,
  },
  {
    path: "connect",
    component: ConnectPage,
  },
  {
    path: "contacts",
    component: ContactsPage,
  },
  {
    path: "connections",
    component: ConnectionsPage,
  },
  {
    path: "settings",
    component: SettingsPage,
  },
  {
    path: "about",
    component: AboutPage,
  },
  {
    path: "security",
    component: SecurityPage,
  },
  {
    path: "general",
    component: GeneralPage,
  },
  {
    path: "advanced",
    component: AdvancedPage,
  },
  {
    path: "send/:index/:recipient?",
    component: SendPage,
  },
  {
    path: "add",
    component: AddSeedAccountPage,
  },
  {
    path: "import",
    component: RestorePrivateKeyPage,
  },
  {
    path: "network",
    component: NetworkPage,
  },

  // Public routes (without guard)
  {
    path: "lock",
    component: LockPage
  },
  {
    path: "start",
    component: StartPage
  },
  {
    path: "create",
    component: CreatePage
  },
  {
    path: "verify",
    component: WordsVerifyPage
  },
  {
    path: "setup-account",
    component: SetupAccountPage
  },
  {
    path: "created",
    component: CreateSuccessPage
  },
  {
    path: "restore",
    component: RestorePage
  },
];

export default routes;
