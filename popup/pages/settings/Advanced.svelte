<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { _ } from 'popup/i18n';

	import { setGasConfig, setLockTimer, togglePopupEnabled } from 'popup/backend/settings';

	import gasStore from 'popup/store/gas';
	import lockTimerStore from 'app/store/lock-timer';
	import settingsStore from 'popup/store/settings';

	import NavClose from '../../components/NavClose.svelte';
	import GasControl from '../../components/GasControl.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';
	import Toggle from '../../components/Toggle.svelte';

	let time = $lockTimerStore;

	const handleOnChangeGasMultiplier = async ({ detail }) => {
		await setGasConfig({
			...$gasStore,
			multiplier: detail
		});
	};
	const handleBlurLockTimer = async (_) => {
		if (time !== $lockTimerStore) {
			const t = Math.round(time)
			await setLockTimer(Math.abs(t));
		}
  };
	const handleOnChangePromt = async () => {
		await togglePopupEnabled();
	};
</script>

<main>
	<NavClose title={$_('advanced.title')}/>
	<div>
		<Jumbotron
			title={$_('advanced.gas.title')}
			description={$_('advanced.gas.description')}
		>
			<GasControl
				multiplier={$gasStore.multiplier}
				gasLimit={$gasStore.gasLimit}
				on:select={handleOnChangeGasMultiplier}
			/>
		</Jumbotron>
		<Jumbotron
			title={$_('advanced.time.title')}
		>
			<div>
				<input
					bind:value={time}
					type="number"
					step="1"
					min="1"
					max="24"
					on:blur={handleBlurLockTimer}
				/>
			</div>
		</Jumbotron>
		<Jumbotron
			title={$_('advanced.popup.title')}
			description={$_('advanced.popup.description')}
		>
			<div class="right">
				<Toggle
					checked={$settingsStore.popup}
					on:toggle={handleOnChangePromt}
				/>
			</div>
		</Jumbotron>
	</div>
</main>

<style lang="scss">
	@import "../../styles/mixins";

	main {
		height: 100vh;
    overflow-y: scroll;
		@include flex-center-top-column;
	}
	input {
		width: 100%;
		border-color: var(--muted-color);

		&:focus {
			border-color: var(--text-color);
		}
	}
</style>
