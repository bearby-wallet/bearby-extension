<script lang="ts">
	import { _ } from 'popup/i18n';
  import { formatNumber } from 'popup/filters/numbers';

  import settingsStore from 'popup/store/settings';


  export let tx;
  export let loading = false;

  $: amount = Number(tx.tokenAmount) / 10**tx.token.decimals;
  $: rate = 0;
  $: converted = 0;
  $: date = new Date(tx.timestamp).toLocaleDateString();
</script>

<div
  class="card"
  class:success={tx.confirmed && tx.success}
  class:error={tx.confirmed && !tx.success}
  class:loading={loading}
>
  <div>
    <h3>
      {tx.teg || $_(`confirm.params.types.${tx.type}`)}
    </h3>
    <p>
      {date}
    </p>
  </div>
  <div>
    <h3>
      {formatNumber(amount, tx.token.symbol)}
    </h3>
    <p>
      {formatNumber(converted, $settingsStore.currency)}
    </p>
  </div>
</div>

<style lang="scss">
  @import "../styles/mixins";
  div.card {
    cursor: pointer;

    min-width: 290px;
    background-color: var(--card-color);
    border-left: solid 5px var(--secondary-color);
    box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;

    @include flex-between-row;
    @include border-radius(16px);

    &.success {
      border-left: solid 5px var(--success-color);
    }
    &.error {
      border-left: solid 5px var(--danger-color);
    }
    &.loading {
			border-color: transparent;

      @include loading-gradient(var(--loading-color), var(--card-color));
    }
    & > div {
      padding-left: 10px;
      padding-right: 10px;

      &:last-child {
        text-align: right;
      }
      & > h3 {
        font-size: 10pt;
        margin-block-end: 0;
      }
      & > p {
        font-size: 8pt;
      }
    }
  }
</style>
