<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { scale, fade } from 'svelte/transition';

  import Close from './icons/Close.svelte';

  const dispatch = createEventDispatcher();

  export let title = '';
  export let show: boolean;

  let node: HTMLElement | null = null;

  const onClose = () => dispatch('close');
  const onToggle = (e: Event) => {
    if (e.target === node) {
      onClose();
    }
  };
</script>


{#if show}
  <aside
    bind:this={node}
    transition:fade={{ delay: 0, duration: 250 }}
    on:keyup={onToggle}
  >
    <div
      class="modal"
      transition:scale={{ delay: 0, duration: 250 }}
    >
      <div class="title">
        <h1>
          {title}
        </h1>
        <span on:keyup={onClose}>
          <Close />
        </span>
      </div>
      <div>
        <slot />
      </div>
    </div>
  </aside>
{/if}


<style lang="scss">
  @import "../styles/mixins";
  aside {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 50;

    display: block;
    background: rgba(0, 0, 0, 0.3);

    & > div.modal {
      right: 0;
      left: 0;
      max-width: 500px;
      width: 100%;
      background: var(--modal-color);
      padding: 0;
      z-index: 100;

      & > div.title {
        padding-block-start: 0.4em;
        padding-left: 15px;
        padding-right: 15px;
        font-size: 26px;

        @include fluid-font(320px, 720px, 16px, 22px);
        @include flex-between-row;
      }

      @media screen and (min-width: 899px) {
        margin: 10% auto 50px;
        @include border-radius(16px);
      }
    }
  }
</style>
