<script lang="ts">
  import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import { _ } from 'popup/i18n';
  import { trim } from 'popup/filters/trim';

	import walletStore from 'popup/store/wallet';
	import contactsStore from 'popup/store/contacts';

	import AccountCard from '../components/AccountCard.svelte';
	import SearchBox from '../components/SearchBox.svelte';

  const dispatch = createEventDispatcher();

	let search = '';

	$: accounts = $walletStore.identities.filter(
		(acc) => String(acc.name).toLowerCase().includes(String(search).toLowerCase())
	);
  $: contacts = $contactsStore.filter(
		(contact) => String(contact.name).toLowerCase().includes(String(search).toLowerCase())
	);

	const onSelect = async (address) => {
		dispatch('selected', address);
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
<ul>
	{#if contacts.length > 0}
		{#each contacts as contact, i}
			<li
				in:fly={{
					delay: 100 * i,
					duration: 400,
					y: -20
				}}
				on:click={() => onSelect(contact.address)}
			>
				<div class="text">
					<b>
						{contact.name}
					</b>
					<p>
						{trim(contact.address, 10)}
					</p>
				</div>
			</li>
		{/each}
	{/if}
	<b>
		{$_('send.recipient.accounts')}:
	</b>
	{#if accounts.length > 0}
		{#each accounts as account, i}
			<li
				in:fly={{
					delay: 100 * i,
					duration: 400,
					y: -20
				}}
				on:click={() => onSelect(account.base58)}
			>
				<div class="text">
					<b>
						{account.name}
					</b>
					<p>
						{trim(account.base58, 10)}
					</p>
				</div>
			</li>
		{/each}
	{/if}
</ul>

<style lang="scss">
	@import "../styles/mixins";
	ul {
		padding: 0;
    margin: 0;
    overflow-y: scroll;
		padding-block-end: 70px;

		max-width: 390px;
		width: 100%;
    min-height: 530px;
		height: 100%;
		padding-left: 15px;
		padding-right: 15px;

		& > b {
			color: var(--text-color);
		}

		& > li {
			cursor: pointer;
			margin: 5px;
			background-color: var(--card-color);
			border-radius: 8px;
			border: solid 1px var(--card-color);

			padding-left: 30px;
			padding-right: 10px;
      padding-top: 10px;

			@include flex-between-row;

			&:hover {
				border: solid 1px var(--primary-color);
			}
			& > div {
				cursor: pointer;
			}
			& > div.text {
				width: 100%;
				& > b {
					font-size: 16px;
					color: var(--text-color);
					font-family: Bold;
				}
				& > p {
					font-size: 13px;
				}
			}
		}
	}
</style>
