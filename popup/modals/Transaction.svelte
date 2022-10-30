<script lang="ts">
  import type { HistoryTransaction } from 'types';

	import { _ } from 'popup/i18n';

  import { trim } from 'popup/filters/trim';
  import { formatNumber } from 'popup/filters/numbers';
  import { clipboardCopy } from 'popup/mixins/clipboard';

  import settingsStore from 'popup/store/settings';
  import tokensStore from 'popup/store/tokens';

  import Tooltip from '../components/Tooltip.svelte';


  export let tx: HistoryTransaction;

  let tip = $_('home.clipboard.copy');

  $: amount = Number(tx.tokenAmount) / 10**tx.token.decimals;
  $: hash = tx.hash;
  $: operate = Number(tx.amount) > 0 ? '-' : '';
  $: converted = 0;

  function hanldeOnCopy(content: string) {
    clipboardCopy(content);
    tip = $_('home.clipboard.copied');
    setTimeout(() => {
      tip = $_('home.clipboard.copy');
    }, 500);
  }
</script>

<div class="tx">
  {#if tx.icon}
    <img
      src={tx.icon}
      alt={tx.title}
      width="30"
    />
  {/if}
  <h1>
    {operate} {formatNumber(amount, tx.token.symbol)} <span>
      + {$tokensStore[0].symbol} {tx.fee}
    </span>
  </h1>
  <p>
    {formatNumber(converted, $settingsStore.currency)}
  </p>
  <ul class:loading={!tx.confirmed}>
    <li>
      <span>
        {tx.title}
      </span>
    </li>
    <li>
      <span>
        {$_('history.modals.details.from')}
      </span>
      <Tooltip
        tip={tip}
        bottom
      >
        <span
          class="pointer"
          on:mouseup={() => hanldeOnCopy(tx.from)}
        >
          {trim(tx.from)}
        </span>
      </Tooltip>
    </li>
    <li>
      <span>
        {$_('history.modals.details.recipient')}
      </span>
      <span>
        {trim(tx.recipient)}
      </span>
    </li>
    <li>
      <span>
        {$_('history.modals.details.method')}
      </span>
      <span>
        {tx.func || $_(`confirm.params.types.${tx.type}`)}
      </span>
    </li>
    <li>
      <span>
        {$_('history.modals.details.hash')}
      </span>
      <Tooltip
        tip={tip}
        bottom
      >
        <span
          class="pointer"
          on:mouseup={() => hanldeOnCopy(hash)}
        >
          {trim(hash)}
        </span>
      </Tooltip>
    </li>
    <li>
      <span>
        {$_('history.modals.details.expiry')}
      </span>
      <span>
        {tx.expiryPeriod}
      </span>
    </li>
    <li>
      <span>
        {$_('history.modals.details.time')}
      </span>
      <span>
        {new Date(tx.timestamp).toLocaleString()}
      </span>
    </li>
    {#if tx.error}
      <li class="error">
        <span>
          {$_('history.modals.details.error')}
        </span>
        <span>
          {tx.error}
        </span>
      </li>
    {/if}
  </ul>
  <div>
    {#if tx.confirmed}
      <!-- TODO: here wil be buttons -->
    {/if}
  </div>
</div>

<style lang="scss">
	@import "../styles/mixins";
  div.tx {
    height: 600px;
    @include flex-center-top-column;
  }
  h1 {
    line-height: 0;
    margin: 5px;
    font-size: 18pt;
    font-weight: bold;

    & > span {
      font-weight: 300;
      font-size: 10pt;
      color: var(--muted-color);
    }
  }
  span.pointer {
    cursor: pointer;
  }
  img {
    margin: 10px;
  }
  ul {
    min-width: 300px;
    max-width: 490px;
    width: calc(100vw - 20px);

    padding: 10px;
    background-color: var(--card-color);
    box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;

    @include border-radius(16px);

    &.loading {
      @include loading-gradient(var(--loading-color), var(--card-color));
    }
    & > li {
      padding: 5px;
      border-bottom: solid 1px var(--hover-color);
      color: var(--text-color);
      font-size: 12pt;
      font-weight: 500;

      @include flex-between-row;

      &.error {
        color: var(--danger-color);
      }
      &:first-child {
        margin: 5px;
        font-size: 16pt;
        font-weight: bold;

        & > span {
          text-align: center;
          width: 100%;
        }
      }
      &:last-child {
				border-bottom: solid 1px transparent;
			}
      & > span {
        @include text-shorten;
      }
    }
  }
</style>
