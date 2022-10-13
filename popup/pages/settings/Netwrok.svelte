<script lang="ts">
  import type { NetwrokConfig } from 'types/index';

	import { _ } from 'popup/i18n';
	import { onMount } from 'svelte';

  import { NETWORK_KEYS } from 'config/network';
  import { COUNT_NODES } from 'config/common';

	import NavClose from '../../components/NavClose.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';
  import Toggle from '../../components/Toggle.svelte';

  import netwrokStore from 'popup/store/netwrok';
  import settingsStore from 'popup/store/settings';

  import {
    selectNetwrok,
    getNetworkConfig,
    updateCount,
    addNodeAPI,
    sortNodes,
    removeNode
  } from 'popup/backend/netwrok';
  import { setDowngradeNodeFlag } from 'popup/backend/settings';

  const [,, custom] = NETWORK_KEYS;

  let nodeURL = '';
  let networkConfig: NetwrokConfig;
  let periodOffset = $settingsStore.periodOffset;

  async function handleOnSelectNet(event: Event) {
    const net = (event.target as HTMLInputElement).value;

    await selectNetwrok(net);
  }

  async function handleSortNodes(event: Event) {
    const http = (event.target as HTMLInputElement).value;
    await sortNodes(http);
  }

  async function handleInputCount(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const count = Number(value);

    try {
      if (count > networkConfig[$netwrokStore].PROVIDERS.length) {
        networkConfig[$netwrokStore].LIMIT = networkConfig[$netwrokStore].PROVIDERS.length;
      } else if (count <= 0) {
        networkConfig[$netwrokStore].LIMIT = COUNT_NODES;
      } else {
        networkConfig[$netwrokStore].LIMIT = count;
      }
      await updateCount(networkConfig[$netwrokStore].LIMIT);
    } catch {
      networkConfig[$netwrokStore].LIMIT = COUNT_NODES;
      await updateCount(COUNT_NODES);
    }
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
    const [node] = networkConfig[$netwrokStore].PROVIDERS;
    
    await removeNode(node);

    networkConfig = await getNetworkConfig();
  }

  async function toggleDowngrade() {
    await setDowngradeNodeFlag(!$settingsStore.downgradeNode);
  }

  onMount(async() => {
    networkConfig = await getNetworkConfig();
  });
</script>

<main>
  <NavClose title={$_('netwrok.title')} />
  <div>
    <Jumbotron
			title={$_('netwrok.selected.title')}
			description={$_('netwrok.selected.description')}
		>
			<select on:input={handleOnSelectNet}>
				{#each NETWORK_KEYS as net}
					<option
						value={net}
						selected={net === $netwrokStore}
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
        title={$_('netwrok.config.title')}
        description={$_('netwrok.config.description')}
      >
        <select on:input={handleSortNodes}>
          {#each networkConfig[$netwrokStore].PROVIDERS as http}
            <option value={http}>
              {http}
            </option>
          {/each}
        </select>
        {#if $netwrokStore === custom && networkConfig[$netwrokStore].PROVIDERS.length > 1}
          <button
            class="outline"
            on:mousedown={handleRemoveNode}
          >
            {$_('netwrok.config.remove')}
          </button>
        {/if}
        {#if $netwrokStore === custom}
          <form
            class="input"
            on:submit={handleAddNode}
          >
            <label>
              <input
                bind:value={nodeURL}
                type="url"
                placeholder={$_('netwrok.config.add_placeholder')}
              >
            </label>
          </form>
        {/if}
        <div class="input">
          <label>
            <input
              bind:value={networkConfig[$netwrokStore].LIMIT}
              type="number"
              max={networkConfig[$netwrokStore].PROVIDERS.length}
              min={1}
              on:input={handleInputCount}
            >
            <p>
              {$_('netwrok.config.count_description')}
            </p>
          </label>
        </div>
      </Jumbotron>
    </div>
  {/if}
  <div>
    <Jumbotron
      title={$_('netwrok.downgrade.title')}
      description={$_('netwrok.downgrade.description')}
    >
      <div class="toggle">
        <b>
          {$_('netwrok.downgrade.toggle')}
        </b>
        <Toggle
          checked={$settingsStore.downgradeNode}
          on:toggle={toggleDowngrade}
        />
      </div>
    </Jumbotron>
  </div>
  <div>
    <Jumbotron
			title={$_('netwrok.period.title')}
			description={$_('netwrok.period.description')}
		>
      <div class="input">
        <label>
          <input
            bind:value={periodOffset}
            type="number"
            min={1}
            on:input={handleInputCount}
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

      & > p {
        @include fluid-text(1024px, 8pt, 10pt);
        margin: 0;
        margin-left: 8px;
      }
    }
  }
</style>
