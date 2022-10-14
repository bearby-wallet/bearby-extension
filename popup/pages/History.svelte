<script lang="ts">
  import type { HistoryTransaction } from 'types';

	import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';

  import { getTransactionHistory, clearAllTransactions } from 'popup/backend/transactions';
  import historyStore from "app/store/history";

	import BottomTabs from '../components/BottomTabs.svelte';
	import TopBar from '../components/TopBar.svelte';
	import Transaction from '../components/Transaction.svelte';
  import Modal from '../components/Modal.svelte';
  import TransactionModal from '../modals/Transaction.svelte';


  let showTx: HistoryTransaction | null = null;

  $: history = $historyStore.filter((t) => t.confirmed);
  $: queue = $historyStore.filter((t) => !t.confirmed);

  const hanldeOnUpdate = async () => {
    try {
      await getTransactionHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const hanldeOnClear = async () => {
    await clearAllTransactions();
  };

  onMount(async() => {
    await hanldeOnUpdate();
  });
</script>


<Modal
  show={Boolean(showTx)}
  title={$_('history.modals.details.title')}
  on:close={() => showTx = null}
>
  <div class="m-warp">
    {#if showTx}
      <TransactionModal tx={showTx}/>
    {/if}
  </div>
</Modal>
<section>
	<TopBar
    on:refresh={hanldeOnUpdate}
  />
	<main>
    <div class="header">
      <h2>
        {$_('history.title')}
      </h2>
      <h3 on:mouseup={hanldeOnClear}>
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
          {#each queue as tx}
            <li on:mouseup={() => showTx = tx}>
              <Transaction
                tx={tx}
                loading
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
          {#each history as tx}
            <li on:mouseup={() => showTx = tx}>
              <Transaction tx={tx} />
            </li>
          {/each}
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
		overflow: hidden;
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
  b {
    font-size: 9pt;
  }
</style>
