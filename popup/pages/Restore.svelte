<script lang="ts">
	import { pop, push } from 'svelte-spa-router';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';
  import { createNextSeedAccount, restorePhrase } from "popup/backend/wallet";
  import {
    MIN_PASSWORD_LEN,
    MAX_NAME_LEN,
    MIN_NAME_LEN,
    DEFAULT_NAME
  } from 'popup/config/account';

	import NavClose from '../components/NavClose.svelte';

  let error = '';
  let passError = '';
  let name = `${DEFAULT_NAME} 0`;
  let words: string;
  let password: string;
  let confirmPassword: string;
	let loading = false;

	$: disabled = loading || !password || confirmPassword !== password || name.length < MIN_NAME_LEN;

  const handleSubmit = async (e) => {
		e.preventDefault();
    loading = true;

		try {
      await restorePhrase(words, password);
      await createNextSeedAccount(name);
      loading = false;
      push('/created');
		} catch (err) {
			error = err.message;
		}
		loading = false;
	}
  const handleInputTextarea = () => {
		error = '';
	};
  const handleInputPassword = () => {
    passError = '';
	};
  const handleOnBlurPassword = () => {
    if (password && password.length < MIN_PASSWORD_LEN) {
      passError = $_('restore.pass_len_error');
    }
	};
</script>

<main in:fly={flyTransition.in}>
  <NavClose title={$_('restore.title')}/>
  <form on:submit={handleSubmit}>
    <label>
      {error}
      <textarea
        bind:value={words}
        class:error="{Boolean(error)}"
        placeholder={$_('restore.placeholder')}
        required
        on:input={handleInputTextarea}
      />
    </label>
    <input
      bind:value={name}
      maxlength={MAX_NAME_LEN}
      minlength={MIN_NAME_LEN}
      placeholder={$_('setup_acc.name_placeholder')}
      required
    >
    <label>
      <input
        bind:value={password}
        class:error="{Boolean(passError)}"
        type="password"
        autocomplete="off"
        placeholder={$_('restore.pass_placeholder')}
        minlength={MIN_PASSWORD_LEN}
        required
        on:input={handleInputPassword}
        on:blur={handleOnBlurPassword}
      >
      {passError}
    </label>
    <input
      bind:value={confirmPassword}
      type="password"
      autocomplete="off"
      placeholder={$_('restore.conf_placeholder')}
      minlength={MIN_PASSWORD_LEN}
      required
    >
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
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-top-column;
  }
  form {
    width: 100%;
    @include flex-center-column;

    & > input, button {
      max-width: 290px;
      margin: 10px;
    }
  }
  label {
    color: var(--danger-color);
		@include fluid-font(320px, 600px, 13px, 20px);
    @include flex-center-column;
    font-family: Regular;

    & > input {
      min-width: 290px;
    }
  }
</style>
