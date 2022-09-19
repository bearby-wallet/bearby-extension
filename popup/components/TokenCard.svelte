<script lang="ts">
  import type { Token } from 'types';

  import { createEventDispatcher } from 'svelte';
  import { formatNumber } from 'popup/filters/numbers';
  import { viewIcon } from 'popup/utils/icon-view';

  import walletStore from 'popup/store/wallet';

  const dispatch = createEventDispatcher();

  export let token: Token = {
    decimals: 9,
    rate: 1,
    name: '',
    symbol: '',
    base58: ''
  };
  export let loading = false;

  $: account = $walletStore.identities[$walletStore.selectedAddress];
  $: img = viewIcon(token.base58);
  $: balance = account.tokens[token.base58].final;
  $: converted = 0;

  const onClick = () => {
    dispatch('select');
  };
</script>

<div
  class="token-card"
  class:loading={loading}
  on:click={onClick}
>
  <div>
    <p class="symbol">
      {token.symbol}
    </p>
    <p class="balance">
      {formatNumber(balance)}
    </p>
    <p class="conv">
      {formatNumber(converted)}
    </p>
  </div>
  <div class="img-wrapper">
    <img
      src={img}
      alt={token.symbol}
      width="28"
      height="28"
      loading="lazy"
    />
  </div>
</div>

<style lang="scss">
  @import "../styles/mixins";
  div.token-card {
    cursor: pointer;

    padding: 12px;
    margin: 3px;
    width: 142px;

    border: solid 2px var(--card-color);
    background-color: var(--card-color);
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;

    @include flex-between-row;
    @include border-radius(8px);

    &.loading {
      @include loading-gradient(var(--background-color), var(--card-color));
    }
    &:hover {
      border-color: var(--primary-color);
    }
  }
  p.symbol {
    font-size: 16px;
    line-height: 0;
    margin-block-end: 20px;
    font-family: Demi;
  }
  p.balance {
    font-size: 13px;
    line-height: 0px;
    font-family: Bold;
    color: var(--text-color);
    margin-block-end: 10px;
    margin-block-start: 30px;
  }
  p.conv {
    font-size: 12px;
    line-height: 5px;
  }
  div.img-wrapper {
    height: 100%;
  }
</style>
