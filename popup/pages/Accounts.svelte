<script lang="ts">
	import { push } from 'popup/routers/navigation';
	import { _ } from 'popup/i18n';

	import walletStore from 'popup/store/wallet';

	import NavClose from '../components/NavClose.svelte';
	import AccountsModal from '../modals/Accounts.svelte';

	import { selectAccount } from 'popup/backend/wallet';


	const onSelectAccount = async (e: CustomEvent) => {
		await selectAccount(e.detail);
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
	@use "../styles/mixins";
	main {
		height: 100vh;
		overflow: hidden;

		@include flex-center-top-column;

		:global(ul) {
			max-width: 500px;
		}
	}
</style>
