<script lang="ts">
	import { scale } from "svelte/transition";
	import { _ } from "popup/i18n";
	import { closePopup } from "popup/mixins/popup";

	import ConnectAccounts from "../modals/ConnectAccounts.svelte";

	import connectAppStore from "popup/store/confirm-apps";
	import walletStore from "popup/store/wallet";

	import {
		approveConnection,
		rejectConnection,
	} from "popup/backend/connections";

	let index = $state(0);
	let indexies: number[] = $state([$walletStore.selectedAddress]);
	let app = $derived($connectAppStore[index]);

	const hanldeOnConfirm = async () => {
		try {
			await approveConnection(index, indexies);
		} catch {
			///
		}

		if ($connectAppStore.length === 0) {
			await closePopup();
		}
	};
	const onChange = (e: CustomEvent) => {
		indexies = e.detail;
	};
	const hanldeOnReject = async () => {
		await rejectConnection(index);

		if ($connectAppStore.length === 0) {
			await closePopup();
		}
	};
</script>

{#if Boolean(app)}
	<main in:scale>
		<img src={app.icon} alt="logo" width="55px" height="55px" />
		<div class="info">
			<mark>
				{app.domain}
			</mark>
			<mark>
				{app.title}
			</mark>
			<p>
				{$_("connect.warn")}
			</p>
		</div>
		<ConnectAccounts
			identities={$walletStore.identities}
			indexies={[$walletStore.selectedAddress]}
			on:changed={onChange}
		/>
		<div class="btn-wrap">
			<button
				class="primary"
				disabled={indexies.length === 0}
				onmouseup={hanldeOnConfirm}
			>
				{$_("connect.btns.conf")}
			</button>
			<button class="outline" onmouseup={hanldeOnReject}>
				{$_("connect.btns.reject")}
			</button>
		</div>
	</main>
{/if}

<style lang="scss">
	@use "../styles/mixins";
	main {
		height: 100vh;
		text-align: center;

		@include flex-center-top-column;
	}
	div.info {
		width: calc(100vw - 30px);
		word-wrap: break-word;
	}
	img {
		margin: 5px;
		display: auto;
	}
	div.btn-wrap {
		margin-bottom: 16pt;
		margin-top: 16pt;

		& > button {
			min-width: 100pt;
		}
	}
</style>
