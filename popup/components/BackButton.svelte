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
  <path
    d="M19.6368 25.0682C20.0284 25.4576 20.6616 25.4557 21.051 25.0641C21.4403 24.6724 21.4385 24.0392 21.0468 23.6499L19.6368 25.0682ZM20.6524 12.2579C21.0429 11.8674 21.0429 11.2342 20.6524 10.8437C20.2619 10.4532 19.6287 10.4532 19.2382 10.8437L20.6524 12.2579ZM13.72 17.7761L13.0129 17.069C12.825 17.2569 12.7196 17.5118 12.72 17.7776C12.7204 18.0433 12.8265 18.2979 13.015 18.4853L13.72 17.7761ZM19.2382 10.8437L13.0129 17.069L14.4271 18.4832L20.6524 12.2579L19.2382 10.8437ZM13.015 18.4853L19.6368 25.0682L21.0468 23.6499L14.425 17.0669L13.015 18.4853Z"
  />
</svg>

<style lang="scss">
  svg {
    cursor: pointer;

    rect {
      fill: var(--secondary-color);
      transition: fill 200ms linear;
    }
    path {
      fill: var(--primary-color);
    }

    &:hover {
      rect {
        fill: var(--card-color);
      }
      path {
        fill: var(--text-color);
      }
    }
  }
</style>
