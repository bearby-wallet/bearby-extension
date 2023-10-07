<script lang="ts">
  import type { NetworkConfig } from 'types/index';

	import { _ } from 'popup/i18n';
	import { onMount } from 'svelte';

  import { NETWORK_KEYS } from 'config/network';

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
  import { setAbortTimeout, setDowngradeNodeFlag, setHttpsOnly, setNumberNodes, setPeriodOffset } from 'popup/backend/settings';
  import { PERIOD_OFFSET } from 'config/common';
  import { NETWORK_INIT_STATE } from 'config/network';


  const [,,, custom] = NETWORK_KEYS;
  const SECONDS_DEMON = 1000;

  let nodeURL = '';
  let networkConfig: NetworkConfig;
  let periodOffset = $settingsStore.periodOffset;

  
  $: abortTimeout = $settingsStore.network.abortTimeout / SECONDS_DEMON;


  async function handleOnSelectNet(event: Event) {
    const net = (event.target as HTMLInputElement).value;

    await selectNetwork(net);
  }

  async function handleSortNodes(event: Event) {
    const http = (event.target as HTMLInputElement).value;
    await sortNodes(http);
  }

  async function handlePeriodOffset(event: Event) {
    const period = Number((event.target as HTMLInputElement).value);

    await setPeriodOffset(period);
  }

  async function handleAddNode(e: Event) {
    e.preventDefault();

    try {
      await addNodeAPI(nodeURL);
      networkConfig = await getNetworkConfig();
      nodeURL = '';
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRemoveNode() {
    const [node] = networkConfig[$networkStore].PROVIDERS;
    
    await removeNode(node);

    networkConfig = await getNetworkConfig();
  }

  async function toggleDowngrade() {
    await setDowngradeNodeFlag(!$settingsStore.network.downgrade);
  }

  async function toggleHttps() {
    await setHttpsOnly(!$settingsStore.network.https);
    networkConfig = await getNetworkConfig();
  }

  async function handleAbortTimeout(event: Event) {
    const abortTimeout = Number((event.target as HTMLInputElement).value);
    await setAbortTimeout(Number(abortTimeout) * SECONDS_DEMON);
  }

  async function handleNodes(event: Event) {
    const nodes = Number((event.target as HTMLInputElement).value);
    await setNumberNodes(Number(nodes));
  }

  async function resetConfigNodes() {
    networkConfig = await resetNetworkConfig();
  }

  onMount(async() => {
    networkConfig = await getNetworkConfig();
  });
</script>

<main>
  <NavClose title={$_('network.title')} />
  <div>
    <Jumbotron
			title={$_('network.selected.title')}
			description={$_('network.selected.description')}
		>
			<select on:input={handleOnSelectNet}>
				{#each NETWORK_KEYS as net}
					<option
            disabled={net === 'mainnet'}
						value={net}
						selected={net === $networkStore}
					>
						{net}
					</option>
				{/each}
			</select>
		</Jumbotron>
  </div>
  {#if networkConfig}
    <div>
      <Jumbotron
        title={$_('network.config.title')}
        description={$_('network.config.description')}
      >
        <p
          class="reset"
          on:mouseup={resetConfigNodes}
        >
          {$_('network.config.reset')}
        </p>
        <select on:input={handleSortNodes}>
          {#each networkConfig[$networkStore].PROVIDERS as http}
            <option value={http}>
              {http}
            </option>
          {/each}
        </select>
        {#if $networkStore === custom && networkConfig[$networkStore].PROVIDERS.length > 1}
          <button
            class="outline"
            on:mouseup={handleRemoveNode}
          >
            {$_('network.config.remove')}
          </button>
        {/if}
        {#if $networkStore === custom}
          <form
            class="input"
            on:submit={handleAddNode}
          >
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
        <b>
          {$_('network.downgrade.toggle')}
        </b>
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
        <b>
          {$_('network.https.toggle')}
        </b>
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
      <p
        class="reset"
        on:mouseup={() => setAbortTimeout(NETWORK_INIT_STATE.abortTimeout)}
      >
        {$_('network.config.reset')}
      </p>
      <div class="input">
        <label>
          <input
            value={abortTimeout}
            type="number"
            min={1}
            max={15}
            on:input={handleAbortTimeout}
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
    <p
      class="reset"
      on:mouseup={() => setNumberNodes(NETWORK_INIT_STATE.numberOfNodes)}
    >
      {$_('network.config.reset')}
    </p>
      <div class="input">
        <label>
          <input
            bind:value={$settingsStore.network.numberOfNodes}
            type="number"
            min={1}
            max={200}
            on:input={handleNodes}
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
    <p
      class="reset"
      on:mouseup={() => setPeriodOffset(PERIOD_OFFSET)}
    >
      {$_('network.config.reset')}
    </p>
      <div class="input">
        <label>
          <input
            bind:value={periodOffset}
            type="number"
            min={1}
            on:input={handlePeriodOffset}
          >
        </label>
      </div>
		</Jumbotron>
  </div>
</main>

<style lang="scss">
  @import "../../styles/mixins";
  main {
    background: inherit;
    overflow-y: scroll;
    height: 100vh;

		@include flex-center-top-column;
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
