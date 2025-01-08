import { routerGuard } from "./guard";

import Home from "../pages/Home.svelte";
import AccountsPage from "../pages/Accounts.svelte";
import TokensPage from "../pages/tokens.svelte";
import AddSeedAccountPage from "../pages/AddAccount.svelte";
import RestorePrivateKeyPage from "../pages/KeyRestore.svelte";
import SendPage from "../pages/Send.svelte";
import SettingsPage from "../pages/Settings.svelte";
import HistoryPage from "../pages/History.svelte";
import PopupPage from "../pages/Popup.svelte";
import RollsPage from "../pages/Rolls.svelte";
import ConnectPage from "../pages/Connect.svelte";
import AddTrackAccountPage from "../pages/AddTrack.svelte";
import SignMessagePage from "../pages/SignMessage.svelte";

import NetworkPage from "../pages/settings/Network.svelte";
import AccountPage from "../pages/settings/Account.svelte";
import GeneralPage from "../pages/settings/General.svelte";
import AdvancedPage from "../pages/settings/Advanced.svelte";
import ContactsPage from "../pages/settings/Contacts.svelte";
import SecurityPage from "../pages/settings/Security.svelte";
import ConnectionsPage from "../pages/settings/Connections.svelte";
import AboutPage from "../pages/settings/About.svelte";

import LockPage from "../pages/Lock.svelte";
import StartPage from "../pages/Start.svelte";
import CreatePage from "../pages/Create.svelte";
import WordsVerifyPage from "../pages/WordsVerify.svelte";
import SetupAccountPage from "../pages/SetupAccount.svelte";
import CreateSuccessPage from "../pages/CreateSuccess.svelte";
import RestorePage from "../pages/Restore.svelte";
import PubKeyRequestPage from "../pages/PubKeyRequest.svelte";

const routes = {
  // Protected routes (with guard)
  "/": {
    component: Home,
    guard: routerGuard,
  },
  "/add-track": {
    component: AddTrackAccountPage,
    guard: routerGuard,
  },
  "/accounts": {
    component: AccountsPage,
    guard: routerGuard,
  },
  "/tokens": {
    component: TokensPage,
    guard: routerGuard,
  },
  "/confirm": {
    component: PopupPage,
    guard: routerGuard,
  },
  "/req-pubkey": {
    component: PubKeyRequestPage,
    guard: routerGuard,
  },
  "/history": {
    component: HistoryPage,
    guard: routerGuard,
  },
  "/rolls": {
    component: RollsPage,
    guard: routerGuard,
  },
  "/sign-message": {
    component: SignMessagePage,
    guard: routerGuard,
  },
  "/account": {
    component: AccountPage,
    guard: routerGuard,
  },
  "/connect": {
    component: ConnectPage,
    guard: routerGuard,
  },
  "/contacts": {
    component: ContactsPage,
    guard: routerGuard,
  },
  "/connections": {
    component: ConnectionsPage,
    guard: routerGuard,
  },
  "/settings": {
    component: SettingsPage,
    guard: routerGuard,
  },
  "/about": {
    component: AboutPage,
    guard: routerGuard,
  },
  "/security": {
    component: SecurityPage,
    guard: routerGuard,
  },
  "/general": {
    component: GeneralPage,
    guard: routerGuard,
  },
  "/advanced": {
    component: AdvancedPage,
    guard: routerGuard,
  },
  "/send/:index/:recipient?": {
    component: SendPage,
    guard: routerGuard,
  },
  "/add": {
    component: AddSeedAccountPage,
    guard: routerGuard,
  },
  "/import": {
    component: RestorePrivateKeyPage,
    guard: routerGuard,
  },
  "/network": {
    component: NetworkPage,
    guard: routerGuard,
  },

  // Public routes (without guard)
  "/lock": {
    component: LockPage,
  },
  "/start": {
    component: StartPage,
  },
  "/create": {
    component: CreatePage,
  },
  "/verify": {
    component: WordsVerifyPage,
  },
  "/setup-account": {
    component: SetupAccountPage,
  },
  "/created": {
    component: CreateSuccessPage,
  },
  "/restore": {
    component: RestorePage,
  },
};

export default routes;
