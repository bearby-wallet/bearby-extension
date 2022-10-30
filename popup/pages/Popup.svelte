<script lang="ts">
	import { _ } from 'popup/i18n';
  import { onMount } from 'svelte';
  import { push, pop } from 'svelte-spa-router';
	import { generateBlockies } from 'popup/mixins/blockies';

  import { trim } from 'popup/filters/trim';
  import { uuidv4 } from 'lib/crypto/uuid';
  import { closePopup } from 'popup/mixins/popup';
  import {
    rejectConfirmTransaction,
    bordercastTransaction,
    updateConfirm
  } from 'popup/backend/transactions';
	import { selectAccount } from 'popup/backend/wallet';

	import walletStore from 'popup/store/wallet';
  import confirmStore from 'app/store/confirm';
	import gasStore from 'popup/store/gas';

  import SelectCard from '../components/SelectCard.svelte';
  import Modal from '../components/Modal.svelte';
  import AccountsModal from '../modals/Accounts.svelte';
  import TransactionParams from '../components/TransactionParams.svelte';
	import GasControl from '../components/GasControl.svelte';


  const url = new URL(window.location.href);
  let uuid = uuidv4();
  let txIndex = 0;
	let index = $walletStore.selectedAddress;
  let transaction = $confirmStore[txIndex];
  let accountsModal = false;
  let editModal = false;
  let loading = false;
  let err = '';

  $: account = $walletStore.identities[index];

  async function onSelectAccount(e: CustomEvent) {
    loading = true;
    try {
      loading = false;
      index = e.detail;
      accountsModal = !accountsModal;

      const ctx = document.getElementById(uuid);

      if (ctx) {
        ctx['textContent'] = '';
        generateBlockies($walletStore.identities[index].pubKey, ctx);
      }

      err = '';

      await selectAccount(e.detail);
    } catch (e) {
      err = (e as Error).message;
    }
	};

  async function handleOnChangeGasMultiplier(e: CustomEvent) {
    const gasMultiplier = Number(e.detail);

    transaction.gasMultiplier = gasMultiplier;
    transaction.fee = (transaction.gasPrice * transaction.gasMultiplier) * transaction.gasLimit;

    await updateConfirm(transaction, txIndex);
  }

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

  async function handleOnConfirm() {
    loading = true;
    try {
      await bordercastTransaction(txIndex);
      await onNextTx();
      transaction = $confirmStore[txIndex];
    } catch (e) {
      err = (e as Error).message;
    }
    loading = false;
  }

  async function handleOnReject() {
    loading = true;
    try {
      await rejectConfirmTransaction(txIndex);
      await onNextTx();
    } catch (e) {
      err = (e as Error).message;
    }
    loading = false;
  }

	onMount(() => {
    const ctx = document.getElementById(uuid);
    if (ctx) {
      generateBlockies(account.pubKey, ctx);
    }    
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
        <p class="error">
          {err}
        </p>
      </div>
      <div
        class="params"
        class:loading={loading}
      >
        <GasControl
          multiplier={transaction.gasMultiplier || $gasStore.multiplier}
          gasLimit={transaction.gasLimit}
          gasPrice={transaction.gasPrice}
          on:select={handleOnChangeGasMultiplier}
        />
        <h3 on:mouseup={() => editModal = !editModal}>
          ({$_('confirm.btns.edit')})
        </h3>
        <TransactionParams tx={transaction}/>
      </div>
      <div class="btns">
        <button
          class="primary"
          class:loading={loading}
          disabled={loading}
          on:mouseup={handleOnReject}
        >
          {$_('confirm.btns.reject')}
        </button>
        <button
          class="outline"
          class:loading={loading}
          disabled={loading}
          on:mouseup={handleOnConfirm}
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
      margin: 8px;
      box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;

      background-color: var(--card-color);
      @include border-radius(16px);

      &.loading {
        @include loading-gradient(var(--loading-color), var(--card-color));
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
