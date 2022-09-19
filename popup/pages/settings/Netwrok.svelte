<script lang="ts">
	import { _ } from 'popup/i18n';

  import { NETWORK_KEYS } from 'config/network';

	import NavClose from '../../components/NavClose.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';

  import netwrokStore from 'popup/store/netwrok';

  import { selectNetwrok } from 'popup/backend/netwrok';


  async function handleOnSelectNet(event) {
    const net = String(event.target.value);

    await selectNetwrok(net);
  }
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
</main>

<style lang="scss">
  @import "../../styles/mixins";
  main {
    background: inherit;
    overflow-y: scroll;
    height: 100vh;

		@include flex-center-top-column;
  }
</style>
