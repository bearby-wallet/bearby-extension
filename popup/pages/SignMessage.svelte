<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { _ } from 'popup/i18n';
	import { closePopup } from 'popup/mixins/popup';

  import { uuidv4 } from 'lib/crypto/uuid';
	import { generateBlockies } from 'popup/mixins/blockies';
  import { trim } from 'popup/filters/trim';
  import { rejectSignMessage, signMessageApprove } from 'popup/backend/transactions';

	import walletStore from 'popup/store/wallet';
  import messageStore from 'popup/store/message';

  import SelectCard from '../components/SelectCard.svelte';
  import Modal from '../components/Modal.svelte';
	import AccountsModal from '../modals/Accounts.svelte';
	import Toggle from '../components/Toggle.svelte';
  import { AccountTypes } from 'config/account-type';


  const uuid = uuidv4();

	let loading = $state(false);
	let accountsModal = $state(false);
	let accountIndex = $state($walletStore.selectedAddress);
  let isHash = $state(false);

	let account = $derived($walletStore.identities[accountIndex]);


	onMount(() => {
    const ctx = document.getElementById(uuid);
    if (ctx) {
      generateBlockies(account.pubKey, ctx);
    }
  });

	const onSelectAccount = async (e: CustomEvent) => {
    accountIndex = e.detail;
    accountsModal = false;
	};

  const handleOnReject = async () => {
    await rejectSignMessage();
    await closePopup();
  };
  const handleOnSign = async () => {
    loading = true;
    try {
      await signMessageApprove();
      await closePopup();
    } catch (err) {
      console.warn(err);
    }
    loading = false;
  };
</script>

<Modal
  show={accountsModal}
  title={$_('sig_message.signer')}
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
{#if $messageStore}
  <main in:scale>
    <SelectCard
      header={account.name}
      text={trim(account.base58)}
      on:click={() => accountsModal = !accountsModal}
    >
      <div id={uuid}></div>
    </SelectCard>
    <hr/>
    <h1>
      {$_('sig_message.title')}
    </h1>
    <img
      src={$messageStore.icon}
      alt={$messageStore.title}
      width="55px"
      height="55px"
    />
    <h2>
      {$messageStore.title}
    </h2>
    <textarea readonly>
      {isHash ? $messageStore.hash : $messageStore.message}
    </textarea>
    <div class="toggle">
      <h3>
        {$_('sig_message.hash')}
      </h3>
      <Toggle
        checked={isHash}
        on:toggle={() => isHash = !isHash}
      />
    </div>
    <hr />
    <div class="btns">
      <button
        class="outline"
        disabled={loading}
        onmouseup={handleOnReject}
      >
        {$_('sig_message.btns.reject')}
      </button>
      <button
        class="primary"
        class:loading={loading}
        disabled={loading || account.type === AccountTypes.Track}
        onmouseup={handleOnSign}
      >
        {$_('sig_message.btns.confirm')}
      </button>
    </div>
  </main>
{/if}


<style lang="scss">
	@use '../styles/mixins' as mix;
	main {
		height: 100vh;
		@include mix.flex-center-column;
	}
  h1 {
    @include mix.fluid-text(1024px, 22pt, 55pt);
  }
  img {
    margin: 16px;
  }
  .toggle {
    width: 290px;
    @include mix.flex-between-row;
  }
  textarea {
    line-height: 1em;
    margin: 0;
    padding: 5px;
    min-height: 100px;
    font-weight: normal;
    overflow-y: scroll;
  }
  .btns {
    width: 290px;
    @include mix.flex-between-row;

    & > button {
      min-height: 50px;
      margin: 10px;
    }
  }
</style>
