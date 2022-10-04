<script lang="ts">
  export let width = '25';
  export let height = '13';
  export let className = '';
  export let length = 1;
</script>

<svg
  width={width}
  height={height}
  viewBox="0 0 25 13"
  fill="none"
  class={className}
  >
  <path
    d="M0.333252 0.5H5.98031L8.80384 6.5L5.98031 12.5H0.333252L3.15678 6.5L0.333252 0.5Z"
    fill="var(--primary-color)"
  />
  <path
    d="M8.0979 0.5H13.745L16.5685 6.5L13.745 12.5H8.0979L10.9214 6.5L8.0979 0.5Z"
    fill={length >= 2 ? 'var(--primary-color)' : 'var(--muted-color)'}
    fill-opacity={length >= 2 ? 1 : 0.4}
  />
  <path
    d="M15.8625 0.5H21.5096L24.3331 6.5L21.5096 12.5H15.8625L18.6861 6.5L15.8625 0.5Z"
    fill={length >= 3 ? 'var(--primary-color)' : 'var(--muted-color)'}
    fill-opacity={length >= 3 ? 1 : 0.4}
  />
</svg>

<style lang="scss">
  @import "../../styles/mixins";
</style>
