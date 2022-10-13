<script lang="ts">
	import { pop } from 'svelte-spa-router';
	import CloseIcon from './icons/Close.svelte';

  export let title: string;
</script>

<nav>
  <h1>
    {title}
  </h1>
  <div on:mousedown={pop}>
    <CloseIcon />
  </div>
</nav>

<style lang="scss">
  @import "../styles/mixins";
  h1 {
    color: var(--text-color);
		margin-block-start: 0.4em;
		margin-block-end: 0.4em;
  }
  nav {
    @include flex-between-row;
    max-width: 900px;
    width: calc(100vw - 30px);
    align-items: center;
  }
</style>
