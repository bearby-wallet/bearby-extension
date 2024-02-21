<script lang="ts">
  export let width = '25';
  export let height = '25';
  export let className = '';
</script>

<svg
  width={width}
  height={height}
  viewBox="0 0 24 24"
  fill="none"
  class={className}
>
  <circle cx="12" cy="12" r="7" stroke="var(--muted-color)" stroke-width="2"/>
  <path d="M8.66987 10.0774L12 8.1547L15.3301 10.0774V13.9226L12 15.8453L8.66987 13.9226V10.0774Z" stroke="var(--muted-color)" stroke-width="2"/>
  <line x1="12" y1="5" x2="12" y2="3" stroke="var(--muted-color)" stroke-width="2"/>
  <line x1="12" y1="21" x2="12" y2="19" stroke="var(--muted-color)" stroke-width="2"/>
  <line x1="4" y1="13" x2="4" y2="11" stroke="var(--muted-color)" stroke-width="2"/>
  <line x1="20" y1="13" x2="20" y2="11" stroke="var(--muted-color)" stroke-width="2"/>
</svg>
