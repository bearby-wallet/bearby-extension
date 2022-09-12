<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let index = -1;
  export let text: string;
  export let closer = false;

  const hanldeOnClose = () => {
    dispatch('close', index);
  };
</script>

<div class="picker">
  {#if index >= 0}
    <span class="index">
      {index}
    </span>
  {/if}
  <span class="text">
    {text}
  </span>
  {#if closer}
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      on:click={hanldeOnClose}
    >
      <line
        x1="4.37958"
        y1="4.2793"
        x2="12.8397"
        y2="12.7394"
        stroke-width="1.33333"
        stroke-linecap="round"
      />
      <line
        x1="0.666667"
        y1="-0.666667"
        x2="12.6311"
        y2="-0.666667"
        transform="matrix(-0.707107 0.707107 0.707107 0.707107 13.5183 4.2002)"
        stroke-width="1.33333"
        stroke-linecap="round"
      />
    </svg>
  {/if}
</div>

<style lang="scss">
  @import "../styles/mixins";

  div.picker {
    cursor: pointer;

    background-color: var(--card-color);
    border-radius: 6px;
    padding: 10px;
    margin: 5px;
    text-align: center;
    min-width: 140px;

    @include flex-between-row;

    & > span {
      font-size: 16px;
      line-height: 21px;
      margin-left: 5px;
      margin-right: 5px;
    }

    & > span.index {
      color: var(--muted-color);
    }
    & > span.text {
      color: var(--text-color);
    }

    & > svg {
      line {
        stroke: var(--notification-color);
      }
      &:hover {
        line {
          stroke: var(--primary-color);
        }
      }
    }
  }
</style>
