import { wrap } from 'svelte-spa-router/wrap';
import { routerGuard } from './guard';


import LockPage from '../pages/Lock.svelte';

export default {
  '/lock': LockPage,
  // '/': wrap({
  //   component: Home,
  //   conditions: [
  //     routerGuard
  //   ]
  // })
};
