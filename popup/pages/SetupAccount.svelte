<script lang="ts">
	import { onMount } from 'svelte';
	import { push } from 'popup/routers/navigation';
	import { _ } from 'popup/i18n';
	import { createWallet } from "popup/backend/wallet";
  import wordsStore from 'popup/store/words';
  import {
    MIN_PASSWORD_LEN,
    MAX_NAME_LEN,
    MIN_NAME_LEN,
    DEFAULT_NAME
  } from 'popup/config/account';
  import { ShaAlgorithms } from "config/sha-algorithms";
  import { ITERACTIONS } from 'config/guard';

  import BackBar from '../components/BackBar.svelte';
  import Guard from '../components/Guard.svelte';


	let loading = $state(false);
  let name = $state(`${DEFAULT_NAME} 0`);
  let passError = $state('');
  let password: string = $state("");
  let confirmPassword: string = $state("");
  // guard
  let algorithm = $state(ShaAlgorithms.Sha512);
  let iteractions = $state(ITERACTIONS);
  // guard

  let disabled = $derived(loading || !password || confirmPassword !== password || name.length < MIN_NAME_LEN);

	onMount(() => {
    if ($wordsStore.length < 12) {
      return push('/create');
    }
  });

  const handleInputPassword = () => {
    passError = '';
	};
	const handleOnBlurPassword = () => {
    if (password && password.length < MIN_PASSWORD_LEN) {
      passError = $_('restore.pass_len_error');
    }
	};
  const handleSubmit = async (e: Event) => {
		e.preventDefault();
    loading = true;

		try {
			const words = $wordsStore.join(' ');
      await createWallet(words, password, name, algorithm, iteractions);
      push('/created');
			loading = false;
		} catch (err) {
			passError = (err as Error).message;
      loading = false;
		}
	}
  const hanldeChangeGuard = (e: CustomEvent) => {
    algorithm = e.detail.algorithm;
    iteractions = e.detail.iteractions;
  };
</script>

<main>
	<BackBar
    length={3}
    selected={2}
  />
	<h1>
    {$_('setup_acc.title')}
  </h1>
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
				{$_('setup_acc.name_description')}
      </p>
		</label>
		<label>
      <input
        bind:value={password}
        class:error="{Boolean(passError)}"
        type="password"
        autocomplete="off"
        placeholder={$_('restore.pass_placeholder')}
        minlength={MIN_NAME_LEN}
        required
        oninput={handleInputPassword}
        onblur={handleOnBlurPassword}
      >
      {passError}
    </label>
		<label>
			<input
				bind:value={confirmPassword}
				type="password"
        autocomplete="off"
				placeholder={$_('restore.conf_placeholder')}
				minlength={MIN_NAME_LEN}
				required
			>
			<p>
				{$_('setup_acc.pass_description')}
      </p>
		</label>
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
  @use "../styles/mixins";
  main {
    background: inherit;
		height: 100vh;

		@include flex-center-top-column;
  }
  h1 {
    @include fluid-text(600px, 25pt, 45pt);
  }
  form {
    width: 100%;
    @include flex-center-column;

    & > label > p {
      margin-block: 2px;
      text-indent: 8px;
      font-size: 11px;
    }

    & > label, button {
      width: 100%;
      max-width: 290px;
      margin: 10px;
    }
  }
</style>
