<script lang="ts">
  import { NETWORK_KEYS } from 'config/network';

  import { link, location, push } from 'svelte-spa-router';
  import { createEventDispatcher } from 'svelte';

  // import { logout } from 'popup/backend/wallet';

  import { linksExpand } from 'popup/mixins/link';
  import networkStore from 'popup/store/network';

  // import Refresh from './icons/Refresh.svelte';
  import ExpandIcon from './icons/Expand.svelte';
  // import ViewIcon from './icons/View.svelte';
  // import LockIcon from './icons/Lock.svelte';

	// import walletStore from 'popup/store/wallet';
  // import netStore from 'popup/store/network';

  const dispatch = createEventDispatcher();

  // export let refresh = false;
  export let expand = true;
  // export let view = false;
  // export let lock = false;

  // $: account = $walletStore.identities[$walletStore.selectedAddress];
  $: isMainnet = $networkStore === NETWORK_KEYS[0];

  // const onRefresh = () => {
  //   dispatch('refresh');
  // };
  // const viewOnViewBlock = () => {
  //   // const url = viewAddress(account.bech32, $netStore.selected);
  //   // openTab(url);
  // };
  // const handleOnLock = async () => {
  //   await logout();
  //   push('/lock');
  // };
</script>

<nav>
  <a
    class="network"
    class:mainnet={isMainnet}
    href="/network"
    use:link
  >
    <span />
  </a>
  <div class="icons-warp">
    {#if expand}
      <span
        class="expand"
        on:mouseup={() => linksExpand($location)}
      >
        <ExpandIcon className="icon" />
      </span>
    {/if}
    <!-- {#if refresh}
      <span
        class="refresh"
        on:mouseup={onRefresh}
      >
        <Refresh className="icon" />
      </span>
    {/if}
    {#if view}
      <span
        class="view"
        on:mouseup={viewOnViewBlock}
      >
        <ViewIcon className="icon-view" />
      </span>
    {/if}
    {#if lock}
      <span
        class="lock"
        on:mouseup={handleOnLock}
      >
        <LockIcon className="icon-lock" />
      </span>
    {/if} -->
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

    box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;

    @include flex-between-row;

    @media screen and (min-width: 899px) {
      @include border-bottom-radius(16px);
    }
  }
  a.network {
    height: 15px;
    width: 15px;

    margin: 11px;
    margin-left: 16px;

    border-radius: 100%;
    background-color: var(--warning-color);

    &.mainnet {
      background-color: var(--success-color);
    }
  }
  .icons-warp {
    text-align: end;
    width: 200px;
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
      :global(svg.icon-view > line) {
        stroke: var(--primary-color);
      }
      :global(svg.icon-view > path) {
        stroke: var(--primary-color);
      }
      :global(svg.icon-lock > path) {
        fill: var(--primary-color);
      }
      :global(svg.icon > path) {
        fill: var(--primary-color);
      }
    }
  }
</style>
