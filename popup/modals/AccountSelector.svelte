<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
	import { _ } from 'popup/i18n';
  import { trim } from 'popup/filters/trim';

	import walletStore from 'popup/store/wallet';
	import contactsStore from 'popup/store/contacts';

	import AccountCard from '../components/AccountCard.svelte';
	import SearchBox from '../components/SearchBox.svelte';

	import { generateBlockies } from 'popup/mixins/blockies';


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

	onMount(() => {
		for (let index = 0; index < contacts.length; index++) {
			const contact = contacts[index];
			const ctx = document.getElementById(contact.address);

			generateBlockies(contact.address, ctx);
		}
		for (let index = 0; index < accounts.length; index++) {
			const account = accounts[index];
			const ctx = document.getElementById(account.pubKey);

			generateBlockies(account.pubKey, ctx);
		}
	});
</script>

<SearchBox
  placeholder={$_('accounts.placeholder')}
  focus
  on:input={onInputSearch}
/>
<ul>
	{#if contacts.length > 0}
		<p>
			{$_('send.recipient.contacts')}
		</p>
		{#each contacts as contact, i}
			<li on:click={() => onSelect(contact.address)}>
				<span id={contact.address}/>
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
	{#if accounts.length > 0}
		<p>
			{$_('send.recipient.accounts')}
		</p>
		{#each accounts as account, i}
			<li on:click={() => onSelect(account.base58)}>
				<span id={account.pubKey}/>
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

		max-width: 500px;
		width: 100%;
		height: 100%;

		& > p {
			text-align: center;
		}

		& > li {
			cursor: pointer;

			padding: 8px;

			@include flex-between-row;

			& > span {
				margin-right: 10px;
				margin-left: 10px;
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
			&:hover {
				background-color: var(--card-color);
			}
		}
	}
</style>
