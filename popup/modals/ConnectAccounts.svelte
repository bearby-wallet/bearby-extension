<script lang="ts">
	import type { Account } from "types/account";

	import { _ } from "popup/i18n";
	import { createEventDispatcher } from "svelte";

	import OptionAccount from "../components/OptionAccount.svelte";

	const dispatch = createEventDispatcher();

	export let identities: Account[];
	export let indexies: number[];

	let isAll = indexies.length === identities.length;
	let accounts = identities.map((_, index) =>
		indexies.some((i) => i === index),
	);

	const onSelectAccount = (index: number, e: CustomEvent) => {
		accounts[index] = e.detail;
		indexies = accounts
			.map((v, index) => (v ? index : null))
			.filter((i) => i !== null) as number[];

		isAll = indexies.length === identities.length;

		dispatch("changed", indexies);
	};
	const onSelectAll = () => {
		isAll = !isAll;
		accounts = accounts.map((_) => isAll);
		indexies = isAll ? identities.map((_, i) => i) : [];

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
	@use '../styles/mixins' as mix;
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

			@include mix.border-radius(16px);
		}

		& > li {
			cursor: pointer;

			padding-left: 10px;
			padding-right: 10px;

			@include mix.flex-between-row;
		}
	}
</style>
