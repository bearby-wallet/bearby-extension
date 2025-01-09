<script lang="ts">
  import { push } from 'popup/routers/navigation';
  import { _ } from "popup/i18n";
  import { AccountTypes } from "config/account-type";
  import {
    MAX_NAME_LEN,
    MIN_NAME_LEN,
    DEFAULT_KEY_NAME,
  } from "popup/config/account";
  import { balanceUpdate, restoreSecretKey } from "popup/backend/wallet";

  import connectionsAppsStore from "popup/store/connections";
  import walletStore from "popup/store/wallet";

  import NavClose from "../components/NavClose.svelte";
  import AppSelect from "../modals/AppSelect.svelte";

  let error = "";
  let key = "";
  let lastIndex = $walletStore.identities.filter(
    (acc) => acc.type === AccountTypes.PrivateKey,
  ).length;
  let name = `${DEFAULT_KEY_NAME} ${lastIndex}`;
  let loading = false;
  let indexies: number[] = [];

  $: disabled = loading || name.length < MIN_NAME_LEN || key[0] !== "S";

  const handleInputTextarea = () => {
    error = "";
  };

  const handleConnectionsChange = (e: CustomEvent) => {
    error = "";
    indexies = e.detail;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    loading = true;

    try {
      await restoreSecretKey(key, name, indexies);
    } catch (err) {
      error = (err as Error).message;
      loading = false;
      return;
    }

    try {
      await balanceUpdate();
    } catch {
      ///
    }
    push("/");
    loading = false;
  };
</script>

<main>
  <NavClose title={$_("restore_secret.title")} />
  <form onsubmit={handleSubmit}>
    <label class="key">
      <input
        bind:value={key}
        class:error={Boolean(error)}
        placeholder={$_("restore_secret.placeholder") + " (S1....)"}
        required
        oninput={handleInputTextarea}
      />
    </label>
    <label class="name">
      <input
        bind:value={name}
        maxlength={MAX_NAME_LEN}
        minlength={MIN_NAME_LEN}
        placeholder={$_("setup_acc.name_placeholder")}
        required
      />
      <p>
        {$_("setup_acc.name_description")}
      </p>
    </label>
    <b class:error={Boolean(error)}>
      {error}
    </b>
    <AppSelect
      identities={$connectionsAppsStore}
      on:changed={handleConnectionsChange}
    />
    <button class="outline" class:loading {disabled}>
      {$_("restore.btn")}
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
    width: calc(100vw - 30px);
    @include flex-center-column;
  }
  input {
    width: 100%;
  }
  button {
    max-width: 290px;
    margin: 5pt;
  }
  b {
    text-align: center;

    @include fluid-text(600px, 12pt, 18pt);

    &.error {
      color: var(--danger-color);
    }
  }
  label {
    @include flex-column;

    &.name,
    &.key {
      width: 290px;
    }
    &.key {
      margin: 5pt;
    }

    & > p {
      margin: 0;
      text-indent: 8px;
      font-size: 8pt;
      margin-block-end: 11px;
    }
  }
</style>
