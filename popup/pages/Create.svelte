<script lang="ts">
	import { onMount } from 'svelte';
	import { push } from 'svelte-spa-router';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';
	import { getRandomSeed } from "popup/backend/phrase";
  import { printMnemonic } from 'lib/utils/printer';
  import wordsStore from 'popup/store/words';

  import SwitchButton from '../components/SwitchButton.svelte';
  import BackBar from '../components/BackBar.svelte';
  import PickButton from '../components/PickButton.svelte';

  let length = 128;
  let words = [];

	$: disabled = words.length < 12;

  const hanldeRandomWords = async() => {
    const seed = await getRandomSeed(length);
    words = seed.split(' ');
  };
  const hanldeSelectNumber = (e) => {
    const value = e.detail;

    length = value ? 256 : 128;

    hanldeRandomWords();
  };
  const hanldeOnContinue = () => {
    wordsStore.set(words);
    push('/verify');
  };
  const handleOnPrint = () => {
    const phrase = words.join(' ');
    const html = printMnemonic(phrase, $_('create.print'));
    const win = window.open('', 'win');
    win.document.write(html);

    setTimeout(() => {
      win.print();
    }, 500);
  };

  onMount(() => {
    hanldeRandomWords();
  });
</script>

<main in:fly={flyTransition.in}>
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
  <div>
    <SwitchButton
      items={['12', '24']}
      on:select={hanldeSelectNumber}
    />
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
      class="secondary"
      on:click={hanldeRandomWords}
    >
      {$_('create.btns.refresh')}
    </button>
    <button
      class="secondary"
      on:click={handleOnPrint}
    >
      {$_('create.btns.print')}
    </button>
    <button
      class="primary"
      disabled={disabled}
      on:click={hanldeOnContinue}
    >
      {$_('create.btns.continue')}
    </button>
  </div>
</main>

<style lang="scss">
	@import "../styles/mixins";
  h1, h3 {
    margin-block-start: 0;
    margin-block-end: 0.2em;
  }
  h1 {
    font-size: 29pt;
  }
  h3 {
    font-size: 16pt;
  }
  main {
		background-color: var(--background-color);
		height: 100vh;

    @include flex-center-top-column;
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
