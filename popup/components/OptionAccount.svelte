<script lang="ts">
  import type { Account } from 'types';

	import { onMount, createEventDispatcher } from 'svelte';

  import { trim } from 'popup/filters/trim';

	import { generateBlockies } from 'popup/mixins/blockies';
	import { uuidv4 } from 'lib/crypto/uuid';

  const uid = uuidv4();
	const dispatch = createEventDispatcher();

  export let selected: boolean;
  export let account: Account;

  const handleInputCheckBox = (_: Event) => {
    selected = !selected;

    dispatch('changed', selected);
  }

  onMount(async() => {
		const ctx = document.getElementById(uid);

    if (ctx) {
      generateBlockies(account.pubKey, ctx);
    }
	});
</script>

<label class="wrapper">
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
      <input
        type="checkbox"
        checked={selected}
        on:change={handleInputCheckBox}
      />
    </div>
  </div>
</label>

<style lang="scss">
	@use '../styles/mixins' as mix;

  h3 {
    margin-block-end: 0;
  }
  p {
    font-size: 8pt;
    margin-block-start: 0;
  }
  label.wrapper {
    width: 100%;
    @include mix.flex-between-row;

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

      @include mix.flex-between-row;
    }
    & > div > div:nth-of-type(2) {
      text-align: right;
    }
  }
</style>
