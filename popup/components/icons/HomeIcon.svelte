<script lang="ts">
  export let width = '36';
  export let height = '36';
  export let selected = false;
</script>

<svg
  width={width}
  height={height}
  class:selected={selected}
  viewBox="0 0 36 37"
  fill="none"
>
  <path d="M7.63456 17.009L16.8221 8.34646C17.3346 7.86336 18.1654 7.86336 18.6779 8.34646L27.8654 17.009C28.1116 17.241 28.25 17.5557 28.25 17.8839V29.7466C28.25 30.4301 27.6624 30.9841 26.9375 30.9841H20.375V22.3216H15.125V30.9841H8.5625C7.83763 30.9841 7.25 30.4301 7.25 29.7466V17.8839C7.25 17.5557 7.3884 17.241 7.63456 17.009Z"/>
</svg>

<style lang="scss">
  svg {
    cursor: pointer;

    & > path {
      fill: var(--muted-color);
    }
  }
  svg.selected {
    cursor: auto;

    & > path {
      fill: var(--primary-color);
    }
  }
</style>
