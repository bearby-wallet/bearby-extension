<script lang="ts">
  export let width = "36";
  export let height = "36";
  export let className = "";
</script>

<svg {width} {height} viewBox="0 0 36 36" fill="none" class={className}>
  <rect {width} {height} rx="14" fill="var(--primary-light-color)" />
  <line
    x1="17.75"
    y1="11.75"
    x2="17.75"
    y2="24.25"
    stroke="var(--primary-color)"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="24.25"
    y1="17.75"
    x2="11.75"
    y2="17.75"
    stroke="var(--primary-color)"
    stroke-width="1.5"
    stroke-linecap="round"
  />
</svg>
