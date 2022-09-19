<script lang="ts">
	import { _ } from 'popup/i18n';
	import { onMount } from 'svelte';

  import { NETWORK_KEYS } from 'config/network';
  import { COUNT_NODES } from 'config/common';

	import NavClose from '../../components/NavClose.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';

  import netwrokStore from 'popup/store/netwrok';
  import settingsStore from 'popup/store/settings';

  import { selectNetwrok, getNetworkConfig } from 'popup/backend/netwrok';

  let networkState;
  let periodOffset = $settingsStore.periodOffset;

  async function handleOnSelectNet(event) {
    const net = String(event.target.value);

    await selectNetwrok(net);
  }

  async function handleSortHttps(event) {
    const http = String(event.target.value);

    console.log(http);
  }

  async function handleInputCount(event) {
    const count = Number(event.target.value);

    if (count > networkState.config[$netwrokStore].PROVIDERS.length) {
      networkState.count = networkState.config[$netwrokStore].PROVIDERS.length;
    } else if (count <= 0) {
      networkState.count = COUNT_NODES;
    } else {
      networkState.count = count;
    }
  }  

  onMount(async() => {
    networkState = await getNetworkConfig();
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
  {#if networkState}
    <div>
      <Jumbotron
        title={$_('netwrok.config.title')}
        description={$_('netwrok.config.description')}
      >
        <select on:input={handleSortHttps}>
          {#each networkState.config[$netwrokStore].PROVIDERS as http}
            <option value={http}>
              {http}
            </option>
          {/each}
        </select>
        <div class="count">
          <label>
            <input
              bind:value={networkState.count}
              type="number"
              max={networkState.config[$netwrokStore].PROVIDERS.length}
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
      <div class="count">
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
  div.count {
    margin-block-start: 10px;
    margin-block-end: 10px;

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
