<script lang="ts">
	import { _ } from 'popup/i18n';

  import { trim } from 'popup/filters/trim';
  import { viewIcon } from "app/utils/icon-view";
  import { formatNumber } from 'popup/filters/numbers';

  import netStore from 'popup/store/netwrok';
	import tokensStore from 'popup/store/tokens';


	export let tx = {
    amount: 0,
    fee: 0,
    recipient: "",
    token: $tokensStore[0],
    tokenAmount: "0",
    type: 0
  };

	$: amount = tx.tokenAmount / 10**tx.token.decimals;
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
        width="15"
        alt="app"
      />
      {formatNumber(amount)} {tx.token.symbol} <span>
        + {tx.fee} {$tokensStore[0].symbol}
      </span>
    </span>
  </li>
  <li>
    <span>
      {$_('confirm.params.teg')}
    </span>
    <span>
      {tx.teg || $_(`confirm.params.types.${tx.type}`)}
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

    width: 300px;

		& > li {
			line-height: 20px;
			padding: 5px;
			font-family: Regular;
			border-bottom: solid 1px var(--hover-color);
			color: var(--text-color);

			@include fluid-font(320px, 720px, 16px, 20px);
			@include flex-between-row;

			&:last-child {
				border-bottom: solid 1px transparent;
			}
			& > span:last-child {
				font-weight: 600;

        & > span {
          color: var(--muted-color);
        }
        & > a {
          color: inherit;
        }
			}
		}
	}
</style>
