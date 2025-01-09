<script lang="ts">
  import { _ } from "popup/i18n";
  import { onMount } from "svelte";
  import { push } from 'popup/routers/navigation';
  import { generateBlockies } from "popup/mixins/blockies";

  import { trim } from "popup/filters/trim";
  import { uuidv4 } from "lib/crypto/uuid";
  import { closePopup } from "popup/mixins/popup";
  import {
    rejectConfirmTransaction,
    bordercastTransaction,
    updateConfirm,
  } from "popup/backend/transactions";
  import { selectAccount } from "popup/backend/wallet";

  import walletStore from "popup/store/wallet";
  import confirmStore from "app/store/confirm";

  import SelectCard from "../components/SelectCard.svelte";
  import Modal from "../components/Modal.svelte";
  import AccountsModal from "../modals/Accounts.svelte";
  import TransactionParams from "../components/TransactionParams.svelte";
  import GasControl from "../components/GasControl.svelte";
  import TokenImage from "../components/TokenImage.svelte";

  import { AccountTypes } from "config/account-type";
  import type { ConfirmParams } from "types/transaction";
    import { OperationsType } from "background/provider/operations";

  const url = new URL(window.location.href);

  let uuid = $state(uuidv4());
  let txIndex = $state(0);
  let index = $state($walletStore.selectedAddress);
  let transaction: ConfirmParams = $state($confirmStore[0]);
  let accountsModal = $state(false);
  let editModal = $state(false);
  let loading = $state(false);
  let err = $state("");
  let multiplier = $state(1);

  let account = $derived($walletStore.identities[index]);

  console.log(transaction);

  async function onSelectAccount(e: CustomEvent) {
    loading = true;
    try {
      loading = false;
      index = e.detail;
      accountsModal = !accountsModal;

      const ctx = document.getElementById(uuid);

      if (ctx) {
        ctx["textContent"] = "";
        generateBlockies($walletStore.identities[index].pubKey, ctx);
      }

      err = "";

      await selectAccount(e.detail);
    } catch (e) {
      err = (e as Error).message;
    }
  }

  async function handleOnChangeGasMultiplier(e: CustomEvent) {
    multiplier = Number(e.detail);
  }

  async function onNextTx() {
    const isExtends = Boolean(transaction.uuid);

    if ($confirmStore.length === 0) {
      if (isExtends) {
        if (url.searchParams.has("type")) {
          return closePopup();
        }

        window.history.back();

        return;
      }

      push("/history");
    }
  }

  async function handleOnConfirm() {
    loading = true;
    try {
      transaction.fee = String(multiplier * Number(transaction.fee));

      await updateConfirm(transaction, txIndex);
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
  title={$_("account.modal.title")}
  on:close={() => (accountsModal = !accountsModal)}
>
  <div class="m-warp">
    <AccountsModal
      list={$walletStore.identities}
      {index}
      on:selected={onSelectAccount}
    />
  </div>
</Modal>
<section>
  <SelectCard
    header={account.name}
    disabled={transaction.type == OperationsType.CallSC || transaction.type == OperationsType.ExecuteSC || transaction.type == OperationsType.RollBuy || transaction.type == OperationsType.RollSell}
    text={trim(account.base58, 10)}
    on:click={() => (accountsModal = !accountsModal)}
  >
    <div id={uuid}></div>
  </SelectCard>
  <div>
    <hr />
  </div>
  {#if transaction}
    <main>
      <div class="warp">
        <h2>
          {transaction.title || "BearBy"}
        </h2>
        {#if transaction.icon}
          <TokenImage
            src={transaction.icon}
            height="40"
            width="40"
            alt="icon"
          />
        {/if}
        <p class="error">
          {err}
        </p>
      </div>
      <div class="params" class:loading>
        <GasControl
          {multiplier}
          fee={Number(transaction.fee)}
          on:select={handleOnChangeGasMultiplier}
        />
        <h3 onclick={() => (editModal = !editModal)}>
          ({$_("confirm.btns.edit")})
        </h3>
        <TransactionParams tx={transaction} />
      </div>
      <div class="btns">
        <button class="primary" disabled={loading} onmouseup={handleOnReject}>
          {$_("confirm.btns.reject")}
        </button>
        <button
          class="outline"
          class:loading
          disabled={loading || account.type === AccountTypes.Track}
          onmouseup={handleOnConfirm}
        >
          {$_("confirm.btns.confirm")}
        </button>
      </div>
    </main>
  {/if}
</section>

<style lang="scss">
  @use '../styles/mixins' as mix;

  section {
    height: 100vh;
    padding-block-start: 16px;

    @include mix.flex-center-top-column;

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

    @include mix.flex-center-column;
    justify-content: space-between;

    & > div.warp {
      @include mix.flex-center-column;

      & > p.error {
        color: var(--danger-color);
        max-width: 300px;
        word-break: break-all;
      }
    }
    & > div.btns {
      @include mix.flex-between-row;

      & > button {
        margin: 10px;
        min-width: 140px;
      }
    }
    & > div.params {
      margin: 8px;
      box-shadow:
        rgb(0 0 0 / 1%) 0px 0px 1px,
        rgb(0 0 0 / 4%) 0px 4px 8px,
        rgb(0 0 0 / 4%) 0px 16px 24px,
        rgb(0 0 0 / 1%) 0px 24px 32px;

      background-color: var(--card-color);
      @include mix.border-radius(16px);

      &.loading {
        @include mix.loading-gradient(var(--loading-color), var(--card-color));
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
