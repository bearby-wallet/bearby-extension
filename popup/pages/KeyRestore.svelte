<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
  import { AccountTypes } from 'config/account-type';
  import {
    MAX_NAME_LEN,
    MIN_NAME_LEN,
    DEFAULT_KEY_NAME
  } from 'popup/config/account';
	import walletStore from 'popup/store/wallet';
	import { balanceUpdate, restoreSecretKey } from 'popup/backend/wallet';

  import NavClose from '../components/NavClose.svelte';


  let error = '';
  let key = '';
  let lastIndex = $walletStore
    .identities
    .filter((acc) => acc.type === AccountTypes.PrivateKey)
    .length;
  let name = `${DEFAULT_KEY_NAME} ${lastIndex}`;
	let loading = false;

  $: disabled = loading || name.length < MIN_NAME_LEN || key[0] !== 'S';

  const handleInputTextarea = () => {
		error = '';
	};
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    loading = true;

		try {
      await restoreSecretKey(key, name);
		} catch (err) {
      error = (err as Error).message;
      loading = false;
      return null;
		}

    try {
      await balanceUpdate();
    } catch {
      ///
    }
    push('/');
    loading = false;
  };
</script>

<main>
	<NavClose title={$_('restore_secret.title')}/>
  <form on:submit={handleSubmit}>
    <label>
      <b class:error="{Boolean(error)}">
        {error}
      </b>
      <textarea
        bind:value={key}
        class:error="{Boolean(error)}"
        placeholder={$_('restore_secret.placeholder')}
        required
        on:input={handleInputTextarea}
      />
    </label>
    <label class="name">
			<input
				bind:value={name}
        maxlength={MAX_NAME_LEN}
        minlength={MIN_NAME_LEN}
				placeholder={$_('setup_acc.name_placeholder')}
        required
			>
			<p>
				{$_('setup_acc.name_description')}
      </p>
		</label>
    <button
      class="outline"
      class:loading={loading}
      disabled={disabled}
    >
      {$_('restore.btn')}
    </button>
  </form>
</main>

<style lang="scss">
	@import "../styles/mixins";
	main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-top-column;
	}
  textarea {
    width: calc(100vw - 30px);
  }
  form {
    width: calc(100vw - 30px);
    @include flex-center-column;
  }
  input {
    width: 100%;
  }
  button {
    max-width: 290px;
  }
  b {
    text-align: center;

		@include fluid-font(320px, 600px, 14px, 25px);

    &.error {
      color: var(--danger-color);
    }
  }
  label {
    @include flex-column;

    &.name {
      width: 290px;
    }

    & > p {
      margin: 0;
      text-indent: 8px;
      margin-block-end: 11px;
    }
  }
</style>
