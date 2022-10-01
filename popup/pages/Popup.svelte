<script lang="ts">
	import { _ } from 'popup/i18n';
  import { onMount } from 'svelte';
  import { push, pop } from 'svelte-spa-router';
	import { generateBlockies } from 'popup/mixins/blockies';

  import { trim } from 'popup/filters/trim';
  import { uuidv4 } from 'lib/crypto/uuid';
  import { closePopup } from 'popup/mixins/popup';
  import { rejectConfirmTransaction } from 'popup/backend/transactions';

	import walletStore from 'popup/store/wallet';
  import confirmStore from 'app/store/confirm';

  import SelectCard from '../components/SelectCard.svelte';
  import Modal from '../components/Modal.svelte';
  import AccountsModal from '../modals/Accounts.svelte';
  import TransactionParams from '../components/TransactionParams.svelte';


  let uuid = uuidv4();
  let txIndex = 0;
	let index = $walletStore.selectedAddress;
  let transaction = $confirmStore[txIndex];
  let accountsModal = false;
  let editModal = false;
  let loading = false;
  let err = '';

  $: account = $walletStore.identities[index];

  async function onSelectAccount({ detail }) {
		index = detail;
    accountsModal = !accountsModal;

    const ctx = document.getElementById(uuid);
    ctx.textContent = '';
		generateBlockies($walletStore.identities[index].pubKey, ctx);

    err = '';
	};

  async function onNextTx() {
		const isExtends = Boolean(transaction.uuid);

		if ($confirmStore.length === 0) {
			if (isExtends) {
				
				if (url.searchParams.has('type')) {
					return closePopup();
				}

				pop();
				
				return;
			}

			push('/history');
		}
	};

  function handleOnConfirm() {
    console.log('handleOnConfirm');
  }

  async function handleOnReject() {
    loading = true;
    try {
      await rejectConfirmTransaction(txIndex);
      await onNextTx();
    } catch (err) {
      console.error(err);
    }
    loading = false;
  }

	onMount(() => {
    const ctx = document.getElementById(uuid);
		generateBlockies(account.pubKey, ctx);
    console.log(transaction);
    
  });
</script>

<Modal
  show={accountsModal}
  title={$_('account.modal.title')}
  on:close={() => accountsModal = !accountsModal}
>
  <div class="m-warp">
    <AccountsModal
      list={$walletStore.identities}
      index={index}
      on:selected={onSelectAccount}
    />
  </div>
</Modal>
<section>
  <SelectCard
    header={account.name}
    text={trim(account.base58, 10)}
    on:click={() => accountsModal = !accountsModal}
  >
    <div id={uuid}/>
  </SelectCard>
  <div>
    <hr />
  </div>
  {#if transaction}
    <main>
      <div class="warp">
        <p class="error">
          {err}
        </p>
        <h2>
          {transaction.title || 'BearBy'}
        </h2>
        {#if transaction.icon}
          <img
            src={transaction.icon}
            height="40"
            alt="icon"
          />
        {/if}
      </div>
      <div
        class="params"
        class:loading={loading}
      >
        <h3 on:click={() => editModal = !editModal}>
          ({$_('confirm.btns.edit')})
        </h3>
        <TransactionParams tx={transaction}/>
      </div>
      <div class="btns">
        <button
          class="primary"
          on:click={handleOnReject}
        >
          {$_('confirm.btns.reject')}
        </button>
        <button
          class="outline"
          class:loading={loading}
          disabled={loading}
          on:click={handleOnConfirm}
        >
          {$_('confirm.btns.confirm')}
        </button>
      </div>
    </main>
  {/if}
</section>

<style lang="scss">
	@import "../styles/mixins";
  section {
		height: 100vh;
    padding-block-start: 16px;

		@include flex-center-top-column;

    & > div {
      width: 100%;
      padding-left: 10px;
      padding-right: 10px;
    }
	}
	main {
		height: calc(100vh - 36px);
		max-height: 600px;
    overflow-y: scroll;

		@include flex-center-column;
		justify-content: space-between;

    & > div.warp {
      @include flex-center-column;

      & > p.error {
        color: var(--danger-color);
        max-width: 300px;
        word-break: break-all;
      }
    }
    & > div.btns {
      @include flex-between-row;

      & > button {
        margin: 10px;
        min-width: 140px;
      }
    }
    & > div.params {
      box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;

      background-color: var(--card-color);
      @include border-radius(16px);

      &.loading {
        @include loading-gradient(var(--background-color), var(--card-color));
      }

      & > h3 {
        cursor: pointer;
        text-align: right;
        margin-right: 16px;
        color: var(--warning-color);
        margin-block-end: 0;
        font-size: 15px;

        &:hover {
          color: var(--text-color);
        }
      }
    }
	}
</style>
