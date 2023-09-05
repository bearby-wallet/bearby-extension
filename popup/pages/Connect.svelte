<script lang="ts">
	import { onMount } from 'svelte';

	import { scale } from 'svelte/transition';
	import { _ } from 'popup/i18n';
	import { closePopup } from 'popup/mixins/popup';

	import connectAppStore from 'popup/store/confirm-apps';
	import { approveConnection, rejectConnection } from 'popup/backend/connections';
	import { getWalletState } from 'popup/backend/wallet';


	let index = 0;
	let app = $connectAppStore[index];

	const hanldeOnConfirm = async () => {
		try {
			await approveConnection(index);
		} catch {
			///
		}

		if ($connectAppStore.length === 0) {
			await closePopup();
		}
	};
	const hanldeOnReject = async () => {
		await rejectConnection(index);

		if ($connectAppStore.length === 0) {
			await closePopup();
		}
	};

  onMount(() => {
		let inter = setInterval(async() => {
			const state = await getWalletState();

			if (!state || state.confirmApps) {
				await closePopup();
				clearTimeout(inter);
			}
		}, 5000);
  });
</script>

{#if Boolean(app)}
	<main in:scale>
		<h1>{app.title}</h1>
		<img
			src={app.icon}
			alt="logo"
			width="55px"
			height="55px"
		/>
		<div>
			<h2>
				{$_('connect.question.0')}
				<mark>
					{app.domain}
				</mark>
				{$_('connect.question.1')}
			</h2>
			<p>
				{$_('connect.warn')}
			</p>
		</div>
		<div class="btn-wrap">
			<button
				class="primary"
				on:mouseup={hanldeOnConfirm}
			>
				{$_('connect.btns.conf')}
			</button>
			<button
        class="outline"
        on:mouseup={hanldeOnReject}
      >
				{$_('connect.btns.reject')}
			</button>
		</div>
	</main>
{/if}

<style lang="scss">
	@import "../styles/mixins";
	main {
		height: 100vh;
		text-align: center;

		justify-content: space-between;

		@include flex-center-column;
	}
	h1 {
		@include fluid-text(720px, 20pt, 30pt);
		@include text-shorten;
	}
	h2 {
		@include fluid-text(720px, 15pt, 20pt);
	}
	img {
		margin: 16px;
		display: auto;
	}
	div,
	h1 {
		max-width: 500px;
		width: calc(100vw - 30px);
		padding-left: 16px;
		padding-right: 16px;
	}
	div {
		&.btn-wrap {
			max-width: 400px;
			min-width: 290px;
			width: 100%;
			margin-block-start: 10vh;
			@include flex-between-row;

			& > button {
				margin: 5px;
			}
		}
	}
</style>
