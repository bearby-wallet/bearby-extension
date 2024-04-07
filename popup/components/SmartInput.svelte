<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Big from "big.js";

	import settingsStore from "popup/store/settings";

	import { formatNumber } from "popup/filters/numbers";
	import { uuidv4 } from "lib/crypto/uuid";

	import TokenImage from "../components/TokenImage.svelte";

	Big.PE = 99;

	const dispatch = createEventDispatcher();
	const uuid = uuidv4();

	export let percents = [0, 10, 30, 50, 70, 100];
	export let disabled = false;
	export let loading = false;
	export let converted = 0;
	export let placeholder = "";
	export let max: string | number | Big = 0;
	export let img: string;
	export let symbol: string;
	export let value: string | Big;

	let inputEl: HTMLInputElement | undefined;

	const onClick = () => {
		dispatch("select");
	};
	const onInput = (e: Event) => {
		const target = e.target as HTMLInputElement;

		if (target.value.endsWith(".")) {
			return;
		}

		const newValue = Number(target.value);

		if (isNaN(newValue)) {
			return;
		}

		if (inputEl) {
			inputEl.value = String(newValue);
			value = String(newValue);
		}

		dispatch("input", newValue);
	};
	const onPercentInput = (n: number) => {
		try {
			const _max = Big(max);
			const _n = Big(n);
			const _100 = Big(100);
			const newValue = _max.mul(_n).div(_100);

			dispatch("input", newValue.toString());
		} catch (err) {
			console.log(err);
		}
	};
</script>

<label class:loading for={uuid}>
	<span on:mouseup={onClick}>
		<TokenImage src={img} alt="input-token" width={28} height={28} />
		<h3>
			{symbol}
		</h3>
	</span>
	<div class="column">
		<input
			bind:value
			bind:this={inputEl}
			id={uuid}
			{placeholder}
			disabled={loading || disabled}
			on:input={onInput}
		/>
		<div>
			{#if converted}
				<b>{formatNumber(converted, $settingsStore.currency)}</b>
			{/if}
			{#each percents as percent}
				<p on:mouseup={() => onPercentInput(percent)}>{percent}%</p>
			{/each}
		</div>
	</div>
</label>

<style lang="scss">
	@import "../styles/mixins";

	label {
		display: flex;
		align-items: center;

		background-color: var(--card-color);
		border: solid 1px var(--card-color);
		width: 100%;

		@include border-radius(16px);

		&.loading {
			border: solid 1px transparent;
			@include loading-gradient(var(--loading-color), var(--card-color));

			& > span {
				cursor: inherit;
			}
		}

		& > span {
			cursor: pointer;
			padding-left: 8px;
			padding-right: 8px;
			height: 80%;
			min-width: 80px;
			border-right: 1px solid var(--muted-color);

			@include flex-between-row;

			& > h3 {
				font-size: 10px;
				padding-left: 2px;
				padding-right: 2px;
			}
		}
		& > div.column {
			padding: 5px;
			width: 100%;

			& > input {
				width: 100%;
				height: auto;
				font-size: 14px;
				padding: 0;
				border-color: var(--card-color);
				background: transparent;

				&:disabled {
					cursor: inherit;
					background: transparent;
					border-color: transparent;
				}
			}
			& > div {
				display: flex;
				justify-content: flex-end;
				align-items: center;
				min-height: 27px;

				& > b {
					width: 100%;
					text-indent: 5px;
				}

				& > p {
					cursor: pointer;
					margin: 0;
					margin: 5px;
					font-size: 12px;

					&:hover {
						color: var(--text-color);
					}
				}
			}
		}

		&:focus-within {
			border: solid 1px var(--muted-color);
		}
	}
</style>
