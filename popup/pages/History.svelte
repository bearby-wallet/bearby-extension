<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';

	import BottomTabs from '../components/BottomTabs.svelte';
	import TopBar from '../components/TopBar.svelte';

  let loading = false;
  let showTx = null;

  $: history = [];
  $: queue = [];

  const hanldeOnUpdate = async () => {
    loading = true;
    try {
      // await getLatestBlockNumber();
    } catch {
      ////
    }
    loading = false;
  };

  const hanldeOnClear = async () => {
    // await clearAllTxns();
  };
</script>


<section>
	<TopBar
    refresh
    lock
    on:refresh={hanldeOnUpdate}
  />
	<main>
    <div class="header">
      <h2>
        {$_('history.title')}
      </h2>
      <h3 on:click={hanldeOnClear}>
        {$_('history.clear')}
      </h3>
    </div>
    {#if history.length === 0 && queue.length === 0}
      <p>
        {$_('history.no_txns')}
      </p>
    {/if}
    <div class="list">
      {#if queue.length > 0}
        <b>
          {$_('history.queue')} ({queue.length})
        </b>
        <ul>
          {#each queue as tx, index}
            <li on:click={() => showTx = tx}>
              <Transaction
                tx={tx}
                loading={loading}
              />
            </li>
          {/each}
        </ul>
      {/if}
      {#if history.length > 0}
        <b>
          {$_('history.history')} ({history.length})
        </b>
        <ul>
          <!-- {#each history as tx, index}
            <li
              in:fly={{
                delay: 100 * index,
                duration: 400,
                y: -20
              }}
              on:click={() => showTx = tx}
            >
              <Transaction tx={tx}/>
            </li>
          {/each} -->
        </ul>
      {/if}
    </div>
	</main>
	<BottomTabs />
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
		height: calc(100vh - 86px);
    max-width: 500px;
    width: calc(100vw - 15px);
		@include flex-center-top-column;
	}
  div.header {
    width: 100%;
    @include flex-between-row;

    & > h3 {
      cursor: pointer;

      &:hover {
        color: var(--primary-color);
      }
    }
  }
  div.list {
    overflow-y: scroll;
  }
  ul {
    margin: 0;
    padding: 0;

    & > li {
      margin: 10px;
    }
  }
  section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
  h2,
  h3 {
    margin-block-end: 0;
  }
  h3 {
    font-size: 12pt;
  }
  h2 {
    text-align: left;
    font-size: 20pt;
  }
  p {
    text-indent: 15px;
    font-size: 11pt;
  }
</style>
