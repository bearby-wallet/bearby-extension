<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';

  import { AccountTypes } from 'config/account-type';
	import { setPhishingDetection } from 'popup/backend/settings';

	import walletStore from 'popup/store/wallet';
	import settingsStore from 'popup/store/settings';

	import NavClose from '../../components/NavClose.svelte';
	import Toggle from '../../components/Toggle.svelte';
  import Modal from '../../components/Modal.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';

	let phraseModal = false;
	let keyModal = false;

	$: account = $walletStore.identities[$walletStore.selectedAddress];
	$: keybtndisbaled = account.type !== AccountTypes.PrivateKey && account.type !== AccountTypes.Seed;

	const hanldeOnTogglePhishingDetection = async () => {
		await setPhishingDetection();
	};
</script>

<Modal
  show={phraseModal}
  title={$_('security.p_modal.title')}
  on:close={() => phraseModal = !phraseModal}
>
	<!-- <RevealPhraseModal /> -->
</Modal>
<Modal
  show={keyModal}
  title={$_('security.key.title')}
  on:close={() => keyModal = !keyModal}
>
	<!-- <ExportKeyModal /> -->
</Modal>
<main>
	<NavClose title={$_('security.title')}/>
	<div>

		<Jumbotron
			title={$_('security.phrase.title')}
			description={$_('security.phrase.description')}
		>
			<span
				class="warning"
				on:click={() => phraseModal = !phraseModal}
			>
				{$_('security.phrase.btn')}
			</span>
		</Jumbotron>
		{#if !keybtndisbaled}
			<Jumbotron
				title={$_('security.key.title')}
				description={$_('security.key.warn')}
			>
				<span
					class="warning"
					on:click={() => keyModal = !keyModal}
				>
					{$_('security.key.btn')}
				</span>
			</Jumbotron>
		{/if}
		<Jumbotron
			title={$_('security.phishing.title')}
			description={$_('security.phishing.warn')}
		>
			<div class="right">
				<Toggle
					checked={$settingsStore.phishing}
					on:toggle={hanldeOnTogglePhishingDetection}
				/>
			</div>
		</Jumbotron>
	</div>
</main>

<style lang="scss">
	@import "../../styles/mixins";

	main {
		height: 100vh;
    overflow-y: scroll;

		@include flex-center-top-column;
	}
	span {
		&.warning {
			cursor: pointer;
			font-size: 16px;
			color: var(--primary-color);

			&:hover {
				color: var(--warning-color);
			}
		}
	}
</style>
