<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { push } from 'svelte-spa-router';
	import { getState } from "popup/backend";
	import { _ } from 'popup/i18n';
	import { Formats } from 'config/formats';

	import {
		changeGasMultiplier,
		resetGas
	} from 'popup/backend/gas';
	import {
		changeLockTimer,
		changeAddressFormat,
		changePromtEnabled
	} from 'popup/backend/settings';

	import gasStore from 'popup/store/gas';
	import timeLock from 'popup/store/lock-time';
	import addressFormatStore from 'popup/store/format';
	import promtStore from 'app/store/promt';

	import NavClose from '../../components/NavClose.svelte';
	import GasControl from '../../components/GasControl.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';
	import Toggle from '../../components/Toggle.svelte';

	let base16 = $addressFormatStore === Formats.Base16;
	let time = $timeLock;

	const handleOnChangeGasMultiplier = async ({ detail }) => {
		await changeGasMultiplier(detail);
	};
	const handleBlurLockTimer = async (_) => {
		if (time !== $timeLock) {
			await tick();
			const t = Math.round(time)
			await changeLockTimer(Math.abs(t));
		}
  };
	const handleToggleAddressFormat = async () => {
		if (base16) {
			await changeAddressFormat(Formats.Bech32);
		} else {
			await changeAddressFormat(Formats.Base16);
		}
		base16 = $addressFormatStore === Formats.base16;
	};
	const handleOnChangePromt = async () => {
		await changePromtEnabled(!$promtStore);
	};
	const hanldeOnReset = async () => {
		await resetGas();
		await changeLockTimer();
		await changeAddressFormat();
		await changePromtEnabled();
		time = $timeLock;
		base16 = $addressFormatStore === Formats.Base16;
	};
</script>

<main>
	<NavClose title={'Advanced'}/>
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
					checked={$promtStore}
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
	button.warning {
		width: 290px;
		margin-block-end: 16px;
	}
</style>
