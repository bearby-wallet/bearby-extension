<script lang="ts">
	import { _ } from 'popup/i18n';
	import { onMount } from 'svelte';

  import { NETWORK_KEYS } from 'config/network';
  import { COUNT_NODES } from 'config/common';

	import NavClose from '../../components/NavClose.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';

  import netwrokStore from 'popup/store/netwrok';
  import settingsStore from 'popup/store/settings';

  import {
    selectNetwrok,
    getNetworkConfig,
    updateCount
  } from 'popup/backend/netwrok';

  const [mainnet, testnet, custom] = NETWORK_KEYS;

  let networkConfig;
  let periodOffset = $settingsStore.periodOffset;

  async function handleOnSelectNet(event) {
    const net = String(event.target.value);

    await selectNetwrok(net);
  }

  async function handleSortHttps(event) {
    const http = String(event.target.value);
    // var valid = /^(ftp|http|https):\/\/[^ "]+$/.test(url);
    console.log(http);
  }

  async function handleInputCount(event) {
    const count = Number(event.target.value);

    if (count > networkConfig[$netwrokStore].PROVIDERS.length) {
      networkConfig[$netwrokStore].LIMIT = networkConfig[$netwrokStore].PROVIDERS.length;
    } else if (count <= 0) {
      networkConfig[$netwrokStore].LIMIT = COUNT_NODES;
    } else {
      networkConfig[$netwrokStore].LIMIT = count;
    }

    await updateCount(networkConfig[$netwrokStore].LIMIT);
  }

  async function handleAddNode(e) {
    e.preventDefault();
  }

  async function handleRemoveNode() {
    
  }

  onMount(async() => {
    networkConfig = await getNetworkConfig();
    console.log(networkConfig[$netwrokStore]);
    
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
        <select on:input={handleSortHttps}>
          {#each networkConfig[$netwrokStore].PROVIDERS as http}
            <option value={http}>
              {http}
            </option>
          {/each}
        </select>
        {#if $netwrokStore === custom}
          <button
            class="outline"
            on:click={handleRemoveNode}
          >
            {$_('netwrok.config.remove')}
          </button>
          <form
            class="input"
            on:submit={handleAddNode}
          >
            <label>
              <input
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
  .input {
    margin-block-start: 15px;
    margin-block-end: 15px;

    & > label {
      width: 100%;

      & > p {
        @include fluid-font(320px, 1024px, 12px, 15px);
        margin: 0;
        margin-left: 8px;
      }
    }
  }
</style>
