<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { route } from 'popup/routers/navigation';
  import { _ } from "popup/i18n";
  import { AccountTypes } from "config/account-type";

  import {
    togglePopupEnabled,
    setDowngradeNodeFlag,
    toggleFormatNumbers,
  } from "popup/backend/settings";
  import { removeAccount } from "popup/backend/wallet";

  import walletStore from "popup/store/wallet";
  import settingsStore from "popup/store/settings";

  import Close from "./icons/Close.svelte";
  import TextElement from "./TextElement.svelte";
  import Toggle from "./Toggle.svelte";

  const dispatch = createEventDispatcher();

  export let show = false;

  $: account = $walletStore.identities[$walletStore.selectedAddress];
  $: canRemove = !(account.index === 0 && account.type === AccountTypes.Seed);

  const handleOnChangePromt = async () => {
    await togglePopupEnabled();
  };
  const handleOnChangeFormat = async () => {
    await toggleFormatNumbers();
  };
  async function toggleDowngrade() {
    await setDowngradeNodeFlag(!$settingsStore.network.downgrade);
  }
  const onClose = () => {
    dispatch("close");
  };
  const onRemoveAccount = async () => {
    await removeAccount();
    onClose();
  };
</script>

<nav class:show>
  <h1>
    {account.name}
    <span onmouseup={onClose} role="button" tabindex="0">
      <Close />
    </span>
  </h1>
  <hr />
  <a href="/add" use:route>
    <TextElement
      title={$_("home.nav.options.add.title")}
      description={$_("home.nav.options.add.description")}
    />
  </a>
  <a href="/import" use:route>
    <TextElement
      title={$_("home.nav.options.import.title")}
      description={$_("home.nav.options.import.description")}
    />
  </a>
  <a href="/add-track" use:route>
    <TextElement
      title={$_("home.nav.options.track.title")}
      description={$_("home.nav.options.track.description")}
    />
  </a>
  {#if canRemove}
    <span class="remove" onmouseup={onRemoveAccount} role="button" tabindex="0">
      <TextElement
        title={$_("home.nav.options.remove.title")}
        description={$_("home.nav.options.remove.description")}
      />
    </span>
  {/if}
  <hr />
  <div class="toggles">
    <div>
      <b>
        {$_("advanced.popup.title")}
      </b>
      <Toggle checked={$settingsStore.popup} on:toggle={handleOnChangePromt} />
    </div>
    <div>
      <b>
        {$_("network.downgrade.toggle")}
      </b>
      <Toggle
        checked={$settingsStore.network.downgrade}
        on:toggle={toggleDowngrade}
      />
    </div>
    <div>
      <b>
        {$_("advanced.format.title")}
      </b>
      <Toggle
        checked={$settingsStore.format}
        on:toggle={handleOnChangeFormat}
      />
    </div>
  </div>
</nav>
<div class="close" class:show onmouseup={onClose} role="button" tabindex="0"></div>

<style lang="scss">
  @import "../styles/mixins";
  :global(span.close:hover > svg > line) {
    stroke: var(--primary-color) !important;
  }
  div.toggles {
    width: 100%;

    @include flex-column;
    align-items: flex-end;

    & > div {
      padding-left: 15px;
      padding-right: 15px;
      margin-block-end: 5px;

      @include flex-right-horiz;
      align-items: center;

      & > b {
        margin: 8px;
      }
    }
  }
  div.close {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;

    z-index: 4;

    display: none;
    backdrop-filter: blur(3px);
    cursor: pointer;
    background-color: #0000008f;

    &.show {
      display: block;
    }
  }
  h1 {
    margin-block-end: 0;
    font-size: 15pt;
    @include flex-between-row;

    & > span {
      cursor: pointer;
      margin-right: 15px;
    }
  }
  nav {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;

    padding-left: 15px;

    display: none;
    min-width: 270px;
    max-width: 400px;
    width: calc(100vw - 30px);
    height: 100vh;
    z-index: 5;

    background-color: var(--background-color);

    @include border-right-radius(16px);

    &.show {
      @include flex-left-column;
    }
    animation: back-in-left 0.4s;
    animation-timing-function: cubic-bezier(0.3, 0.17, 0.23, 0.96);
  }
  span {
    cursor: pointer;
  }
</style>
