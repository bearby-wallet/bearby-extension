<script lang="ts">
  import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';

  import { exportSecrePhrase } from 'popup/backend/wallet';

  let passwordElement: HTMLInputElement | null = null;
  let loading = false;
  let password = '';
  let error = '';
  let words = '';

  $: buttonDisabled = loading || error || !password;

  onMount(() => {
    if (passwordElement && passwordElement.focus) {
      passwordElement.focus();
    }
  });

  const handleSubmit = async (e: Event) => {
		e.preventDefault();

		try {
			loading = true;
      words = await exportSecrePhrase(password);
		} catch (err) {
      error = (err as Error).message;
		}
		loading = false;
	}
</script>

<form onsubmit={handleSubmit}>
  <div class="warn-message">
    <strong>
      {$_('security.p_modal.warn')}
    </strong>
  </div>
  {#if words}
    <textarea
      bind:value={words}
      readonly
    ></textarea>
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
        oninput={() => error = ''}
      >
    </label>
    <button
      class="outline"
      disabled={Boolean(buttonDisabled)}
    >
      {$_('send.continue')}
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
      font-size: 14pt;
    }
  }
  textarea {
    font-size: 16px;
    width: 100%;
    height: min-content;
    line-height: 1em;
  }
</style>
