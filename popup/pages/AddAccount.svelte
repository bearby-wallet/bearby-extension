<script lang="ts">
  import { push } from 'popup/routers/navigation';
  import { _ } from "popup/i18n";
  import { AccountTypes } from "config/account-type";
  import {
    MAX_NAME_LEN,
    MIN_NAME_LEN,
    DEFAULT_NAME,
  } from "popup/config/account";
  import walletStore from "popup/store/wallet";
  import { createNextSeedAccount, balanceUpdate } from "popup/backend/wallet";

  import connectionsAppsStore from "popup/store/connections";

  import NavClose from "../components/NavClose.svelte";
  import AppSelect from "../modals/AppSelect.svelte";

  let lastIndex = $walletStore.identities.filter(
    (acc) => acc.type === AccountTypes.Seed,
  ).length;
  let name = `${DEFAULT_NAME} ${lastIndex}`;
  let loading = false;
  let indexies: number[] = [];
  let error = "";

  $: disabled = loading || name.length < MIN_NAME_LEN;

  const handleConnectionsChange = (e: CustomEvent) => {
    error = "";
    indexies = e.detail;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    loading = true;

    try {
      await createNextSeedAccount(name, indexies);
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
  <NavClose title={$_("setup_acc.title")} />
  <form onsubmit={handleSubmit}>
    <label>
      <input
        bind:value={name}
        maxlength={MAX_NAME_LEN}
        minlength={MIN_NAME_LEN}
        placeholder={$_("setup_acc.name_placeholder")}
        required
      />
      <p>
        {$_("setup_acc.name")}
      </p>
    </label>
    <p class="error">
      {error}
    </p>
    <AppSelect
      identities={$connectionsAppsStore}
      on:changed={handleConnectionsChange}
    />
    <button class="primary" class:loading {disabled}>
      {$_("restore.btn")}
    </button>
  </form>
</main>

<style lang="scss">
  @use "../styles/mixins";
  main {
    height: 100vh;

    @include flex-center-top-column;
  }
  form {
    width: 100%;
    @include flex-center-column;

    & > label,
    & > button {
      width: 100%;
      max-width: 290px;
      margin: 10px;
    }

    & > p.error {
      font-size: 12pt;
      color: var(--danger-color);
    }

    & > label > p {
      margin: 0;
      text-indent: 8px;
    }
  }
</style>
