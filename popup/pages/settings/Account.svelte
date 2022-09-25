<script lang="ts">
	import {
    MAX_NAME_LEN,
    MIN_NAME_LEN
  } from 'popup/config/account';

  import qrcode from 'qrcode/lib/browser';
	import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';

  import { trim } from 'popup/filters/trim';
	import { generateBlockies } from 'popup/mixins/blockies';
  import { uuidv4 } from 'lib/crypto/uuid';
	import { selectAccount, changeAccountName } from 'popup/backend/wallet';

	import walletStore from 'popup/store/wallet';

	import NavClose from '../../components/NavClose.svelte';
	import EditIcon from '../../components/icons/Edit.svelte';
  import SelectCard from '../../components/SelectCard.svelte';
  import Modal from '../../components/Modal.svelte';
  import AccountsModal from '../../modals/Accounts.svelte';


  let uuid = uuidv4();
	let accountsModal = false;
	let base64 = '';
	let index = $walletStore.selectedAddress;
	let name = $walletStore.identities[index].name;
	let loading = true;

	$: account = $walletStore.identities[index];

	onMount(async() => {
    const ctx = document.getElementById(uuid);
		generateBlockies(account.pubKey, ctx);

    base64 = await qrcode.toDataURL(
      `massa://${account.base58}`,
      {
        width: 200,
        height: 200,
      }
    );
	});

	const onSelectAccount = async ({ detail }) => {
		index = detail;
		await selectAccount(detail);
		name = account.name;
    accountsModal = !accountsModal;
	};
	const hanldeOnChangeName = async () => {
		if (name === account.name) {
			return;
		}
		await changeAccountName(name, index);
	};
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
<main>
	<NavClose title={$_('account.title')}/>
  <div>
    <SelectCard
      header={account.name}
      text={trim(account.base58, 10)}
      on:click={() => accountsModal = !accountsModal}
    >
      <div id={uuid}/>
    </SelectCard>
  </div>
	<div>
		{#if base64}
			<img
				src={base64}
				width="300"
				alt="qrcode"
			/>
		{/if}
	</div>
	<label>
		<input
			bind:value={name}
			type="text"
			maxlength={MAX_NAME_LEN}
			minlength={MIN_NAME_LEN}
			placeholder={$_('setup_acc.name_placeholder')}
			on:blur={hanldeOnChangeName}
		/>
		<div>
			<EditIcon />
		</div>
	</label>
</main>

<style lang="scss">
	@import "../../styles/mixins";
	main {
		height: 100vh;
		@include flex-center-top-column;
	}
	img {
		max-width: 500px;
		width: calc(100vw - 50px);
	}
	label {
		background-color: var(--card-color);
		min-width: 270px;
		max-width: 300px;
		border: solid 1px transparent;

		margin-block-start: 15px;
		margin-block-end: 10px;

		@include border-radius(8px);
		@include flex-between-row;

		& > div {
			margin-right: 10px;
		}
		& > input {
			border: none;
      background: transparent;
		}
		&:focus-within {
      border: solid 1px var(--text-color);
    }
	}
</style>
