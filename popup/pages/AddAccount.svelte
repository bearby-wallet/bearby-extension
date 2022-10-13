<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
  import { AccountTypes } from 'config/account-type';
  import {
    MAX_NAME_LEN,
    MIN_NAME_LEN,
    DEFAULT_NAME
  } from 'popup/config/account';
	import walletStore from 'popup/store/wallet';
	import { createNextSeedAccount, balanceUpdate } from 'popup/backend/wallet';

  import NavClose from '../components/NavClose.svelte';


  let lastIndex = $walletStore
    .identities
    .filter((acc) => acc.type === AccountTypes.Seed)
    .length;
  let name = `${DEFAULT_NAME} ${lastIndex}`;
	let loading = false;

  $: disabled = loading || name.length < MIN_NAME_LEN;

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    loading = true;

		try {
      await createNextSeedAccount(name);
		} catch (err) {
      console.error(err);
      ////
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
	<NavClose title={$_('setup_acc.title')}/>
  <form on:submit={handleSubmit}>
    <label>
			<input
				bind:value={name}
        maxlength={MAX_NAME_LEN}
        minlength={MIN_NAME_LEN}
				placeholder={$_('setup_acc.name_placeholder')}
        required
			>
			<p>
				{$_('setup_acc.name')}
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
	@import "../styles/mixins";
	main {
		height: 100vh;

		@include flex-center-top-column;
	}
  form {
    width: 100%;
    @include flex-center-column;

    & > label,
    & > button {
      width: 100%;
      max-width: 290px;
      margin: 10px;
    }

    & > label > p {
      margin: 0;
      text-indent: 8px;
    }
  }
</style>
