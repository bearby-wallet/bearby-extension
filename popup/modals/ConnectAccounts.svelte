<script lang="ts">
  import type { Account } from 'types/account';

	import { createEventDispatcher } from 'svelte';

	import OptionAccount from '../components/OptionAccount.svelte';


	const dispatch = createEventDispatcher();

  export let selected: number;
  export let identities: Account[];

	let accounts = identities.map((_, index) => index == selected);

  const onSelectAccount = (index: number, e: CustomEvent)  => {
		accounts[index] = e.detail;

    let indexies = accounts
			.map((v, index) => v ? index : null)
			.filter((i) => i !== null);

    dispatch('changed', indexies);
	};
</script>

<ul class="accounts">
  {#each identities as account, index}
    <li>
      <OptionAccount
        account={account}
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
