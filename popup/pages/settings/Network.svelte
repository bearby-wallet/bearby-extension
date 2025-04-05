<script lang="ts">
  import type { NetworkConfig } from 'types/index';

  import { _ } from 'popup/i18n';
  import { onMount } from 'svelte';

  import { NETWORK_KEYS } from 'config/network';
  import { PERIOD_OFFSET } from 'config/common';
  import { NETWORK_INIT_STATE } from 'config/network';

  import NavClose from '../../components/NavClose.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';
  import Toggle from '../../components/Toggle.svelte';

  import networkStore from 'popup/store/network';
  import settingsStore from 'popup/store/settings';

  import {
    selectNetwork,
    getNetworkConfig,
    addNodeAPI,
    sortNodes,
    removeNode,
    resetNetworkConfig
  } from 'popup/backend/network';
  import { 
    setAbortTimeout, 
    setChainId, 
    setDowngradeNodeFlag, 
    setHttpsOnly, 
    setNumberNodes, 
    setPeriodOffset 
  } from 'popup/backend/settings';

  const [,, custom] = NETWORK_KEYS;
  const SECONDS_DEMON = 1000;

  let nodeURL = '';
  let networkConfig: NetworkConfig;
  let periodOffset = $settingsStore.periodOffset;
  let chainID: number;

  $: abortTimeout = $settingsStore.network.abortTimeout / SECONDS_DEMON;

  const handleOnSelectNet = async (event: Event) => {
    const net = (event.target as HTMLInputElement).value;
    await selectNetwork(net);
    chainID = networkConfig[$networkStore].CHAIN_ID;
  };

  const handleSortNodes = async (event: Event) => {
    const http = (event.target as HTMLInputElement).value;
    await sortNodes(http);
  };

  const handlePeriodOffset = async (event: Event) => {
    const period = Number((event.target as HTMLInputElement).value);
    await setPeriodOffset(period);
  };

  const handleAddNode = async (e: Event) => {
    e.preventDefault();
    try {
      await addNodeAPI(nodeURL);
      networkConfig = await getNetworkConfig();
      nodeURL = '';
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveNode = async () => {
    const [node] = networkConfig[$networkStore].PROVIDERS;
    await removeNode(node);
    networkConfig = await getNetworkConfig();
  };

  const toggleDowngrade = async () => {
    await setDowngradeNodeFlag(!$settingsStore.network.downgrade);
  };

  const toggleHttps = async () => {
    await setHttpsOnly(!$settingsStore.network.https);
    networkConfig = await getNetworkConfig();
  };

  const handleAbortTimeout = async (event: Event) => {
    const timeout = Number((event.target as HTMLInputElement).value);
    await setAbortTimeout(timeout * SECONDS_DEMON);
  };

  const handleNodes = async (event: Event) => {
    const nodes = Number((event.target as HTMLInputElement).value);
    await setNumberNodes(nodes);
  };

  const resetConfigNodes = async () => {
    networkConfig = await resetNetworkConfig();
    chainID = networkConfig[$networkStore].CHAIN_ID;
  };

  const resetTimeout = () => setAbortTimeout(NETWORK_INIT_STATE.abortTimeout);
  const resetNodes = () => setNumberNodes(NETWORK_INIT_STATE.numberOfNodes);
  const resetPeriod = () => setPeriodOffset(PERIOD_OFFSET);

  onMount(async () => {
    networkConfig = await getNetworkConfig();
    chainID = networkConfig[$networkStore].CHAIN_ID;
  });
</script>

<main>
  <NavClose title={$_('network.title')} />
  <div>
    <Jumbotron
      title={$_('network.selected.title')}
      description={$_('network.selected.description')}
    >
      <select oninput={handleOnSelectNet}>
        {#each NETWORK_KEYS as net}
          <option value={net} selected={net === $networkStore}>
            {net}
          </option>
        {/each}
      </select>
      <div class="input">
        <label>
          <b>{$_('network.config.chainid')}</b>
          <input
            bind:value={chainID}
            type="number"
            disabled={$networkStore !== custom}
            oninput={() => setChainId(chainID)}
          >
        </label>
      </div>
    </Jumbotron>
  </div>

  {#if networkConfig}
    <div>
      <Jumbotron
        title={$_('network.config.title')}
        description={$_('network.config.description')}
      >
        <p class="reset" onmouseup={resetConfigNodes}>
          {$_('network.config.reset')}
        </p>
        <select oninput={handleSortNodes}>
          {#each networkConfig[$networkStore].PROVIDERS as http}
            <option value={http}>{http}</option>
          {/each}
        </select>
        {#if $networkStore === custom && networkConfig[$networkStore].PROVIDERS.length > 1}
          <button class="outline" onmouseup={handleRemoveNode}>
            {$_('network.config.remove')}
          </button>
        {/if}
        {#if $networkStore === custom}
          <form class="input" onsubmit={handleAddNode}>
            <label>
              <input
                bind:value={nodeURL}
                type="url"
                placeholder={$_('network.config.add_placeholder')}
              >
            </label>
          </form>
        {/if}
      </Jumbotron>
    </div>
  {/if}

  <div>
    <Jumbotron
      title={$_('network.downgrade.title')}
      description={$_('network.downgrade.description')}
    >
      <div class="toggle">
        <b>{$_('network.downgrade.toggle')}</b>
        <Toggle
          checked={$settingsStore.network.downgrade}
          on:toggle={toggleDowngrade}
        />
      </div>
    </Jumbotron>
  </div>

  <div>
    <Jumbotron
      title={$_('network.https.title')}
      description={$_('network.https.description')}
    >
      <div class="toggle">
        <b>{$_('network.https.toggle')}</b>
        <Toggle
          checked={$settingsStore.network.https}
          on:toggle={toggleHttps}
        />
      </div>
    </Jumbotron>
  </div>

  <div>
    <Jumbotron
      title={$_('network.timeout.title')}
      description={$_('network.timeout.description')}
    >
      <p class="reset" onmouseup={resetTimeout}>
        {$_('network.config.reset')}
      </p>
      <div class="input">
        <label>
          <input
            value={abortTimeout}
            type="number"
            min={1}
            max={15}
            oninput={handleAbortTimeout}
          >
        </label>
      </div>
    </Jumbotron>
  </div>

  <div>
    <Jumbotron
      title={$_('network.nodes.title')}
      description={$_('network.nodes.description')}
    >
      <p class="reset" onmouseup={resetNodes}>
        {$_('network.config.reset')}
      </p>
      <div class="input">
        <label>
          <input
            bind:value={$settingsStore.network.numberOfNodes}
            type="number"
            min={1}
            max={200}
            oninput={handleNodes}
          >
        </label>
      </div>
    </Jumbotron>
  </div>

  <div>
    <Jumbotron
      title={$_('network.period.title')}
      description={$_('network.period.description')}
    >
      <p class="reset" onmouseup={resetPeriod}>
        {$_('network.config.reset')}
      </p>
      <div class="input">
        <label>
          <input
            bind:value={periodOffset}
            type="number"
            min={1}
            oninput={handlePeriodOffset}
          >
        </label>
      </div>
    </Jumbotron>
  </div>
</main>

<style lang="scss">
  @use "../../styles/mixins" as mix;
  
  main {
    background: inherit;
    overflow-y: scroll;
    height: 100vh;
    @include mix.flex-center-top-column;
  }
  
  button {
    margin-block-start: 5px;
    width: 100%;
  }
  
  p.reset {
    cursor: pointer;
    margin: 5px;
    color: var(--warning-color);
    
    &:hover {
      color: var(--primary-color);
    }
  }
  
  div.toggle {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    
    & > b {
      padding: 5px;
    }
  }
  
  .input {
    margin-block-start: 15px;
    margin-block-end: 15px;
    
    & > label {
      width: 100%;
    }
  }
</style>
