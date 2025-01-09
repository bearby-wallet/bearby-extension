<script lang="ts">
  export let tip = '';
  export let top = false;
  export let right = false;
  export let bottom = false;
  export let left = false;
  export let active = false;
</script>

<div class="tooltip-wrapper">
  <span class="tooltip-slot">
    <slot />
  </span>
  <div
    class="tooltip"
    class:active
    class:left
    class:right
    class:bottom
    class:top
  >
    <div class="default-tip">
      {tip}
    </div>
  </div>
</div>

<style lang="scss">
  @use "../styles/mixins";

  .tooltip-wrapper {
    position: relative;
    display: inline-block;
  }

  .tooltip {
    z-index: 99;
    position: absolute;
    display: inline-block;
    white-space: nowrap;
    color: inherit;
    opacity: 0;
    visibility: hidden;
    transition: opacity 150ms, visibility 150ms;
    box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;
  }

  .default-tip {
    display: inline-block;
    padding: 8px 16px;
    background-color: var(--card-color);
    color: var(--text-color);
    text-align: center;

    @include border-radius(16px);

    &:before {
      content: '';
      border-style: solid;
      position: absolute;

      border-width: 0 5px 5px 5px;
      border-bottom-color: var(--card-color);
      border-left-color: transparent;
      border-right-color: transparent;
      top: -5px;
      transform: translate(100%, 10%);
    }
  }

  .tooltip.top {
    left: 50%;
    transform: translate(-50%, -100%);
    margin-top: -8px;
  }

  .tooltip.bottom {
    left: 50%;
    bottom: 0;
    transform: translate(-50%, 100%);
  }

  .tooltip.left {
    left: 0;
    transform: translateX(-100%);
    margin-left: -8px;
  }

  .tooltip.right {
    right: 0;
    transform: translateX(100%);
    margin-right: -8px;
  }

  .tooltip.active {
    opacity: 1;
    visibility: initial;
  }

  .tooltip-slot:hover + .tooltip {
    opacity: 1;
    visibility: initial;
  }
</style>
