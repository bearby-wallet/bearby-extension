<script lang="ts">
  import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';
  import { uuidv4 } from 'lib/crypto/uuid';
  import { push } from 'svelte-spa-router';

  import { trim } from 'popup/filters/trim';
  import { viewIcon } from 'popup/utils/icon-view';
	import { generateBlockies } from 'popup/mixins/blockies';
  import { addConfirmBuyRolls, addConfirmSellRolls } from 'popup/mixins/transaction';

	import walletStore from 'popup/store/wallet';
	import tokensStore from 'popup/store/tokens';

	import NavClose from '../components/NavClose.svelte';
  import SmartInput from '../components/SmartInput.svelte';
  import SelectCard from '../components/SelectCard.svelte';
  import Modal from '../components/Modal.svelte';
  import AccountsModal from '../modals/Accounts.svelte';
	import SwapIcon from '../components/icons/Swap.svelte';


  const selectedToken = 1; // ROLS.
  const rolls = $tokensStore[selectedToken];

	let uuid = uuidv4();
  let loading = false;
  let rollPrice = 100; // TODO: fetch from nodeStatus.
  let accountIndex = $walletStore.selectedAddress;
  let accountsModal = false;
  let recipientError = '';
  let tokens = [
		{
			value: 0,
			meta: $tokensStore[0]
		},
		{
			value: 0,
			meta: $tokensStore[1]
		}
	];

	$: account = $walletStore.identities[accountIndex];
  $: base58 = tokens[0].meta.base58;
  $: balance = account.tokens && account.tokens[base58] ?
    account.tokens[base58].final : 0;
  $: disabled = tokens[0].value > balance || tokens[0].value <= 0;

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    try {
      if (tokens[0].meta.base58 === rolls.base58) {
        await addConfirmSellRolls(tokens[0].value, account.base58, rolls);
      } else {
        await addConfirmBuyRolls(tokens[1].value, account.base58, rolls);

      }

      push('/confirm');
    } catch (err) {
      console.error(err);
      recipientError = (err as Error).message;
    }
    loading = false;
  }

  function hanldeOnInput(amount: number) {
    const newTokens = tokens;
    const index = 0;

    if (newTokens[index].meta.base58 === rolls.base58) {
      newTokens[index].value = amount;
      newTokens[1].value = Math.floor(amount * rollPrice);
    } else {
      newTokens[index].value = amount;
      newTokens[1].value = Math.floor(amount / rollPrice);
    }

    tokens = newTokens;
  }

  function hanldeOnSwapTokens() {
		tokens = tokens.reverse();
	}

  async function onSelectAccount(e: CustomEvent) {
		accountIndex = e.detail;
    const ctx = document.getElementById(uuid);

    if (ctx) {
      ctx['textContent'] = '';
      generateBlockies($walletStore.identities[accountIndex].pubKey, ctx);
    }

    accountsModal = !accountsModal;
	};

  onMount(async() => {
    const ctxAccount = document.getElementById(uuid);

    if (ctxAccount) {
      generateBlockies(account.pubKey, ctxAccount);
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
      index={accountIndex}
      on:selected={onSelectAccount}
    />
  </div>
</Modal>
<main>
	<NavClose title={$_('rolls.title')}/>
  <form on:submit={handleSubmit}>
    <div>
      <SelectCard
        title={$_('rolls.buyer')}
        header={account.name}
        text={trim(account.base58, 10)}
        on:click={() => accountsModal = !accountsModal}
      >
        <div id={uuid}/>
      </SelectCard>
    </div>
    <hr />
    <p>
      {$_('rolls.pay')}
    </p>
    <SmartInput
      img={viewIcon(tokens[0].meta.base58)}
      symbol={tokens[0].meta.symbol}
      max={Number(balance)}
      value={String(tokens[0].value)}
      loading={loading}
      on:input={(event) => hanldeOnInput(event.detail)}
    />
    <div class="seporate">
      <p>
        {$_('rolls.receive')}
      </p>
      <span on:click={hanldeOnSwapTokens}>
        <SwapIcon className="swap-icon"/>
      </span>
    </div>
    <SmartInput
      img={viewIcon(tokens[1].meta.base58)}
      symbol={tokens[1].meta.symbol}
      value={String(tokens[1].value)}
      loading={loading}
      percents={[]}
      disabled={true}
      converted={0}
    />
    <button
      class="outline"
      class:loading={loading}
      disabled={disabled}
    >
      {$_('rolls.button')}
    </button>
  </form>
</main>

<style lang="scss">
	@import "../styles/mixins";
  main {
		height: 100vh;

		@include flex-center-top-column;
	}
  form {
		@include flex-center-column;

		min-width: 290px;
    max-width: 500px;
    width: 100%;

    padding-left: 5px;
    padding-right: 5px;

    & > p {
      width: 100%;
      line-height: 0;
      text-indent: 8px;
    }
		& > div.seporate {
			width: 100%;
			padding-left: 8px;
			padding-right: 8px;

			@include flex-between-row;

			& > p {
        line-height: 0;
        text-indent: 8px;
			}
			& > span {
				cursor: pointer;

				&:hover {
					& > :global(.swap-icon > path) {
						fill: var(--primary-color);
					}
				}
			}
		}
		& > button {
			width: 100%;
		}
		& > :global(label),
		& > button {
			margin-block-end: 5px;
			margin-block-start: 5px;

			&:disabled {
				&:hover {
					border-color: var(--button-color);
					background: var(--button-color);
					color: var(--primary-color);
				}
			}
		}
	}
</style>
