<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';
	import { push } from 'popup/routers/navigation';
  import { shuffle } from 'popup/utils/shuffle';
  import wordsStore from 'popup/store/words';

  import BackBar from '../components/BackBar.svelte';
  import PickButton from '../components/PickButton.svelte';


  let words: string[] = [];
  let shuffled: string[] = [];
  let disabled = true;

  onMount(() => {
    const list = JSON.stringify($wordsStore);
    shuffled = shuffle<string>(JSON.parse(list));

    if ($wordsStore.length < 12) {
      return push('/create');
    }
  });

  const hanldeOnAdd = (w: string, index: number) => {
    words = [...words, w];
    shuffled = shuffled.filter((_, i) => i !== index);
    disabled = words.join(' ') !== $wordsStore.join(' ');
  };
  const hanldeOnRemove = (word: string) => {
    words = words.filter((el) => el !== word);
    shuffled = [word, ...shuffled];
    disabled = words.join(' ') !== $wordsStore.join(' ');
  };
</script>


<main>
  <BackBar
    length={3}
    selected={1}
  />
  <h1>
    {$_('verify.title')}
  </h1>
  <div class="picker">
    {#if words.length === 0}
      <p>
        {$_('verify.placeholder')}
      </p>
    {/if}
    {#each words as word, i}
      <PickButton
        index={i + 1}
        text={word}
        closer
        on:close={() => hanldeOnRemove(word)}
      />
    {/each}
  </div>
  <div class="wrapper">
    {#each shuffled as word, index}
      <div 
        on:mouseup={() => hanldeOnAdd(word, index)}
        role="button"
        aria-label="Select word {word}"
        tabindex="0"
      >
        <PickButton text={word} />
      </div>
    {/each}
  </div>
  <button
    class="outline"
    disabled={disabled}
    on:mouseup={() => push('/setup-account')}
  >
    {$_('verify.btn')}
  </button>
</main>


<style lang="scss">
	@import "../styles/mixins";
  h1 {
    text-align: center;
    margin-block-start: 0;
		@include fluid-text(600px, 32px, 55px);
  }
  main {
    background: inherit;
		height: 100vh;

    @include flex-center-top-column;
	}
  div.wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    overflow-y: scroll;

    height: fit-content;
    width: calc(100vw - 10px);

    max-width: 500px;
  }
  div.picker {
    overflow-y: scroll;
    border-radius: 6px;
    border: 1px dashed var(--text-color);

    height: fit-content;
    width: calc(100vw - 10px);
    min-height: 100px;
    max-width: 550px;

    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;

    & > p {
      font-size: 16px;
      text-align: center;
      width: 100%;
    }
  }
  button {
    margin: 16px;
    min-width: 290px;
  }
</style>
