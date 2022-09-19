<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
  import { trim } from 'popup/filters/trim';

	import walletStore from 'popup/store/wallet';

	import NavClose from '../components/NavClose.svelte';
	import AccountsModal from '../modals/Accounts.svelte';

	const onSelectAccount = async ({ detail }) => {
		console.log(detail);
		push('/');
	};
</script>

<main>
	<NavClose title={$_('accounts.title')}/>
	<AccountsModal
		list={$walletStore.identities}
		index={$walletStore.selectedAddress}
		on:selected={onSelectAccount}
	/>
</main>

<style lang="scss">
	@import "../styles/mixins";
	main {
    background: inherit;
		height: 100vh;

		@include flex-center-top-column;
	}
</style>
