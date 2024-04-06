<script lang="ts">
  import type { Token } from "types";

  import { createEventDispatcher } from "svelte";
  import { formatNumber } from "popup/filters/numbers";
  import { TokenType, viewIcon } from "popup/utils/icon-view";

  import walletStore from "popup/store/wallet";
  import settingsStore from "popup/store/settings";

  const dispatch = createEventDispatcher();

  export let token: Token = {
    decimals: 9,
    rate: 1,
    name: "",
    symbol: "",
    base58: "",
  };
  export let loading = false;
  export let disabled = false;

  $: account = $walletStore.identities[$walletStore.selectedAddress];
  $: img = viewIcon(token.base58, TokenType.FT);
  $: balance =
    account.tokens && account.tokens[token.base58]
      ? account.tokens[token.base58].final
      : 0;
  $: converted = 0;

  const onClick = () => {
    if (!disabled) {
      dispatch("select");
    }
  };
  const hanldeLoadError = (e) => {
    e.target.src = "/icons/unknown.svg";
  };
</script>

<div class="token-card" class:loading class:disabled on:mouseup={onClick}>
  <div>
    <p class="symbol">
      {token.symbol}
    </p>
    <p class="balance">
      {formatNumber(balance)}
    </p>
    <p class="conv">
      {formatNumber(converted, $settingsStore.currency)}
    </p>
  </div>
  <div class="img-wrapper">
    <img
      src={img}
      alt={token.symbol}
      width="28"
      height="28"
      loading="lazy"
      on:error={hanldeLoadError}
    />
  </div>
</div>

<style lang="scss">
  @import "../styles/mixins";

  :global(body[theme="dark"]) {
    div.token-card {
      box-shadow: none;
    }
  }
  div.token-card {
    cursor: pointer;

    padding: 12px;
    margin: 3px;
    width: 142px;

    border: solid 2px var(--card-color);
    background-color: var(--card-color);

    box-shadow:
      rgb(0 0 0 / 1%) 0px 0px 1px,
      rgb(0 0 0 / 4%) 0px 4px 8px,
      rgb(0 0 0 / 4%) 0px 16px 24px,
      rgb(0 0 0 / 1%) 0px 24px 32px;

    @include flex-between-row;
    @include border-radius(16px);

    &.loading {
      border-color: transparent;

      @include loading-gradient(var(--loading-color), var(--card-color));
    }
    &.disabled {
      cursor: unset;
      opacity: 0.7;
    }
    &.disabled:hover {
      border-color: var(--card-color);
    }
    &:hover {
      border-color: var(--primary-color);
    }
  }
  p.symbol {
    font-size: 13pt;
    opacity: 0.5;
    font-weight: bold;

    line-height: 0;
    margin-block-end: 20px;
  }
  p.balance {
    font-size: 11pt;
    line-height: 0px;
    color: var(--text-color);
    margin-block-end: 10px;
    margin-block-start: 30px;
  }
  p.conv {
    font-size: 9pt;
    line-height: 5px;
    opacity: 0.5;
  }
  div.img-wrapper {
    height: 100%;
  }
</style>
