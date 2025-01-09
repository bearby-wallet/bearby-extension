<script lang="ts">
  import { createEventDispatcher } from 'svelte';

	import Arrow from './icons/Arrow.svelte';

  const dispatch = createEventDispatcher();

  let show = false;

  export let list: string[] = [];

  const hanldeOnSelect = (index: number) => {
    show = false;
    dispatch('select', index);
  };
</script>

<div>
  <div
    class="arrow"
    onmouseup={() => show = !show}
  >
    <Arrow className="arrow-icon"/>
  </div>
  {#if show}
    <div
      class="close"
      onmouseup={() => show = false}
    />
    <div class="menu">
      <span
        class="close-arrow-icon"
        onmouseup={() => show = false}
      >
        <Arrow/>
      </span>
      {#each list as item, i}
        <div
          class="item"
          onmouseup={() => hanldeOnSelect(i)}
        >
          {item}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  @use '../styles/mixins' as mix;

  div.arrow {
    cursor: pointer;
    margin: 10px;
    transform: rotate(90deg);

    & :global(svg.arrow-icon > path) {
      fill: var(--text-color);
    }

    &:hover {
      & :global(svg.arrow-icon > path) {
        fill: var(--primary-color);
      }
    }
  }

  div.item {
    & {
      color: var(--text-color);
      margin-block-end: 10px;
      font-size: 13px;
      cursor: pointer;
    }
  
    &:hover {
      color: var(--primary-color);
    }
  }

  div.close {
    & {
      cursor: pointer;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      backdrop-filter: blur(3px);
      background-color: #0000008f;
    }
  }

  span.close-arrow-icon {
    & {
      cursor: pointer;
      transform: rotate(-90deg);
    }
  }

  div.menu {
    & {
      position: absolute;
      background-color: var(--card-color);
      transform: translate(-35%, -56%);
      padding: 5px;
      z-index: 20;
      width: fit-content;
      min-width: 100px;
      align-items: flex-end;
    }
  
    @include mix.flex-column;
    @include mix.border-radius(16px);
  }
</style>
