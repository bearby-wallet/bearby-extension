<script lang="ts">
  import Big from "big.js";

  import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';
  import { uuidv4 } from 'lib/crypto/uuid';
  import { push } from 'popup/routers/navigation';

  import { trim } from 'popup/filters/trim';
  import { TokenType, viewIcon } from 'popup/utils/icon-view';
	import { generateBlockies } from 'popup/mixins/blockies';
  import { addConfirmBuyRolls, addConfirmSellRolls } from 'popup/mixins/transaction';
  import { toMass } from "app/filters/numbers";

	import walletStore from 'popup/store/wallet';
	import tokensStore from 'popup/store/tokens';

	import NavClose from '../components/NavClose.svelte';
  import SmartInput from '../components/SmartInput.svelte';
  import SelectCard from '../components/SelectCard.svelte';
  import Modal from '../components/Modal.svelte';
  import AccountsModal from '../modals/Accounts.svelte';
	import SwapIcon from '../components/icons/Swap.svelte';

	Big.PE = 99;

  const selectedToken = 1; // ROLS.
  const rolls = $tokensStore[selectedToken];
  const rollPrice = Big(100); // TODO: fetch from nodeStatus.

	let uuid = uuidv4();
  let loading = false;
  let accountIndex = $walletStore.selectedAddress;
  let accountsModal = false;
  let tokens = [
		{
			value: Big(0),
			meta: $tokensStore[0]
		},
		{
			value: Big(0),
			meta: $tokensStore[1]
		}
	];

  $: token = $tokensStore[0];
	$: account = $walletStore.identities[accountIndex];
  $: disabled = Number(tokens[0].value) > Number(balance) || Number(tokens[0].value) <= 0;
  $: balance =
    account.tokens && account.tokens[token.base58]
      ? toMass(account.tokens[token.base58].final, token.decimals)
      : 0;


  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    try {
      if (tokens[0].meta.base58 === rolls.base58) {
        const _decimals = Big(10).pow(tokens[0].meta.decimals);
        await addConfirmSellRolls(tokens[0].value.mul(_decimals).round(), account.base58, rolls);
      } else {
        await addConfirmBuyRolls(tokens[1].value.round(), account.base58, rolls);
      }

      push('/confirm');
    } catch (err) {
      console.error(err);
    }
    loading = false;
  }

  function hanldeOnInput(newAmount: Big) {
    newAmount = Big(newAmount);
    const newTokens = tokens;
    const index = 0;

    if (newTokens[index].meta.base58 === rolls.base58) {
      newTokens[index].value = newAmount;
      newTokens[1].value = newAmount.mul(rollPrice);
    } else {
      newTokens[index].value = newAmount;
      newTokens[1].value = newAmount.div(rollPrice).round();
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
  <form onsubmit={handleSubmit}>
    <div>
      <SelectCard
        title={$_('rolls.buyer')}
        header={account.name}
        text={trim(account.base58, 10)}
        on:click={() => accountsModal = !accountsModal}
      >
        <div id={uuid}></div>
      </SelectCard>
    </div>
    <hr />
    <p>
      {$_('rolls.pay')}
    </p>
    <SmartInput
      img={viewIcon(tokens[0].meta.base58, TokenType.FT)}
      symbol={tokens[0].meta.symbol}
      max={Number(balance)}
      value={tokens[0].value}
      loading={loading}
      on:input={(event) => hanldeOnInput(event.detail)}
    />
    <div class="seporate">
      <p>
        {$_('rolls.receive')}
      </p>
      <span onmouseup={hanldeOnSwapTokens} role="button" tabindex="0">
        <SwapIcon className="swap-icon"/>
      </span>
    </div>
    <SmartInput
      img={viewIcon(tokens[1].meta.base58, TokenType.FT)}
      symbol={tokens[1].meta.symbol}
      value={tokens[1].value}
      max={balance}
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
