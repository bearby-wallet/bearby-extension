<script lang="ts">
  import { goto } from "@mateothegreat/svelte5-router";
	import { _ } from 'popup/i18n';
  import { createWallet, checBip39Word } from "popup/backend/wallet";
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
  let password: string;
  let confirmPassword: string;
	let loading = false;

  // BIP39
  let length = 12;
  let errors = Array(length).fill(true);
  let words = Array(length).fill("");
  // BIP39

  // guard
  let algorithm = ShaAlgorithms.Sha512;
  let iteractions = ITERACTIONS;
  // guard

	$: disabled = loading || !password || confirmPassword !== password || name.length < MIN_NAME_LEN;

  const handleSubmit = async (e: Event) => {
		e.preventDefault();
    loading = true;

		try {
      errors = await checBip39Word(words);
      let hasTrue = errors.some((e) => e === false);

      if (hasTrue) {
        error = 'invalid words';
        loading = false;
        return;
      }

      await createWallet(words.join(" "), password, name, algorithm, iteractions);
      loading = false;
      goto('/created');
		} catch (err) {
			error = (err as Error).message;
		}
		loading = false;
	}
  const handleOnChangeLen = (event: Event) => {
    error = '';
    length = Number((event.target as HTMLInputElement).value);
    
    for (let index = words.length; index < length; index++) {
      words[index] = "";
      errors[index] = true;
    }
  };
  const handleInputPassword = () => {
    passError = '';
	};
  const handleInputWord = (event: Event) => {
    error = '';
    let value = String((event.target as HTMLInputElement).value);
    let splited = value.split(" ");

    if (splited.length == 12 || splited.length == 15 || splited.length == 18 || splited.length == 21 || splited.length == 24) {
      length = splited.length;
      errors = Array(length).fill(true);
      words = splited;
    }
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
    <div class="sw">
      <select on:input={handleOnChangeLen}>
        {#each [12, 15, 18, 21, 24] as v}
          <option
            value={v}
            selected={length === v}
          >
            {v}
          </option>
        {/each}
      </select>
    </div>
    <div class="inputs-warp">
      {#each Array(length) as v, index}
        <input
          type="text"
          placeholder={'#' + (index + 1)}
          bind:value={words[index]}
          class:error={!errors[index]}
          on:input={handleInputWord}
        >
      {/each}
    </div>
    <div class="error">
      <p>
        {error}
      </p>
    </div>
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
  div.error {
    & > p {
      font-size: 14pt;
      color: var(--danger-color);
    }
  }
  form {
    width: 100%;
    @include flex-center-column;

    & > .inputs-warp {
      overflow-y: scroll;

      height: fit-content;
      max-height: calc(100vh - 200px);
      width: 100%;
      max-width: 450px;

      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;

      & > input {
        max-width: 100pt;
        margin: 2pt;
        height: 25pt;
        font-size: 11pt;
        line-height: 21pt;
        padding: 5pt;

        &.error {
          border-color: var(--danger-color);
          color: var(--danger-color);
        }
      }
    }
    & > input, button {
      max-width: 290px;
      margin: 10px;
    }
  }
  div.sw {
    max-height: calc(100vh - 30px);
    width: 100%;
    max-width: 450px;

    padding: 5px;

    display: flex;
    justify-content: flex-end;

    & > select  {
      height: 34px;
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
