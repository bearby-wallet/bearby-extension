<script lang="ts">
  export let width = '36px';
  export let height = '36px';
</script>

<svg
  width={width}
  height={height}
  viewBox="0 0 36 36"
  fill="none"
>
  <rect
    width={width}
    height={height}
    rx="8"
  />
  <line
    x1="11.8195"
    y1="11.6689"
    x2="24.5096"
    y2="24.3591"
    stroke-width="2"
    stroke-linecap="round"
  />
  <line
    x1="1"
    y1="-1"
    x2="18.9466"
    y2="-1"
    transform="matrix(-0.707107 0.707107 0.707107 0.707107 25.5274 11.5508)"
    stroke-width="2"
    stroke-linecap="round"
  />
</svg>

<style lang="scss">
  svg {
    cursor: pointer;
    rect {
      fill: var(--card-color);
      transition: fill 200ms linear;
    }
    line {
      stroke: var(--primary-color);
    }

    &:hover {
      rect {
        fill: var(--primary-color);
      }
      line {
        stroke: var(--card-color);
      }
    }
  }
</style>
