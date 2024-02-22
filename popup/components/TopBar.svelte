<script lang="ts">
  import { NETWORK_KEYS } from "config/network";

	import { createEventDispatcher } from 'svelte';

  import { link, location, push } from "svelte-spa-router";

  import { linksExpand, openTab } from "popup/mixins/link";
  import { Massa } from "lib/explorer";

  import ExpandIcon from "./icons/Expand.svelte";
  import LockIcon from "./icons/Lock.svelte";
  import ConnectedIcon from "./icons/Connected.svelte";
  import DisconnectedIcon from "./icons/Disconnected.svelte";
  import ViewIcon from "./icons/View.svelte";

  import { logout } from "app/backend/wallet";

  import networkStore from "popup/store/network";
  import walletStore from "popup/store/wallet";
  import connectionStore from "app/store/connection";


	const dispatch = createEventDispatcher();

  export let expand = true;
  export let view = false;
  export let lock = true;
  export let conn = false;

  $: account = $walletStore.identities[$walletStore.selectedAddress];
  $: isMainnet = $networkStore === NETWORK_KEYS[0];

  const onShowConnections = () => {
    dispatch('connections');
  };
  const viewOnViewBlock = () => {
    const url = new Massa().setNetwork($networkStore).address(account.base58);
    openTab(url);
  };
  const handleLogout = async () => {
    await logout();
    push("/lock");
  };
</script>

<nav>
  <div class="grid-container">
    <div class="left">
      <a class="network" class:mainnet={isMainnet} href="/network" use:link>
        <span />
      </a>
      {#if view}
        <span class="view-btn" on:mouseup={viewOnViewBlock}>
          <ViewIcon className="icon-view" />
        </span>
      {/if}
    </div>
    <div class="center">
      {#if conn && $connectionStore.domain}
        <div
          class="connections"
          on:mouseup={onShowConnections}
        >
          {#if $connectionStore.accounts.some((c) => c == $walletStore.selectedAddress)}
            <ConnectedIcon className="connected-icon" width="40" height="10" />
          {:else}
            <!-- else content here -->
            <DisconnectedIcon className="connected-icon" width="40" height="10" />
          {/if}
          <p>
            {$connectionStore.domain}
          </p>
        </div>
      {/if}
    </div>
    <div class="right">
      {#if lock}
        <span class="lock" on:mouseup={handleLogout}>
          <LockIcon className="icon-lock" />
        </span>
      {/if}
      {#if expand}
        <span class="expand" on:mouseup={() => linksExpand($location)}>
          <ExpandIcon className="icon" />
        </span>
      {/if}
    </div>
  </div>
</nav>

<style lang="scss">
  @import "../styles/mixins";
  nav {
    max-width: 900px;
    height: 36px;
    width: 100%;
    background-color: var(--card-color);
    z-index: 2;

    box-shadow:
      rgb(0 0 0 / 1%) 0px 0px 1px,
      rgb(0 0 0 / 4%) 0px 4px 8px,
      rgb(0 0 0 / 4%) 0px 16px 24px,
      rgb(0 0 0 / 1%) 0px 24px 32px;

    @include flex-between-row;

    @media screen and (min-width: 899px) {
      @include border-bottom-radius(16px);
    }
  }
  div.connections {
    cursor: pointer;
    width: 100pt;
    border: solid 1pt var(--primary-color);
    border-radius: 8pt;
    margin: 10pt;
    height: 19pt;
    padding-left: 5pt;
    padding-right: 5pt;

    @include flex-between-row;

    & > p {
      text-indent: 3pt;
      width: 100pt;

      @include text-shorten;
    }

    &:hover {
      border: solid 1pt var(--secondary-color);

      :global(svg.connected-icon > path) {
        fill: var(--secondary-color);
      }
    }
  }
  span.view-btn {
    cursor: pointer;
    height: 25px;

    &:hover {
      :global(svg.icon-view > *) {
        stroke: var(--primary-color);
      }
    }
  }
  a.network {
    display: inline-block;
    height: 15px;
    width: 15px;

    border-radius: 100%;
    background-color: var(--warning-color);

    &.mainnet {
      background-color: var(--success-color);
    }
  }
  span {
    cursor: pointer;

    :global(svg.icon > path) {
      fill: var(--muted-color);
    }

    &.expand {
      margin-right: 16px;
    }

    &:hover {
      :global(svg.icon-view > circle) {
        stroke: var(--primary-color);
      }
      :global(svg.icon-lock > path) {
        stroke: var(--primary-color);
      }
      :global(svg.icon > path) {
        fill: var(--primary-color);
      }
    }
  }

  .grid-container {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 10px;
    align-items: center;
    width: 100%;
  }

  .center,
  .left,
  .right {
    display: flex;
    align-items: center;
    justify-content: center;

    & > * {
      margin: 5pt;
    }
  }
</style>
