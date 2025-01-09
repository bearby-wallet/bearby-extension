<script lang="ts">
	import { _ } from 'popup/i18n';
	import { push } from 'popup/routers/navigation'

  import { AccountTypes } from 'config/account-type';
	import { setPhishingDetection } from 'popup/backend/settings';
	import { changePassword } from 'app/backend/wallet';

	import walletStore from 'popup/store/wallet';
	import settingsStore from 'popup/store/settings';
	import guardStore from 'app/store/guard';

	import NavClose from '../../components/NavClose.svelte';
	import Toggle from '../../components/Toggle.svelte';
  import Modal from '../../components/Modal.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';
  import ExportKeyModal from '../../modals/ExportKey.svelte';
	import RevealPhraseModal from '../../modals/RevealPhrase.svelte';
  import Guard from '../../components/Guard.svelte';

	import { MIN_PASSWORD_LEN } from 'popup/config/account';

	let phraseModal = $state(false);
	let keyModal = $state(false);
	let loading = $state(false);
  let passError = $state('');
	let currentPassword = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	// guard
	let algorithm = $state($guardStore.algorithm);
	let iteractions = $state($guardStore.iteractions);
	// guard

	let disabled = $derived(loading || !password || confirmPassword !== password || Boolean(passError));
	let account = $derived($walletStore.identities[$walletStore.selectedAddress]);
	let keybtndisbaled = $derived(account.type !== AccountTypes.PrivateKey
		&& account.type !== AccountTypes.Seed
		&& account.type !== AccountTypes.Track);

	const hanldeOnTogglePhishingDetection = async () => {
		await setPhishingDetection();
	};

	const hanldeChangeGuard = (e: CustomEvent) => {
    algorithm = e.detail.algorithm;
    iteractions = e.detail.iteractions;
  };
	const handleSubmit = async (e: Event) => {
		e.preventDefault();
    loading = true;

		try {
      await changePassword({
				password,
				current: currentPassword,
				algorithm,
				iteractions
			});
			push('/lock');
      loading = false;
		} catch (err) {
			console.log(err);
			passError = (err as Error).message;
		}
		loading = false;
	}
</script>

<Modal
  show={phraseModal}
  title={$_('security.p_modal.title')}
  on:close={() => phraseModal = !phraseModal}
>
	<RevealPhraseModal />
</Modal>
<Modal
  show={keyModal}
  title={$_('security.key.title')}
  on:close={() => keyModal = !keyModal}
>
	<ExportKeyModal />
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
				role="button"
				tabindex="0"
				onmouseup={() => phraseModal = !phraseModal}
			>
				{$_('security.phrase.btn')}
			<span></span>
		</Jumbotron>
		{#if !keybtndisbaled}
			<Jumbotron
	title={$_('security.key.title')}
				description={$_('security.key.warn')}
			>
				<span
					class="warning"
					role="button"
					tabindex="0"
					onmouseup={() => keyModal = !keyModal}
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
		<Jumbotron
			title={$_('security.password.title')}
			description={$_('security.password.description')}
		>
			<form onsubmit={handleSubmit}>
				<b>
					{passError}
				</b>
				<label class="current-pass">
					<input
						bind:value={currentPassword}
						class:error="{Boolean(passError)}"
						type="password"
						class:loading={loading}
						autocomplete="off"
						disabled={loading}
						placeholder={$_('security.password.current')}
						required
						oninput={() => passError = ''}
					>
				</label>
				<label>
					<input
						bind:value={password}
						class:error="{Boolean(passError)}"
						type="password"
						class:loading={loading}
						autocomplete="off"
						disabled={loading}
						placeholder={$_('security.password.new')}
						minlength={MIN_PASSWORD_LEN}
						required
						oninput={() => passError = ''}
					>
				</label>
				<input
					bind:value={confirmPassword}
					class:error="{Boolean(passError)}"
					type="password"
					class:loading={loading}
					autocomplete="off"
					disabled={loading}
					placeholder={$_('restore.conf_placeholder')}
					minlength={MIN_PASSWORD_LEN}
					required
					oninput={() => passError = ''}
				>
				<Guard
					algorithm={algorithm}
					iteractions={iteractions}
					on:input={hanldeChangeGuard}
				/>
				<button
					class="outline"
					class:loading={loading}
					disabled={disabled}
				>
					{$_('restore.btn')}
				</button>
			</form>
		</Jumbotron>
	</div>
</main>

<style lang="scss">
	@use "../../styles/mixins" as mix;

	main {
		height: 100vh;
		padding-block-end: 16px;

		@include mix.flex-center-top-column;

		& > div {
			overflow-y: scroll;
		}
	}
	form {
		@include mix.flex-center-top-column;

		& > label, input, button {
			width: 100%;
			max-width: 290px;
		}
		& > button {
			margin-block-end: 16px;
		}
		& > input {
			margin: 5px;
		}
		& > b {
			color: var(--danger-color);
		}
		& > label.current-pass {
			margin: 16px;
		}
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
