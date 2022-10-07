import { wrap } from 'svelte-spa-router/wrap';
import { routerGuard } from './guard';

import Home from '../pages/Home.svelte';
import AccountsPage from '../pages/Accounts.svelte';
import AddSeedAccountPage from '../pages/AddAccount.svelte';
import RestorePrivateKeyPage from '../pages/KeyRestore.svelte';
import SendPage from '../pages/Send.svelte';
import SettingsPage from '../pages/Settings.svelte';
import HistoryPage from '../pages/History.svelte';
import PopupPage from '../pages/Popup.svelte';
import RollsPage from '../pages/Rolls.svelte';
import ConnectPage from '../pages/Connect.svelte';
import SignMessagePage from '../pages/SignMessage.svelte';

import NetwrokPage from '../pages/settings/Netwrok.svelte';
import AccountPage from '../pages/settings/Account.svelte';
import GeneralPage from '../pages/settings/General.svelte';
import AdvancedPage from '../pages/settings/Advanced.svelte';
import ContactsPage from '../pages/settings/Contacts.svelte';
import SecurityPage from '../pages/settings/Security.svelte';
import ConnectionsPage from '../pages/settings/Connections.svelte';
import AboutPage from '../pages/settings/About.svelte';

import LockPage from '../pages/Lock.svelte';
import StartPage from '../pages/Start.svelte';
import CreatePage from '../pages/Create.svelte';
import WordsVerifyPage from '../pages/WordsVerify.svelte';
import SetupAccountPage from '../pages/SetupAccount.svelte';
import CreateSuccessPage from '../pages/CreateSuccess.svelte';
import RestorePage from '../pages/Restore.svelte';


export default {
  '/': wrap({
    component: Home,
    conditions: [
      routerGuard
    ]
  }),
  '/accounts': wrap({
    component: AccountsPage,
    conditions: [
      routerGuard
    ]
  }),
  '/confirm': wrap({
    component: PopupPage,
    conditions: [
      routerGuard
    ]
  }),
  '/history': wrap({
    component: HistoryPage,
    conditions: [
      routerGuard
    ]
  }),
  '/rolls': wrap({
    component: RollsPage,
    conditions: [
      routerGuard
    ]
  }),
  '/sign-message': wrap({
    component: SignMessagePage,
    conditions: [
      routerGuard
    ]
  }),
  '/account': wrap({
    component: AccountPage,
    conditions: [
      routerGuard
    ]
  }),
  '/connect': wrap({
    component: ConnectPage,
    conditions: [
      routerGuard
    ]
  }),
  '/contacts': wrap({
    component: ContactsPage,
    conditions: [
      routerGuard
    ]
  }),
  '/connections': wrap({
    component: ConnectionsPage,
    conditions: [
      routerGuard
    ]
  }),
  '/settings': wrap({
    component: SettingsPage,
    conditions: [
      routerGuard
    ]
  }),
  '/about': wrap({
    component: AboutPage,
    conditions: [
      routerGuard
    ]
  }),
  '/security': wrap({
    component: SecurityPage,
    conditions: [
      routerGuard
    ]
  }),
  '/general': wrap({
    component: GeneralPage,
    conditions: [
      routerGuard
    ]
  }),
  '/advanced': wrap({
    component: AdvancedPage,
    conditions: [
      routerGuard
    ]
  }),
  '/send/:index/:recipient?': wrap({
    component: SendPage,
    conditions: [
      routerGuard
    ]
  }),
  '/add': wrap({
    component: AddSeedAccountPage,
    conditions: [
      routerGuard
    ]
  }),
  '/import': wrap({
    component: RestorePrivateKeyPage,
    conditions: [
      routerGuard
    ]
  }),
  '/network': wrap({
    component: NetwrokPage,
    conditions: [
      routerGuard
    ]
  }),
  '/lock': wrap({
    component: LockPage,
    conditions: [
    ]
  }),
  '/start': wrap({
    component: StartPage,
    conditions: [
    ]
  }),
  '/create': wrap({
    component: CreatePage,
    conditions: [
    ]
  }),
  '/verify': wrap({
    component: WordsVerifyPage,
    conditions: [
    ]
  }),
  '/setup-account': wrap({
    component: SetupAccountPage,
    conditions: [
    ]
  }),
  '/created': wrap({
    component: CreateSuccessPage,
    conditions: [
    ]
  }),
  '/restore': wrap({
    component: RestorePage,
    conditions: [
    ]
  })
};
