<script lang="ts">
  import { onMount } from "svelte";
  import Big from "big.js";
  import { _ } from "popup/i18n";
  import { uuidv4 } from "lib/crypto/uuid";
  import { push } from 'popup/routers/navigation';

  import { trim } from "popup/filters/trim";
  import { TokenType, viewIcon } from "popup/utils/icon-view";
  import { generateBlockies } from "popup/mixins/blockies";
  import { getContacts } from "popup/backend/contacts";
  import {
    addConfirmTransaction,
    addConfirmTransferFT,
  } from "popup/mixins/transaction";

  import walletStore from "popup/store/wallet";
  import tokensStore from "popup/store/tokens";

  import NavClose from "../components/NavClose.svelte";
  import SmartInput from "../components/SmartInput.svelte";
  import SelectCard from "../components/SelectCard.svelte";
  import ContactIcon from "../components/icons/Contact.svelte";
  import Modal from "../components/Modal.svelte";
  import AccountsModal from "../modals/Accounts.svelte";
  import TokensModal from "../modals/Tokens.svelte";
  import AccountSelectorModal from "../modals/AccountSelector.svelte";
  import TokenImage from "../components/TokenImage.svelte";
  import { ZERO_ADDRESS } from "config/common";
  import { fromMass, toMass } from "app/filters/numbers";

  Big.PE = 99;

  interface Props {
    index: number;
    recipient: string;
  }

  let params: Props = $props();

  let uuid = $state(uuidv4());
  let error = $state("");
  let loading = $state(false);
  let amount = $state(Big(0));
  let recipient = $state(params.recipient);
  let accountIndex = $state($walletStore.selectedAddress);
  let selectedToken = $state(Number(params.index));
  let tokensModal = $state(false);
  let accountsModal = $state(false);
  let contactsModal = $state(false);
  let recipientError = $state("");


  let token = $derived($tokensStore[selectedToken]);
  let account = $derived($walletStore.identities[accountIndex]);
  let balance = $derived(
    account.tokens && account.tokens[token.base58]
      ? toMass(account.tokens[token.base58].final, token.decimals)
      : 0);
  let disabled = $derived(amount.lte(0) || amount.gt(balance) || !recipient);

  function hanldeOnInput(event: CustomEvent) {
    error = "";
    amount = Big(event.detail);
  }

  const onSelectAccount = async (event: CustomEvent) => {
    error = "";
    accountIndex = event.detail;
    const ctx = document.getElementById(uuid);

    if (ctx) {
      ctx["textContent"] = "";
      generateBlockies($walletStore.identities[accountIndex].pubKey, ctx);
    }

    accountsModal = !accountsModal;
  };

  const onSelectToken = async (event: CustomEvent) => {
    error = "";
    selectedToken = event.detail;
    tokensModal = !tokensModal;
  };

  function onSelectRecipient(event: CustomEvent) {
    error = "";
    recipient = event.detail;
    contactsModal = !contactsModal;
  }

  function onInputRecipient(e: Event) {
    error = "";
    recipient = (e.target as HTMLInputElement).value;
  }

  async function onSubmin() {
    loading = true;
    const bigAmt = fromMass(amount, token.decimals).toString();
    try {
      if (token.base58 == ZERO_ADDRESS) {
        await addConfirmTransaction(bigAmt, recipient, token);
      } else {
        await addConfirmTransferFT(bigAmt, recipient, token);
      }
      push("/confirm");
    } catch (err) {
      error = (err as Error).message;
      console.error(err);
    }
    loading = false;
  }

  onMount(async () => {
    const ctxAccount = document.getElementById(uuid);

    if (ctxAccount) {
      generateBlockies(account.pubKey, ctxAccount);
    }

    await getContacts();
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
      index={accountIndex}
      on:selected={onSelectAccount}
    />
  </div>
</Modal>
<Modal
  show={contactsModal}
  title={$_("send.recipient.title")}
  on:close={() => (contactsModal = !contactsModal)}
>
  <div class="m-warp">
    <AccountSelectorModal on:selected={onSelectRecipient} />
  </div>
</Modal>
<Modal
  show={tokensModal}
  title={$_("send.modal.tokens")}
  on:close={() => (tokensModal = !tokensModal)}
>
  <div class="m-warp">
    <TokensModal
      list={$tokensStore}
      index={selectedToken}
      {account}
      on:selected={onSelectToken}
    />
  </div>
</Modal>
<main>
  <NavClose title={$_("send.title")} />
  <div class="wrapper">
    <div>
      <div>
        <SelectCard
          title={$_("send.sender")}
          header={account.name}
          text={trim(account.base58, 10)}
          on:click={() => (accountsModal = !accountsModal)}
        >
          <div id={uuid}></div>
        </SelectCard>
      </div>
      <div>
        <SelectCard
          title={$_("send.token")}
          header={token.name}
          text={trim(token.base58, 10)}
          on:click={() => (tokensModal = !tokensModal)}
        >
          <TokenImage
            src={viewIcon(token.base58, TokenType.FT)}
            height="45"
            alt={token.symbol}
          />
        </SelectCard>
      </div>
    </div>
    <hr />
    <div>
      <div class="input">
        <label class:error={recipientError}>
          <div onmouseup={() => (contactsModal = !contactsModal)} role="button" tabindex="0">
            <ContactIcon width="23" height="26" className="cont-icon" />
          </div>
          <input
            bind:value={recipient}
            placeholder={$_("send.recipient.placeholder")}
            oninput={onInputRecipient}
          />
        </label>
      </div>
      <div class="input">
        <SmartInput
          img={viewIcon(token.base58, TokenType.FT)}
          symbol={token.symbol}
          max={balance}
          value={amount}
          {loading}
          on:select={() => (tokensModal = !tokensModal)}
          on:input={hanldeOnInput}
        />
      </div>
      {#if error}
        <div class="error-warp">
          <b class="error">
            {error}
          </b>
        </div>
      {/if}
      <button class="outline" class:loading {disabled} onmouseup={onSubmin}>
        {$_("send.continue")}
      </button>
    </div>
  </div>
</main>

<style lang="scss">
  @use '../styles/mixins' as mix;

  main {
    background: inherit;
    height: 100vh;

    @include mix.flex-center-top-column;

    & > div {
      width: 100%;
      max-width: 500px;
      padding-left: 5px;
      padding-right: 5px;
    }
  }
  div.error-warp {
    width: 290px;
    text-align: center;

    & > .error {
      word-wrap: break-word;
      color: var(--danger-color);
    }
  }
  button {
    width: 100%;
    max-width: 310px;
    margin-block-start: 15px;

    @include mix.border-radius(12px);
  }
  div.wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 500px;

    & > div {
      @include mix.flex-center-top-column;

      & > div {
        margin: 5px;
      }
    }
  }
  div.input {
    max-width: 400px;
    width: calc(100vw - 20px);
    margin-block-end: 16px;
  }
  div.input {
    margin-block-start: 16px;

    @include mix.flex-column;

    & > label {
      background-color: var(--card-color);
      border: solid 1px var(--card-color);

      height: 55px;

      @include mix.flex-between-row;
      @include mix.border-radius(16px);

      &.error {
        border-color: var(--danger-color);
        input {
          color: var(--danger-color);
        }
      }
      & > input {
        width: 100%;
        padding-left: 0;
        border-color: var(--card-color);
        background: transparent;
      }
      & > div {
        cursor: pointer;
        padding: 13px;

        &:hover {
          :global(svg.cont-icon > path) {
            fill: var(--primary-color);
          }
        }
      }
      &:focus-within {
        border: solid 1px var(--muted-color);
      }
    }
  }
</style>
