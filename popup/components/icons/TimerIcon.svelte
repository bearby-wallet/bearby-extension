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
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M18.25 31.9841C25.4297 31.9841 31.25 26.1638 31.25 18.9841C31.25 11.8044 25.4297 5.98413 18.25 5.98413C11.0703 5.98413 5.25 11.8044 5.25 18.9841C5.25 26.1638 11.0703 31.9841 18.25 31.9841ZM16.5 19.6055V9.98413H19.5V18.3628L25.0607 23.9235L22.9393 26.0448L16.5 19.6055Z"
  />
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
