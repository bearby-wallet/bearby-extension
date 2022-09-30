<script lang="ts">
	import { _ } from 'popup/i18n';
  import { onMount } from 'svelte';
	import { generateBlockies } from 'popup/mixins/blockies';

  import { trim } from 'popup/filters/trim';
  import { uuidv4 } from 'lib/crypto/uuid';

	import walletStore from 'popup/store/wallet';

  import SelectCard from '../components/SelectCard.svelte';
  import Modal from '../components/Modal.svelte';
  import AccountsModal from '../modals/Accounts.svelte';


  let uuid = uuidv4();
	let index = $walletStore.selectedAddress;
  let accountsModal = false;

  $: account = $walletStore.identities[index];

  const onSelectAccount = async ({ detail }) => {
		index = detail;
    accountsModal = !accountsModal;

    const ctx = document.getElementById(uuid);
    ctx.textContent = '';
		generateBlockies($walletStore.identities[index].pubKey, ctx);
	};

	onMount(() => {
    const ctx = document.getElementById(uuid);
		generateBlockies(account.pubKey, ctx);
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
  <main>
  </main>
</section>

<style lang="scss">
	@import "../styles/mixins";
  section {
		height: 100vh;
    padding-block-start: 16px;

		@include flex-center-top-column;
	}
	main {
		height: calc(100vh - 36px);
		max-height: 600px;
    overflow-y: scroll;

		@include flex-center-column;
		justify-content: space-between;
	}
</style>
