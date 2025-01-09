<script lang="ts">
  import type { TokenRes } from "types/token";

  import { createEventDispatcher, onMount } from "svelte";

  import { fade } from "svelte/transition";
  import { _ } from "popup/i18n";
  import { trim } from "popup/filters/trim";

  import TokenImage from "../components/TokenImage.svelte";

  import { getFTTokens, addFTToken } from "popup/backend/tokens";
  import { TokenType, viewIcon } from "popup/utils/icon-view";

  import walletStore from "popup/store/wallet";
  import { formatNumber, toMass } from "app/filters/numbers";

  const dispatch = createEventDispatcher();

  let inputEl: HTMLInputElement;
  let address = "";
  let error = "";
  let loading = false;
  let disabled = true;
  let state: TokenRes;

  const hanldeOnInput = async () => {
    error = "";
    try {
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
      state = data;
    } catch (err) {
      console.error(err);
      error = (err as Error).message;
    }
    loading = false;
  };

  const addToken = async () => {
    loading = true;
    try {
      await addFTToken(state);
      dispatch("close");
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
  {#if state}
    <TokenImage
      src={viewIcon(address, TokenType.FT)}
      alt={state.symbol}
      height="78"
      width="78"
    />
    <ul in:fade>
      <li>
        <span>
          <b>
            {$_("tokens.modals.add.balance")}
          </b>
        </span>
        <span>
          <p>
            {formatNumber(
              toMass(
                String(state.balance[$walletStore.selectedAddress] || 0),
                state.decimals,
              ),
            )}
          </p>
        </span>
      </li>
      <li>
        <span>
          <b>
            {$_("tokens.modals.add.address")}
          </b>
        </span>
        <span>
          <p>
            {trim(address)}
          </p>
        </span>
      </li>
      <li>
        <span>
          <b>
            {$_("tokens.modals.add.decimals")}
          </b>
        </span>
        <span>
          <p>
            {state.decimals}
          </p>
        </span>
      </li>
      <li>
        <span>
          <b>
            {$_("tokens.modals.add.name")}
          </b>
        </span>
        <span>
          <p>
            {state.name}
          </p>
        </span>
      </li>
      <li>
        <span>
          <b>
            {$_("tokens.modals.add.symbol")}
          </b>
        </span>
        <span>
          <p>
            {state.symbol}
          </p>
        </span>
      </li>
    </ul>
    <button
      class="primary"
      disabled={loading}
      class:loading
      onmouseup={addToken}
    >
      {$_("tokens.modals.add.btns.add")}
    </button>
  {:else}
    <form autocomplete="off" onsubmit={handleSubmit}>
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
          oninput={hanldeOnInput}
        />
      </label>
      <button class="primary" disabled={disabled || loading} class:loading>
        {$_("tokens.modals.add.btns.fetch")}
      </button>
    </form>
  {/if}
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

    @include border-radius(16px);

    & > li {
      padding: 5px;
      border-bottom: solid 1px var(--hover-color);
      font-family: Regular;
      color: var(--text-color);
      font-size: 12pt;

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
    }
  }
  p {
    line-height: 0;
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
