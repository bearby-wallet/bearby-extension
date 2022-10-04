<script lang="ts">
  import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';

  import { exportPrivateKey } from 'popup/backend/wallet';
  import { trim } from 'popup/filters/trim';


  let passwordElement = null;
  let loading = false;
  let password = '';
  let error = '';
  let key = '';
  let base58 = '';

  $: buttonDisabled = loading || error || !password;

  onMount(() => {
    if (passwordElement && passwordElement.focus) {
      passwordElement.focus();
    }
  });

  const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			loading = true;
      const keyPair = await exportPrivateKey(password);
      key = keyPair.privKey;
      base58 = keyPair.base58;
		} catch (err) {
      error = err.message;
		}
		loading = false;
	}
</script>

<form on:submit={handleSubmit}>
  <div class="warn-message">
    <strong>
      {$_('security.key.warn')}
    </strong>
  </div>
  {#if key}
    <p>
      {$_('security.key.for')}: {trim(base58, 10)}
    </p>
    <textarea
      bind:value={key}
      readonly
    />
  {:else}
    <label>
      <input
        bind:this={passwordElement}
        bind:value={password}
        title={error}
        class:error={Boolean(error)}
        type="password"
        autocomplete="off"
        placeholder={$_('lock.placeholder')}
        required
        on:input={() => error = ''}
      >
    </label>
    <button
      class="outline"
      disabled={buttonDisabled}
    >
      {$_('security.key.btn')}
    </button>
  {/if}
</form>

<style lang="scss">
	@import "../styles/mixins";
  form {
    padding: 8px;
    height: 600px;
    @include flex-center-top-column;

    & > label,
    & > button {
      margin-block-end: 10px;
      width: 290px;
    }
  }
  input.error {
    outline-color: var(--danger-color);
    animation: shake .4s linear;
  }
  .warn-message {
    text-align: center;
    padding: 10px;
    border: solid 1px var(--danger-color);
    margin-block-end: 16px;

    @include border-radius(16px);

    & > strong {
      width: 280px;
      color: var(--danger-color);
      font-size: 13pt;
    }
  }
  textarea {
    font-size: 16px;
    width: 100%;
    height: min-content;
    line-height: 1em;
  }
</style>
