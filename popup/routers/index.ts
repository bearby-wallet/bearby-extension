import { wrap } from 'svelte-spa-router/wrap';
import { routerGuard } from './guard';

import Home from '../pages/Home.svelte';
import LockPage from '../pages/Lock.svelte';
import StartPage from '../pages/Start.svelte';
import CreatePage from '../pages/Create.svelte';
import WordsVerifyPage from '../pages/WordsVerify.svelte';


export default {
  '/': wrap({
    component: Home,
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
  })
};
