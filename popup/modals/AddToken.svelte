<script lang="ts">
  import type { TokenRes } from "types/token";

  import { createEventDispatcher, onMount } from "svelte";
  import { _ } from "popup/i18n";

  import { getFTTokens } from "popup/backend/tokens";

  let inputEl: HTMLInputElement;
  let address = "";
  let error = "";
  let loading = false;
  let disabled = true;
  let state: TokenRes;

  const hanldeOnInput = async () => {
    error = "";
    try {
      // await fromBech32(address);
      disabled = false;
    } catch {
      disabled = true;
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    loading = true;
    try {
      let [data] = await getFTTokens(address);

      console.log(data);
      // TODO: Fetch the state.
    } catch (err) {
      console.error(err);
      error = (err as Error).message;
    }
    loading = false;
  };

  onMount(() => {
    if (inputEl && inputEl.focus) {
      inputEl.focus();
    }
  });
</script>

<div class="wrapper">
  <h2 class="error">
    {error}
  </h2>
  <form autocomplete="off" on:submit={handleSubmit}>
    <label>
      <input
        bind:this={inputEl}
        bind:value={address}
        type="text"
        autocomplete="off"
        autocorrect="off"
        class:loading
        disabled={loading}
        placeholder={$_("tokens.modals.add.placeholder")}
        on:input={hanldeOnInput}
      />
    </label>
    <button class="primary" disabled={disabled || loading} class:loading>
      {$_("tokens.modals.add.btns.fetch")}
    </button>
  </form>
</div>

<style lang="scss">
  @import "../styles/mixins";
  div.wrapper {
    @include flex-center-top-column;
  }
  h2.error {
    color: var(--danger-color);
    font-size: 16px;
  }
  ul {
    min-width: 300px;
    max-width: 490px;
    width: calc(100vw - 20px);

    padding: 10px;
    background-color: var(--card-color);
    box-shadow:
      rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
      rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;

    @include border-radius(16);

    & > li {
      padding: 5px;
      border-bottom: solid 1px var(--border-color);
      font-family: Regular;
      color: var(--text-color);

      @include flex-between-row;

      &:last-child {
        border-bottom: solid 1px transparent;
      }
      & > span {
        @include text-shorten;
      }
      & > span:last-child {
        font-family: Demi;
        text-align: right;
      }
      & > div {
        text-align: right;

        & > p {
          margin: 0;
        }
      }
    }
  }
  form {
    @include flex-center-top-column;
  }
  label,
  button {
    margin: 10px;
    width: 290px;
  }
</style>
