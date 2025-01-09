<script lang="ts">
	import { onMount } from "svelte";
	import { _ } from "popup/i18n";
	import { push, route } from "popup/routers/navigation";

	import TopBar from "../components/TopBar.svelte";
	import LeftNavBar from "../components/LeftNavBar.svelte";
	import Burger from "../components/Burger.svelte";
	import TokenCard from "../components/TokenCard.svelte";
	import CopyAccount from "../components/CopyAccount.svelte";
	import BottomTabs from "../components/BottomTabs.svelte";
	import Modal from "../components/Modal.svelte";
	import ConnectAccounts from "../modals/ConnectAccounts.svelte";
	import ManageIcon from "../components/icons/Manage.svelte";

	import { balanceUpdate } from "popup/backend/wallet";
	import {
		getConnections,
		updateConnectionAccounts,
	} from "popup/backend/connections";
	import { uuidv4 } from "lib/crypto/uuid";
	import { generateBlockies } from "popup/mixins/blockies";

	import walletStore from "popup/store/wallet";
	import tokensStore from "popup/store/tokens";
	import connectionsAppsStore from "popup/store/connections";
	import appsStore from "popup/store/connection";

	import { AccountTypes } from "config/account-type";

	let uuid = uuidv4();
	let loading = true;
	let leftBar = false;
	let connectionsModal = false;

	$: account = $walletStore.identities[$walletStore.selectedAddress];
	$: app = $appsStore.domain
		? $connectionsAppsStore.find((a) => a.domain == $appsStore.domain)
		: null;

	const onRefresh = async () => {
		await getConnections();
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
	const onToken = (index: number) => {
		if (index === 1) {
			// index = 1 is Roll Token
			return push("/rolls");
		}

		return push(`/send/${index}`);
	};
	const onChangeAppConnection = async (e: CustomEvent) => {
		let indexies = e.detail;
		let appIndex = $connectionsAppsStore.findIndex(
			(a) => a.domain == $appsStore.domain,
		);

		if (appIndex >= 0) {
			await updateConnectionAccounts(appIndex, indexies);
		}
	};

	onMount(async () => {
		const ctx = document.getElementById(uuid);

		if (ctx) {
			generateBlockies(account.pubKey, ctx);
		}

		await onRefresh();
	});
</script>

<Modal
	show={Boolean(connectionsModal)}
	title={$_("accounts.title")}
	on:close={() => (connectionsModal = !connectionsModal)}
>
	<div class="m-warp">
		{#if Boolean(app)}
			<div class="app-info">
				<img src={app?.icon} alt="app-icon" width="55px" height="55px" />
				<mark>
					{app?.domain}
				</mark>
			</div>
			<ConnectAccounts
				identities={$walletStore.identities}
				indexies={app?.accounts ?? []}
				on:changed={onChangeAppConnection}
			/>
		{/if}
	</div>
</Modal>
<LeftNavBar show={leftBar} on:close={onToggleLeftBar} />
<section>
	<TopBar
		view
		conn
		on:refresh={() => onRefresh()}
		on:connections={() => (connectionsModal = !connectionsModal)}
	/>
	<img src="/imgs/logo.webp" alt="logo" class="logo" />
	<main>
		<div class="bar-wrapper">
			<span class="burger" onmouseup={onToggleLeftBar} role="button" tabindex="0">
				<Burger />
			</span>
			<CopyAccount />
			<a href="/accounts" class="acc" use:route aria-label="accounts">
				<div id={uuid} ></div>
			</a>
		</div>
		<div class="btns">
			<button
				class="action primary"
				disabled={account.type === AccountTypes.Track}
				onmouseup={() => push(`/send/0`)}
			>
				{$_("home.btns.send")}
			</button>
			<button class="action primary" onmouseup={() => push("/account")}>
				{$_("home.btns.receive")}
			</button>
		</div>
		<div class="manage-tokens">
			<a class="manage-btn" href="/tokens" use:route>
				<ManageIcon />
			</a>
		</div>
		<div class="wrapper">
			{#each $tokensStore as token, index}
				<TokenCard
					{token}
					disabled={account.type === AccountTypes.Track}
					{loading}
					on:select={() => onToken(index)}
				/>
			{/each}
		</div>
	</main>
	<BottomTabs />
</section>

<style lang="scss">
	@use '../styles/mixins' as mix;
	main {
		background: inherit;
		height: calc(100vh - 86px);
		z-index: 3;

		@include mix.flex-center-top-column;
	}
	div.app-info {
		font-size: 19pt;
		margin: 16pt;
		@include mix.flex-center-top-column;
	}
	:global(body[theme="dark"]) {
		img.logo {
			display: none;
		}
	}
	img.logo {
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
		@include mix.flex-center-top-column;
	}
	div.bar-wrapper {
		max-width: 500px;
		width: calc(100vw - 25px);
		@include mix.flex-between-row;

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

		@include mix.border-radius(200px);

		&:hover {
			border: solid 2px var(--primary-color);
		}
	}
	div.manage-tokens {
		display: flex;
		justify-content: end;

		& > a.manage-btn {
			cursor: pointer;

			&:hover {
				:global(svg > path) {
					stroke: var(--primary-color);
				}
			}
		}
	}
	div.wrapper,
	div.manage-tokens {
		min-width: 290px;
		max-width: 320px;
		width: fit-content;
	}
	div.wrapper {
		padding-left: 10px;
		padding-right: 10px;

		flex-wrap: wrap;

		display: flex;
		justify-content: flex-start;

		overflow-y: scroll;
	}
</style>
