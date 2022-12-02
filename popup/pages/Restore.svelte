<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
  import { createWallet } from "popup/backend/wallet";
  import {
    MIN_PASSWORD_LEN,
    MAX_NAME_LEN,
    MIN_NAME_LEN,
    DEFAULT_NAME
  } from 'popup/config/account';
  import { ShaAlgorithms } from "config/sha-algorithms";
  import { ITERACTIONS } from 'config/guard';

	import NavClose from '../components/NavClose.svelte';
  import Guard from '../components/Guard.svelte';


  let error = '';
  let passError = '';
  let name = `${DEFAULT_NAME} 0`;
  let words: string;
  let password: string;
  let confirmPassword: string;
	let loading = false;
  // guard
  let algorithm = ShaAlgorithms.Sha512;
  let iteractions = ITERACTIONS;
  // guard

	$: disabled = loading || !password || confirmPassword !== password || name.length < MIN_NAME_LEN;

  const handleSubmit = async (e: Event) => {
		e.preventDefault();
    loading = true;

		try {
      await createWallet(words, password, name, algorithm, iteractions);
      loading = false;
      push('/created');
		} catch (err) {
			error = (err as Error).message;
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
  const hanldeChangeGuard = (e: CustomEvent) => {
    algorithm = e.detail.algorithm;
    iteractions = e.detail.iteractions;
  };
</script>

<main>
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
</main>

<style lang="scss">
  @import "../styles/mixins";
  main {
    background: inherit;
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
		@include fluid-text(600px, 12pt, 18pt);
    @include flex-center-column;

    & > input {
      min-width: 290px;
    }
  }
</style>
