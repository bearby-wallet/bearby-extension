<script lang="ts">
	import { _ } from 'popup/i18n';
	import { push } from 'popup/routers/navigation';
  import { AccountTypes } from 'config/account-type';
  import {
    MAX_NAME_LEN,
    MIN_NAME_LEN,
    DEFAULT_TRACK_NAME
  } from 'popup/config/account';
	import walletStore from 'popup/store/wallet';
	import { importAccountTracker } from 'popup/backend/wallet';

  import NavClose from '../components/NavClose.svelte';


  let lastIndex = $walletStore
    .identities
    .filter((acc) => acc.type === AccountTypes.Track)
    .length;
  let name = `${DEFAULT_TRACK_NAME} ${lastIndex}`;
	let loading = false;
  let addressError = '';
  let address = '';

  $: disabled = loading || name.length < MIN_NAME_LEN || !address;

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    addressError = '';
    loading = true;
    try {
      await importAccountTracker(address, name);
      push('/');
    } catch (err) {
      addressError = (err as Error).message;
    }
    loading = false;
  };

  async function onInput(e: Event) {
    addressError = '';
    const { value } = e.target as HTMLInputElement;
    address = value;
  }
</script>

<main>
	<NavClose title={$_('account_track.title')}/>
  <form onsubmit={handleSubmit}>
    <label>
			<input
				bind:value={name}
        maxlength={MAX_NAME_LEN}
        minlength={MIN_NAME_LEN}
				placeholder={$_('setup_acc.name_placeholder')}
        required
			>
			<p>
				{$_('account_track.placeholder')}
      </p>
		</label>
    <label class:error={addressError}>
      {addressError}
      <input
        bind:value={address}
        class:error={addressError}
        placeholder={$_('send.recipient.placeholder')}
        oninput={onInput}
      >
      <p>
				{$_('account_track.description')}
      </p>
    </label>
    <button
      class="primary"
      class:loading={loading}
      disabled={disabled}
    >
      {$_('restore.btn')}
    </button>
  </form>
</main>

<style lang="scss">
	@use "../styles/mixins";
	main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-top-column;
	}
  form {
    width: 100%;
    @include flex-center-column;

    & > label, button {
      width: 100%;
      max-width: 290px;
      margin: 10px;
    }
  }
</style>
