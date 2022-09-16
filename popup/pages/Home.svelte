<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';
	import { link, push } from 'svelte-spa-router';

	import TopBar from '../components/TopBar.svelte';
	import LeftNavBar from '../components/LeftNavBar.svelte';
	import Burger from '../components/Burger.svelte';
	import CopyAccount from '../components/CopyAccount.svelte';

	import { balanceUpdate } from 'popup/backend/wallet';
	import { uuidv4 } from 'lib/crypto/uuid';
	import { generateBlockies } from 'popup/mixins/blockies';

	import walletStore from 'popup/store/wallet';

	let uuid = uuidv4();
	let loading = false;
	let leftBar = false;

	$: account = $walletStore.identities[$walletStore.selectedAddress];

  const onRefresh = async (rate = false) => {
		loading = true;
		try {
			await balanceUpdate();
		} catch (err) {
			console.error(err.message);
		}
		loading = false;
	};
	const onToggleLeftBar = () => {
		leftBar = !leftBar;
	};

	onMount(async() => {
		const ctx = document.getElementById(uuid);
		generateBlockies(account.pubKey, ctx);
		await onRefresh();
	});
</script>


<LeftNavBar
	show={leftBar}
	on:close={onToggleLeftBar}
/>
<section>
	<TopBar
		refresh
		view
		lock
		on:refresh={() => onRefresh(true)}
	/>
	<img
		src="/imgs/logo.png"
		alt="logo"
	>
	<main>
		<div class="bar-wrapper">
			<span
				class="burger"
				on:click={onToggleLeftBar}
			>
				<Burger />
			</span>
			<CopyAccount />
			<a
				href="/accounts"
				class="acc"
				use:link
			>
				<div id={uuid}/>
			</a>
		</div>
	</main>
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
		height: calc(100vh - 86px);
		z-index: 3;

		@include flex-center-top-column;
	}
	img {
		position: fixed;
		max-width: 900px;
		width: 130vw;
		margin: 0% auto;
		left: auto;
		right: auto;
		top: -47px;
		opacity: 0.5;
	}
	section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
	div.bar-wrapper {
		max-width: 500px;
    width: calc(100vw - 25px);
		@include flex-between-row;

		& > span.burger {
			width: 49px;
		}
	}
	a.acc {
		border: solid 2px var(--muted-color);

		width: 49px;
    height: 49px;

		@include border-radius(200px);

		&:hover {
			border: solid 2px var(--primary-color);
		}
	}
</style>
