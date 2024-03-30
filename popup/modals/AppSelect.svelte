<script lang="ts">
	import type { AppConnection } from "types";

	import { _ } from "popup/i18n";
	import { createEventDispatcher } from "svelte";

	import Toggle from "../components/Toggle.svelte";

	const dispatch = createEventDispatcher();

	export let identities: AppConnection[];

	let isAll = false;
	let indexies: boolean[] = Array(identities.length).fill(false);

	function fromBool(indexies: boolean[]) {
		let res = [];

		for (let index = 0; index < indexies.length; index++) {
			const element = indexies[index];

			if (element) {
				res.push(index);
			}
		}

		return res;
	}

	const onSelectAccount = (index: number) => {
		indexies[index] = !indexies[index];

		dispatch("changed", fromBool(indexies));
	};
	const onSelectAll = () => {
		isAll = !isAll;
		indexies = Array(identities.length).fill(isAll);

		dispatch("changed", fromBool(indexies));
	};
</script>

<ul class="connections">
	<li>
		<p>
			{$_("ALL")}
		</p>
		<Toggle checked={isAll} on:toggle={onSelectAll} />
	</li>
	{#each identities as app, index}
		<li class="card" class:selected={indexies[index]}>
			<img src={app.icon} alt="icon" width="30" />
			<div>
				<div class="domain">
					{app.domain}
				</div>
				<p>
					{app.title}
				</p>
			</div>
			<span>
				<Toggle
					checked={indexies[index]}
					on:toggle={() => onSelectAccount(index)}
				/>
			</span>
		</li>
	{/each}
</ul>

<style lang="scss">
	@import "../styles/mixins";
	ul {
		padding: 0;
		margin: 0;
		overflow-y: scroll;

		width: 100%;
		max-width: 350pt;
		height: calc(100vh - 250px);

		&.connections {
			padding: 8pt;
			border: solid 1pt var(--secondary-color);

			width: calc(100vw - 15px);

			@include border-radius(16px);
		}

		& > li {
			padding-left: 10px;
			padding-right: 10px;

			@include flex-between-row;

			&.card {
				margin: 0;
				background-color: var(--card-color);
				border: solid 1px var(--card-color);
				border: solid 1px transparent;

				@include border-radius(16px);

				&.selected {
					border-color: var(--primary-color);
				}

				& > img {
					margin: 5pt;
				}

				& > div {
					cursor: pointer;
					width: 100%;
					& > div.domain {
						color: var(--text-color);
						font-size: 14pt;
						max-width: 160px;
						font-weight: 800;
						@include text-shorten;
					}
					& > p {
						line-height: 0;
						font-size: 13px;
					}
				}
			}
		}
	}
</style>
