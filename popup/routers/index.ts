import { wrap } from 'svelte-spa-router/wrap';
import { routerGuard } from './guard';

import Home from '../pages/Home.svelte';
import LockPage from '../pages/Lock.svelte';
import StartPage from '../pages/start.svelte';


export default {
  '/': wrap({
    component: Home,
    conditions: [
      routerGuard
    ]
  }),
  '/lock': LockPage,
  '/start': StartPage
};
