<script lang="ts">
	import { scale } from "svelte/transition";
	import { _ } from "popup/i18n";
	import { closePopup } from "popup/mixins/popup";

	import OptionAccount from '../components/OptionAccount.svelte';

	import connectAppStore from "popup/store/confirm-apps";
	import walletStore from 'popup/store/wallet';

	import {
		approveConnection,
		rejectConnection,
	} from "popup/backend/connections";

	let index = 0;
	let accounts = $walletStore.identities.map((_, index) => index == $walletStore.selectedAddress);
	let app = $connectAppStore[index];

	const hanldeOnConfirm = async () => {
		let accountIdxs = accounts
			.map((v, index) => v ? index : null)
			.filter((i) => i !== null);

		try {
			await approveConnection(index, accountIdxs as number[]);
		} catch {
			///
		}

		if ($connectAppStore.length === 0) {
			await closePopup();
		}
	};
	const onSelectAccount = (index: number)  => {
		accounts[index] = !accounts[index];
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
		<ul class="accounts">
			{#each $walletStore.identities as account, index}
				<li
					on:mouseup={() => onSelectAccount(index)}
				>
					<OptionAccount
						account={account}
						selected={accounts[index]}
					/>
				</li>
			{/each}
		</ul>
		<div class="btn-wrap">
			<button
				class="primary"
				disabled={!accounts.some(Boolean)}
				on:mouseup={hanldeOnConfirm}
			>
				{$_("connect.btns.conf")}
			</button>
			<button class="outline" on:mouseup={hanldeOnReject}>
				{$_("connect.btns.reject")}
			</button>
		</div>
	</main>
{/if}

<style lang="scss">
	@import "../styles/mixins";
	main {
		height: 100vh;
		text-align: center;

		@include flex-center-top-column;
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
	ul {
		padding: 0;
    margin: 0;
    overflow-y: scroll;

		width: 100%;
    height: calc(100vh - 250px);

		&.accounts {
			padding: 16pt;
			border: solid 1pt var(--secondary-color);

			width: calc(100vw - 15px);

			@include border-radius(16px);
		}

		& > li {
			cursor: pointer;

			padding-left: 10px;
			padding-right: 10px;

			@include flex-between-row;
		}
	}
</style>
