<script lang="ts">
  import { trim } from 'popup/filters/trim';
  import { clipboardCopy } from 'popup/mixins/clipboard';
	import { _ } from 'popup/i18n';

	import walletStore from 'popup/store/wallet';

  import Tooltip from './Tooltip.svelte';

  let tip = $_('home.clipboard.copy');

  $: account = $walletStore.identities[$walletStore.selectedAddress];

  const handleOnCopy = () => {
    clipboardCopy(account.base58);
    tip = $_('home.clipboard.copied');
    setTimeout(() => {
      tip = $_('home.clipboard.copy');
    }, 500);
  };
</script>

<Tooltip
  tip={tip}
  bottom
>
  <div on:click={handleOnCopy}>
    <h1>
      {account.name}
    </h1>
    <p>
      {trim(account.base58)}
    </p>
  </div>
</Tooltip>

<style lang="scss">
  @import "../styles/mixins";
  div {
    text-align: center;
    cursor: pointer;

    padding: 8px;
    margin: 5px;

    @include border-radius(16px);

    & > h1 {
      margin: 0;
      font-size: 14px;
    }
    & > p {
      font-size: 11px;
      color: var(--text-color);
      margin: 0;
    }
    &:hover {
      background-color: var(--card-color);
    }
  }
</style>
