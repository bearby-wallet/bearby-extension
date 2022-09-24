<script lang="ts">
  import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';
  import { uuidv4 } from 'lib/crypto/uuid';

  import { trim } from 'popup/filters/trim';
  import { viewIcon } from 'popup/utils/icon-view';
	import { generateBlockies } from 'popup/mixins/blockies';

	import walletStore from 'popup/store/wallet';
	import tokensStore from 'popup/store/tokens';

	import NavClose from '../components/NavClose.svelte';
  import SmartInput from '../components/SmartInput.svelte';
  import SelectCard from '../components/SelectCard.svelte';
  import ContactIcon from '../components/icons/Contact.svelte';

  export let params = {
    index: 0,
    recipient: ''
  };

	let uuid = uuidv4();
  let loading = false;
  let amount = 0;
  let recipient = params.recipient;
  let accountIndex = $walletStore.selectedAddress;
  let accountsModal = false;
  let contactsModal = false;
  let recipientError = '';

  $: token = $tokensStore[params.index];
	$: account = $walletStore.identities[accountIndex];
  $: balance = account.tokens && account.tokens[token.base58] ?
    account.tokens[token.base58].final : 0;

  function hanldeOnInput({ detail }) {
    amount = detail;
  }

  function hanldeOnSelect(index: number) {
    console.log(index);
  }

  function onInput() {}

  onMount(() => {
    const ctx = document.getElementById(uuid);
		generateBlockies(account.pubKey, ctx);
  });
</script>

<main>
	<NavClose title={$_('send.title')}/>
  <div>
    <SelectCard
      title={$_('send.sender')}
      header={account.name}
      text={trim(account.base58, 10)}
      on:click={() => accountsModal = !accountsModal}
    >
      <div id={uuid}/>
    </SelectCard>
  </div>
  <div>
    <div class="input">
      <p>
        {$_('send.recipient.title')}
      </p>
      <label class:error={recipientError}>
        <div on:click={() => contactsModal = !contactsModal}>
          <ContactIcon className="cont-icon" />
        </div>
        <input
          bind:value={recipient}
          placeholder={$_('send.recipient.placeholder')}
          on:input={onInput}
        >
      </label>
    </div>
    <div class="smart-input">
      <SmartInput
        img={viewIcon(token.base58)}
        symbol={token.symbol}
        max={balance}
        value={amount}
        loading={loading}
        on:select={() => hanldeOnSelect(0)}
        on:input={hanldeOnInput}
      />
    </div>
  </div>
  <button class="outline">
    {$_('send.sender')}
  </button>
</main>

<style lang="scss">
	@import "../styles/mixins";
  main {
    background: inherit;
		height: 100vh;

		@include flex-center-top-column;

    & > div {
      width: 100%;
      max-width: 500px;
      padding-left: 5px;
      padding-right: 5px;
    }
    & > button {
      width: 100%;
      max-width: 310px;
    }
	}
  div.smart-input {
    width: 100%;
    margin-block-end: 16px;
  }
  div.input {
    width: 100%;
    margin-block-start: 16px;
    margin-block-end: 16px;

    @include flex-column;

    & > label {
      background-color: var(--card-color);
      border: solid 1px var(--card-color);

      @include flex-between-row;
      @include border-radius(8px);

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
        border: solid 1px var(--text-color);
      }
    }
  }
</style>