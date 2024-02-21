<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';
	import { link, push } from 'svelte-spa-router';

	import TopBar from '../components/TopBar.svelte';
	import LeftNavBar from '../components/LeftNavBar.svelte';
	import Burger from '../components/Burger.svelte';
	import TokenCard from '../components/TokenCard.svelte';
	import CopyAccount from '../components/CopyAccount.svelte';
	import BottomTabs from '../components/BottomTabs.svelte';

	import { balanceUpdate } from 'popup/backend/wallet';
	import { uuidv4 } from 'lib/crypto/uuid';
	import { generateBlockies } from 'popup/mixins/blockies';

	import walletStore from 'popup/store/wallet';
	import tokensStore from 'popup/store/tokens';
	import { AccountTypes } from 'config/account-type';


	let uuid = uuidv4();
	let loading = true;
	let leftBar = false;

	$: account = $walletStore.identities[$walletStore.selectedAddress];

  const onRefresh = async (rate = false) => {
		loading = true;
		try {
			await balanceUpdate();
		} catch (err) {
			console.error((err as Error).message);
		}
		loading = false;
	};
	const onToggleLeftBar = () => {
		leftBar = !leftBar;
	};

	function onToken(index: number) {
		if (index === 1) {
			// index = 1 is Roll Token
			return push('/rolls');
		}

		return push(`/send/${index}`);
	}

	onMount(async() => {
		const ctx = document.getElementById(uuid);

		if (ctx) {
			generateBlockies(account.pubKey, ctx);
		}

		await onRefresh();
	});
</script>


<LeftNavBar
	show={leftBar}
	on:close={onToggleLeftBar}
/>
<section>
	<TopBar
		view
		on:refresh={() => onRefresh(true)}
	/>
	<img
		src="/imgs/logo.webp"
		alt="logo"
	>
	<main>
		<div class="bar-wrapper">
			<span
				class="burger"
				on:mouseup={onToggleLeftBar}
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
		<div class="btns">
			<button
				class="action primary"
				disabled={account.type === AccountTypes.Track}
				on:mouseup={() => push(`/send/0`)}
			>
				{$_('home.btns.send')}
			</button>
			<button
				class="action primary"
				on:mouseup={() => push('/account')}
			>
				{$_('home.btns.receive')}
			</button>
		</div>
		<div class="wrapper">
			{#each $tokensStore as token, index}
        <TokenCard
					token={token}
					disabled={account.type === AccountTypes.Track}
					loading={loading}
					on:select={() => onToken(index)}
				/>
      {/each}
		</div>
	</main>
	<BottomTabs />
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
    background: inherit;
		height: calc(100vh - 86px);
		z-index: 3;

		@include flex-center-top-column;
	}
	:global(body[theme="dark"]) {
		img {
			display: none;
		}
  }
	img {
		position: fixed;
		max-width: 900px;
		width: 110vw;
		margin: 0% auto;
		left: auto;
		right: auto;
		top: -67px;
		opacity: 0.1;
	}
	div.btns {
		display: flex;
    justify-content: space-around;
    width: 100%;
		max-width: 270px;

		margin-block-end: 15px;

		& > button {
			max-width: 120px;
		}
	}
	section {
		@include flex-center-top-column;
	}
	div.bar-wrapper {
		max-width: 500px;
    width: calc(100vw - 25px);
		@include flex-between-row;

		& > span.burger {
			width: 43px;
		}
	}
	button.action {
		min-width: 120px;
		line-height: 30px;
	}
	a.acc {
		border: solid 2px var(--muted-color);

		width: 43px;
    height: 43px;

		@include border-radius(200px);

		&:hover {
			border: solid 2px var(--primary-color);
		}
	}
	div.wrapper {
		margin-top: 15px;
		padding-left: 10px;
		padding-right: 10px;

		min-width: 290px;
		max-width: 320px;
		width: fit-content;

		flex-wrap: wrap;

    display: flex;
    justify-content: flex-start;

		overflow-y: scroll;
	}
</style>
