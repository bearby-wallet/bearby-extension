import { wrap } from 'svelte-spa-router/wrap';
import { routerGuard } from './guard';

import Home from '../pages/Home.svelte';
import AccountsPage from '../pages/Accounts.svelte';

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
