import App from './App.svelte';
import { getWalletState } from './backend/wallet';


let app = {};

getWalletState()
	.finally(() => {
		app = new App({
			target: document.body
		});
	});

export default app;
