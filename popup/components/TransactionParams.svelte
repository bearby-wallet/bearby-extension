<script lang="ts">
  import type { ConfirmParams } from 'types';

	import { _ } from 'popup/i18n';

  import { trim } from 'popup/filters/trim';
  import { viewIcon } from "app/utils/icon-view";
  import { formatNumber } from 'popup/filters/numbers';

	import tokensStore from 'popup/store/tokens';


	export let tx: ConfirmParams;

	$: amount = Number(tx.tokenAmount) / 10**tx.token.decimals;
  $: img = viewIcon(tx.token.base58);
</script>

<ul>
  <li>
    <span>
      {$_('confirm.params.amount')}
    </span>
    <span>
      <img
        src={img}
        width="20"
        height="20"
        alt="app"
      />
      {formatNumber(amount)} {tx.token.symbol} <span>
        +{tx.fee} {$tokensStore[0].symbol}
      </span>
    </span>
  </li>
  <li>
    <span>
      {$_('confirm.params.teg')}
    </span>
    <span>
      {tx.func || $_(`confirm.params.types.${tx.type}`)}
    </span>
  </li>
  <li>
    <span>
      {$_('confirm.params.fee')}
    </span>
    <span>
      {tx.fee} {$tokensStore[0].symbol}
    </span>
  </li>
  <li>
    <span>
      {$_('confirm.params.to')}
    </span>
    <span>
      <a
        href={tx.recipient}
        target="_blank"
      >
        {trim(tx.recipient)}
      </a>
    </span>
  </li>
</ul>

<style lang="scss">
	@import "../styles/mixins";
	ul {
		margin: 0;
    padding: 5px;

    width: calc(100vw - 16px);
    max-width: 500px;

		& > li {
			line-height: 20px;
			padding: 5px;
			font-family: Regular;
			border-bottom: solid 1px var(--hover-color);
			color: var(--text-color);

			@include fluid-text(720px, 12pt, 16pt);
			@include flex-between-row;

			&:last-child {
				border-bottom: solid 1px transparent;
			}
      & > span {
        align-items: center;
        @include flex-center-horiz;
      }
			& > span:last-child {
				font-weight: 600;

        & > span {
          font-size: 8pt;
          color: var(--muted-color);
        }
        & > img {
          margin: 5px;
        }
        & > a {
          color: inherit;
        }
			}
		}
	}
</style>
