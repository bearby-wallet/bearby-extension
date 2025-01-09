<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { blur } from 'svelte/transition';

  import SearchIcon from './icons/Search.svelte';

  const dispatch = createEventDispatcher();

	let inputEl: HTMLInputElement;

  export let focus = false;
  export let placeholder = '';

  onMount(() => {
    if (focus && inputEl && inputEl.focus) {
      inputEl.focus();
    }
  });

  const onInput = (e: Event) => {
    const { value } = e.target as HTMLInputElement;
    dispatch('input', value);
  };
</script>

<div class="search-box">
  <div>
    <SearchIcon />
  </div>
  <input
    bind:this={inputEl}
    placeholder={placeholder}
    type="search"
    oninput={onInput}
  >
  {#if $$slots.default}
    <slot />
	{/if}
</div>

<style lang="scss">
  @use '../styles/mixins' as mix;

  div.search-box {
    background: var(--card-color);
    border: solid 1px var(--card-color);

    width: 100%;
    max-width: 290px;

    @include mix.border-radius(16px);
    @include mix.flex-center-vert;

    & > input {
      margin: 0;
      padding: 0;
      padding-left: 0;
      border-color: var(--card-color);
    }
    & > div {
      margin: 10px;
    }
    &:focus-within {
      border: solid 1px var(--primary-color);
    }
  }
</style>
