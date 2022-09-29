<script lang="ts">
  import { NETWORK_KEYS } from 'config/network';

  import { link, location, push } from 'svelte-spa-router';
  import { createEventDispatcher } from 'svelte';

  import { logout } from 'popup/backend/wallet';

  import { linksExpand, openTab } from 'popup/mixins/link';

  // import Refresh from './icons/Refresh.svelte';
  // import ExpandIcon from './icons/Expand.svelte';
  // import ViewIcon from './icons/View.svelte';
  // import LockIcon from './icons/Lock.svelte';

	// import walletStore from 'popup/store/wallet';
  // import netStore from 'popup/store/netwrok';

  const dispatch = createEventDispatcher();

  export let refresh = false;
  export let expand = true;
  export let view = false;
  export let lock = false;

  // $: account = $walletStore.identities[$walletStore.selectedAddress];
  // $: isMainnet = $netStore.selected === NETWORK_KEYS[0];

  const onRefresh = () => {
    dispatch('refresh');
  };
  const viewOnViewBlock = () => {
    // const url = viewAddress(account.bech32, $netStore.selected);
    // openTab(url);
  };
  const handleOnLock = async () => {
    await logout();
    push('/lock');
  };
</script>

<nav>
  <a
    class="network"
    class:mainnet={false}
    href="/network"
    use:link
  >
    <span />
  </a>
  <div class="icons-warp">
    <!-- {#if expand}
      <span
        class="expand"
        on:click={() => linksExpand($location)}
      >
        <ExpandIcon className="icon" />
      </span>
    {/if} -->
    <!-- {#if refresh}
      <span
        class="refresh"
        on:click={onRefresh}
      >
        <Refresh className="icon" />
      </span>
    {/if}
    {#if view}
      <span
        class="view"
        on:click={viewOnViewBlock}
      >
        <ViewIcon className="icon-view" />
      </span>
    {/if}
    {#if lock}
      <span
        class="lock"
        on:click={handleOnLock}
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

    @include flex-between-row;

    @media screen and (min-width: 899px) {
      @include border-bottom-radius(16px);
    }
  }
  a.network {
    height: 15px;
    width: 15px;

    margin: 11px;

    border-radius: 100%;
    background-color: var(--warning-color);

    &.mainnet {
      background-color: var(--primary-color);
    }
  }
  .icons-warp {
    text-align: end;
    width: 200px;
  }
</style>
