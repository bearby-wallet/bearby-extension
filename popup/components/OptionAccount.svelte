<script lang="ts">
  import type { Account } from 'types';

	import { onMount } from 'svelte';

  import { trim } from 'popup/filters/trim';

	import { generateBlockies } from 'popup/mixins/blockies';
	import { uuidv4 } from 'lib/crypto/uuid';

  const uid = uuidv4();

  export let account: Account;
  export let selected = false;

  onMount(async() => {
		const ctx = document.getElementById(uid);

    if (ctx) {
      generateBlockies(account.pubKey, ctx);
    }
	});
</script>

<div class="wrapper">
  <span class:selected={selected}>
    <span id={uid}/>
  </span>
  <div>
    <div>
      <h3>
        {account.name}
      </h3>
      <p>
        {trim(account.base58)}
      </p>
    </div>
    <div>
      <input type="checkbox" checked={selected} />
    </div>
  </div>
</div>

<style lang="scss">
	@import "../styles/mixins";

  h3 {
    margin-block-end: 0;
  }
  p {
    font-size: 8pt;
    margin-block-start: 0;
  }
  div.wrapper {
    width: 100%;
    @include flex-between-row;

    & > span {
      margin-right: 10px;

      border: solid 2px transparent;
      border-radius: 100%;
      width: 43px;
      height: 43px;

      &.selected {
        border-color: var(--primary-color);
      }
    }
    & > div {
      width: 100%;

      @include flex-between-row;
    }
    & > div > div:nth-of-type(2) {
      text-align: right;
    }
  }
</style>
