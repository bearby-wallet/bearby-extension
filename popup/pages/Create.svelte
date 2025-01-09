<script lang="ts">
	import { onMount } from 'svelte';
	import { push } from 'popup/routers/navigation';
	import { _ } from 'popup/i18n';
	
  import { getRandomWords } from "popup/backend/wallet";
  import { printMnemonic } from "popup/utils/printer";

  import wordsStore from "popup/store/words";

  import BackBar from '../components/BackBar.svelte';
  import PickButton from '../components/PickButton.svelte';


  let length = 12;
  let words: string[] = [];

	$: disabled = words.length < 12;

  const hanldeRandomWords = async() => {
    words = await getRandomWords(length);
  };
  const hanldeOnContinue = () => {
    wordsStore.set(words);
    push('/verify');
  };
  const handleOnPrint = () => {
    const phrase = words.join(' ');
    const html = printMnemonic(phrase, $_('create.print'));
    const win = window.open('', 'win');

    if (win) {
      win.document.write(html);

      setTimeout(() => {
        win.print();
      }, 500);
    }
  };

  const handleOnChangeLen = (event: Event) => {
    length = Number((event.target as HTMLInputElement).value);
    hanldeRandomWords();
  };

  onMount(() => {
    hanldeRandomWords();
  });
</script>

<main>
  <BackBar
    length={3}
    selected={0}
  />
  <h1>
    {$_('create.title')}
  </h1>
  <h3>
    {$_('create.sub_title')}
  </h3>
  <div class="sw">
    <select oninput={handleOnChangeLen}>
      {#each [12, 15, 18, 21, 24] as v}
        <option
          value={v}
          selected={length === v}
        >
          {v}
        </option>
      {/each}
    </select>
  </div>
  <div class="wrapper">
    {#each words as w, i}
      <PickButton
        text={w}
        index={i + 1}
      />
    {/each}
  </div>
  <div class="btns">
    <button
      class="primary"
      onmouseup={hanldeRandomWords}
    >
      {$_('create.btns.refresh')}
    </button>
    <button
      class="primary"
      onmouseup={handleOnPrint}
    >
      {$_('create.btns.print')}
    </button>
    <button
      class="outline"
      disabled={disabled}
      onmouseup={hanldeOnContinue}
    >
      {$_('create.btns.continue')}
    </button>
  </div>
</main>

<style lang="scss">
	@import "../styles/mixins";
  h1, h3 {
    text-align: center;
    margin-block-start: 0;
    margin-block-end: 0.2em;
  }
  h1 {
		@include fluid-text(600px, 32px, 55px);
  }
  h3 {
    @include fluid-text(600px, 14pt, 20pt);
  }
  main {
    background: inherit;
		height: 100vh;

    @include flex-center-top-column;
	}
  div.sw {
    max-height: calc(100vh - 30px);
    width: 100%;
    max-width: 450px;

    padding: 5px;

    display: flex;
    justify-content: flex-end;
  }
  div.btns {
    width: 290px;
    @include flex-center-column;

    button {
      margin: 5px;
    }
  }
  div.wrapper {
    margin: 16px;
    overflow-y: scroll;

    height: fit-content;
    max-height: calc(100vh - 30px);
    width: 100%;
    max-width: 450px;

    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
  }
</style>
