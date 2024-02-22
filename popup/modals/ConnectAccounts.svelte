<script lang="ts">
	import type { Account } from "types/account";

	import { _ } from "popup/i18n";
	import { createEventDispatcher } from "svelte";

	import OptionAccount from "../components/OptionAccount.svelte";

	const dispatch = createEventDispatcher();

	export let selected: number;
	export let identities: Account[];

	let isAll = false;
	let accounts = identities.map((_, index) => index == selected);

	const onSelectAccount = (index: number, e: CustomEvent) => {
		accounts[index] = e.detail;

		let indexies = accounts
			.map((v, index) => (v ? index : null))
			.filter((i) => i !== null);

		dispatch("changed", indexies);
	};
	const onSelectAll = () => {
		isAll = !isAll;
		accounts = accounts.map((_) => isAll);
		let indexies = isAll ? accounts.map((_, i) => i) : [];

		dispatch("changed", indexies);
	};
</script>

<ul class="accounts">
	<li>
		<p>
			{$_("ALL")}
		</p>
		<input type="checkbox" checked={isAll} on:change={onSelectAll} />
	</li>
	{#each identities as account, index}
		<li>
			<OptionAccount
				{account}
				selected={accounts[index]}
				on:changed={(e) => onSelectAccount(index, e)}
			/>
		</li>
	{/each}
</ul>

<style lang="scss">
	@import "../styles/mixins";
	ul {
		padding: 0;
		margin: 0;
		overflow-y: scroll;

		width: 100%;
		max-width: 350pt;
		height: calc(100vh - 250px);

		&.accounts {
			padding: 8pt;
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
