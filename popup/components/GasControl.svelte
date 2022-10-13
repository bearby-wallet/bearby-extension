<script lang="ts">
  import { GAS_LIMIT, MULTIPLIER, GAS_PRICE } from 'config/gas';
  import { createEventDispatcher } from 'svelte';

  import Speed from './icons/Speed.svelte';

  const dispatch = createEventDispatcher();

  export let multiplier = MULTIPLIER;
  export let gasPrice = GAS_PRICE;
  export let gasLimit = GAS_LIMIT;

  $: amount = gasPrice * gasLimit;
  $: list = Array(3);

  const handleOnSelect = (index: number) => {
    dispatch('select', index + 1);
  };
</script>

<ul>
  {#each list as item, index}
    <li
      class:selected={(index + 1) === multiplier}
      on:mousedown={() => handleOnSelect(index)}
    >
      <Speed length={index + 1}/>
      <h3>
        {(amount * (index + 1))}
      </h3>
    </li>
  {/each}
</ul>

<style lang="scss">
	@import "../styles/mixins";
  ul {
		padding: 0px;
    margin: 0;
    background-color: var(--card-color);

    @include flex-between-row;
    @include border-radius(16px);

    & > li {
      cursor: pointer;

      margin: 5px;
      padding: 8px;
      min-width: 90px;
      min-height: 40px;
      text-align: center;

      @include border-radius(16px);
      @include flex-center-column;

      &.selected {
        background-color: var(--background-color);
      }
      & > h3 {
        @include fluid-font(320px, 1024px, 13px, 15px);
        margin: 0;
      }
    }
  }
</style>
