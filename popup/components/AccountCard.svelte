<script lang="ts">
  import type { Account } from 'types';

	import { onMount } from 'svelte';

  import { AccountTypes } from 'config/account-type';
  import { ZERO_ADDRESS } from 'config/common';

  import { trim } from 'popup/filters/trim';
  import { formatNumber } from 'popup/filters/numbers';

	import { generateBlockies } from 'popup/mixins/blockies';
	import { uuidv4 } from 'lib/crypto/uuid';

  import settingsStore from 'popup/store/settings';


  const uid = uuidv4();

  export let account: Account;

  $: balance = account.tokens && account.tokens[ZERO_ADDRESS] ?
    account.tokens[ZERO_ADDRESS].final : 0;


  onMount(async() => {
		const ctx = document.getElementById(uid);
		generateBlockies(account.pubKey, ctx);
	});
</script>

<div class="wrapper">
  <span id={uid}/>
  <div>
    <div>
      <h2>
        {account.name}
      </h2>
      <p>
        {trim(account.base58)}
      </p>
    </div>
    <div>
      <h2>
        {formatNumber(balance, $settingsStore.currency)}
      </h2>
      <p>
        0
      </p>
    </div>
  </div>
</div>

<style lang="scss">
	@import "../styles/mixins";

  h2, p {
    margin: 0;
  }
  div.wrapper {
    width: 100%;
    @include flex-between-row;

    & > div {
      margin: 10px;
      width: 100%;

      @include flex-between-row;
    }
  }
</style>
