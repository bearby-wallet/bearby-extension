<script lang="ts">
	import CloseIcon from './icons/Close.svelte';

  export let title: string;

  function pop() {
    window.history.back();
  }
</script>

<nav>
  <h1>
    {title}
  </h1>
  <div on:mouseup={pop} role="button" tabindex="0">
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
