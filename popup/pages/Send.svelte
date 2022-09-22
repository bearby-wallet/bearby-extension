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


  export let params = {
    index: 0,
    recipient: ''
  };

	let uuid = uuidv4();
  let loading = false;
  let amount = 0;
  let accountIndex = $walletStore.selectedAddress;
  let accountsModal = false;

  $: token = $tokensStore[params.index];
	$: account = $walletStore.identities[accountIndex];

  function hanldeOnInput({ detail }) {
    amount = detail;
  }

  function hanldeOnSelect(index: number) {
    console.log(index);
  }

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
    <SmartInput
      img={viewIcon(token.base58)}
      symbol={token.symbol}
      max={account.tokens[token.base58].final}
      value={amount}
      loading={loading}
      on:select={() => hanldeOnSelect(0)}
      on:input={hanldeOnInput}
    />
  </div>
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
	}
</style>
