<script lang="ts">
  import type { Account, Token } from 'types';

  import { createEventDispatcher } from 'svelte';
	import { _ } from 'popup/i18n';

  import { TokenType, viewIcon } from 'popup/utils/icon-view';
  import { formatNumber } from 'popup/filters/numbers';

  import settingsStore from 'popup/store/settings';

	import SearchBox from '../components/SearchBox.svelte';
  import SelectCard from '../components/SelectCard.svelte';

  const dispatch = createEventDispatcher();

  export let account: Account;
  export let list: Token[] = [];
  export let index = 0;

	let search = '';

	$: identities = list.filter((t) => {
    const t1 = String(t.symbol).toLowerCase().includes(String(search).toLowerCase());
    const t2 = String(t.name).toLowerCase().includes(String(search).toLowerCase());

    return t1 || t2;
  });
	$: selected = list[index];

  const getBalance = (token: Token) => {
    return account.tokens && account.tokens[token.base58] ?
      account.tokens[token.base58].final : 0;
  };

	const onSelectToken = async (token: Token) => {
		const index = list.findIndex(
			(a) => a.base58 === token.base58
		);
		dispatch('selected', index);
	};
	const onInputSearch = (e: CustomEvent) => {
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
		{$_('tokens.no_tokens_search')} {search}
	</p>
{/if}
<ul>
	{#each identities as token, i}
		<li
      class:selected={i === index}
      on:mouseup={() => onSelectToken(token)}
    >
      <SelectCard
        header={token.symbol}
        text={token.name}
        rightHeader={formatNumber(getBalance(token))}
        rightText={formatNumber(0, $settingsStore.currency)}
      >
        <img
          src={viewIcon(token.base58, TokenType.FT)}
          alt={token.symbol}
          width="36"
        />
      </SelectCard>
		</li>
	{/each}
</ul>

<style lang="scss">
	@import "../styles/mixins";
	ul {
		padding: 0;
    margin: 0;
    overflow-y: scroll;
		padding-block-end: 70px;
		padding-block-start: 10px;

		width: 100%;
    min-height: 450px;

		& > li {
			cursor: pointer;

      &.selected {
        background-color: var(--card-color);
      }

      &:hover {
        background-color: var(--card-color);
      }
		}
	}
  img {
    width: 30px;
  }
</style>
