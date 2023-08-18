<script lang="ts">
  import { onMount } from "svelte";
  import { scale } from "svelte/transition";
  import { _ } from "popup/i18n";
  import { closePopup } from "popup/mixins/popup";

  import { uuidv4 } from "lib/crypto/uuid";
  import { generateBlockies } from "popup/mixins/blockies";
  import { trim } from "popup/filters/trim";

  import walletStore from "popup/store/wallet";
  import reqPubKey from "app/store/req-pub-key";

  import SelectCard from "../components/SelectCard.svelte";
  import { AccountTypes } from "config/account-type";
  import { approvePubKeyReq } from "app/backend/connections";

  const uuid = uuidv4();

  let loading = false;
  let accountIndex = $walletStore.selectedAddress;

  $: account = $walletStore.identities[accountIndex];

  onMount(() => {
    const ctx = document.getElementById(uuid);
    if (ctx) {
      generateBlockies(account.pubKey, ctx);
    }
  });

  const handleOnReject = async () => {
    await approvePubKeyReq(false);
    await closePopup();
  };
  const handleOnApprove = async () => {
    loading = true;
    try {
      await approvePubKeyReq(true);
    } catch (err) {
      //
    }
    await closePopup();
    loading = false;
  };
</script>

{#if $reqPubKey}
  <main in:scale>
    <SelectCard
      header={account.name}
      text={trim(account.base58)}
      on:click={() => null}
    >
      <div id={uuid} />
    </SelectCard>
    <hr />
    <div class="warp">
      <h1>
        {$_("pub_key_req.title")}
      </h1>
      <img
        src={$reqPubKey.icon}
        alt={$reqPubKey.title}
        width="55px"
        height="55px"
      />
      <h2>
        {$reqPubKey.domain}
      </h2>
      <p>
        {$_("pub_key_req.description")}
      </p>
    </div>
    <hr />
    <div class="btns">
      <button class="outline" disabled={loading} on:mouseup={handleOnReject}>
        {$_("pub_key_req.btns.reject")}
      </button>
      <button
        class="primary"
        class:loading
        disabled={loading || account.type === AccountTypes.Track}
        on:mouseup={handleOnApprove}
      >
        {$_("pub_key_req.btns.confirm")}
      </button>
    </div>
  </main>
{/if}

<style lang="scss">
  @import "../styles/mixins";
  main {
    height: 100vh;
    @include flex-center-column;
  }
  .warp {
    padding-block-start: 50px;
    padding-block-end: 50px;

    @include flex-center-column;
  }
  h1 {
    text-align: center;
    @include fluid-text(1024px, 15pt, 20pt);
  }
  h2 {
    background: var(--secondary-color);
  }
  p {
    text-align: center;
  }
  img {
    margin: 16px;
  }
  .btns {
    width: 290px;
    @include flex-between-row;

    & > button {
      min-height: 50px;
      margin: 10px;
    }
  }
</style>
