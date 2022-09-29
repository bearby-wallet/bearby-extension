<script lang="ts">
  import { createEventDispatcher } from 'svelte';
	import { _ } from 'popup/i18n';
  import { trim } from 'popup/filters/trim';

	import AccountCard from '../components/AccountCard.svelte';
	import SearchBox from '../components/SearchBox.svelte';


  const dispatch = createEventDispatcher();

  export let list = [];
  export let index = 0;

	let search = '';

	$: identities = list.filter(
		(acc) => String(acc.name).toLowerCase().includes(String(search).toLowerCase())
	);
	$: selectedAccount = list[index];

	const onSelectAccount = async (account) => {
		const index = list.findIndex(
			(a) => a.base58 === account.base58
		);
		dispatch('selected', index);
	};
	const onInputSearch = (e) => {
		search = e.detail;
	};
</script>

<SearchBox
	placeholder={$_('accounts.placeholder')}
	focus
	on:input={onInputSearch}
/>
{#if identities.length === 0}
	<p>
		{$_('accounts.no_accounts')} {search}
	</p>
{/if}
<ul>
	{#each identities as account, index}
		<li
			class:selected={account.base58 === selectedAccount.base58}
			on:click={() => onSelectAccount(account)}
		>
			<AccountCard
				account={account}
				selected={account.base58 === selectedAccount.base58}
			/>
		</li>
	{/each}
</ul>

<style lang="scss">
	@import "../styles/mixins";
	ul {
		padding: 0;
    margin: 0;
		margin-block-start: 16px;
    overflow-y: scroll;
		padding-block-end: 70px;

		width: 100%;
    min-height: 530px;

		& > li {
			cursor: pointer;

			padding-left: 10px;
			padding-right: 10px;

			@include flex-between-row;

			&.selected {
				background-color: var(--card-color);
			}

			&:hover {
				background-color: var(--card-color);
			}
		}
	}
</style>
