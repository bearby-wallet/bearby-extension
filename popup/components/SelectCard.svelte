<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Arrow from './icons/Arrow.svelte';

  const dispatch = createEventDispatcher();

  export let title = '';
  export let header = '';
  export let text = '';
  export let rightHeader = '';
  export let rightText = '';
  export let disabled = false;

  const onClick = () => {
    if (!disabled) {
      dispatch('click');
    }
  };
</script>

<div
  class="card"
  class:disabled
  on:click={onClick}
>
  {#if title}
    <p>
      {title}
    </p>
  {/if}
  <div>
    <span>
      <slot />
    </span>
    <div class="header">
      <h3>
        {header}
      </h3>
      <p>
        {text}
      </p>
    </div>
    {#if rightHeader && rightText}
      <div class="right">
        <h3>
          {rightHeader}
        </h3>
        <p>
          {rightText}
        </p>
      </div>
    {/if}
    <b>
      <Arrow />
    </b>
  </div>
</div>

<style lang="scss">
  @use '../styles/mixins' as mix;

  div.header {
    width: 90%;
    & > p {
      @include mix.text-shorten;
    }
  }
  div.card {
    & > p {
      margin: 0;
    }
    & > div {
      cursor: pointer;
      padding-left: 15px;
      padding-right: 15px;
      min-width: 290px;
      @include mix.flex-between-row;

      & > span {
        margin-right: 10px;
      }
      & > div {
        &.right {
          text-align: right;
        }

        & > h3 {
          margin-block-end: 0;
        }
        & > p {
          font-size: 12px;
          margin-block-start: 0;
        }
      }
    }

    &.disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }
</style>
