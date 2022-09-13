import App from './App.svelte';
import { getWalletState } from './backend/wallet';


let app = {};

getWalletState()
	.then(() => {
		app = new App({
			target: document.body
		});
	})
	.catch(console.error);

export default app;
