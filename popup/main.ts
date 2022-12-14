import { Runtime } from 'lib/runtime';
import App from './App.svelte';
import { getWalletState } from './backend/wallet';
import { getTransactionHistory } from 'popup/backend/transactions';


let app = {};

getWalletState()
	.finally(() => {
		app = new App({
			target: document.body
		});
		const events = Runtime.storage.local.onChanged;

		async function listener() {
			await getWalletState();

			if (window.location.hash === '#/history') {
				await getTransactionHistory();
			}
		}

		if (!events) {
			return null;
		}

		if (events && events.hasListeners && events.hasListeners()) {
			events.removeListener(listener);
		}

		events.addListener(listener);
	});

export default app;
