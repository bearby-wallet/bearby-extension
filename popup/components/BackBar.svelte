<script lang="ts">
  import BackButton from './BackButton.svelte';

  export let length = 0;
  export let selected = 0;

  $: list = new Array(length);

  function goBack() {
    window.history.back();
  }
</script>

<nav>
  <div onmouseup={goBack} aria-label="Go back" role="button" tabindex="0">
    <BackButton></BackButton>
  </div>
  <ul>
    {#each list as _, index}
      <li class:selected={index === selected}></li>
    {/each}
  </ul>
  <span class="empty"></span>
</nav>

<style lang="scss">
  @use '../styles/mixins' as mix;
  nav {
    margin-block-start: 1em;

    max-width: 900px;
    width: 100%;
    z-index: 2;
    padding-left: 10px;
    padding-right: 10px;

    @include mix.flex-between-row;
  }
  ul {
    margin: 0;
    display: flex;

    & > li {
      font-size: 30px;
      margin: 10px;
      color: var(--muted-color);

      &.selected {
        color: var(--primary-color);
      }
    }
  }
  span.empty {
    width: 36px;
    height: 36px;
  }
</style>
