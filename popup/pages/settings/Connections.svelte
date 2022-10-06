<script lang="ts">
	import { onMount } from 'svelte';
	import { push } from 'svelte-spa-router';

	import { _ } from 'popup/i18n';
	import { getConnections, removeConnection } from 'popup/backend/connections';
	import { linkToDomain } from 'popup/mixins/link';

	import connectionsStore from 'popup/store/connections';

	import NavClose from '../../components/NavClose.svelte';
	import SearchBox from '../../components/SearchBox.svelte';
	import CloseIcon from '../../components/icons/Close.svelte';

	let search = '';

	$: connections = $connectionsStore.filter((acc) => {
		const s1 = String(acc.domain).toLowerCase().includes(String(search).toLowerCase());
		const s2 = String(acc.title).toLowerCase().includes(String(search).toLowerCase());
		return s1 || s2;
	});

	const onInputSearch = (e) => {
		search = e.detail;
	};
	const hanldeOnRemove = async (app) => {
		const index = $connectionsStore.findIndex(
			(a) => a.domain === app.domain
		);
		await removeConnection(index);
	};
	const hanldeOnSelect = (app) => {
		linkToDomain(app.domain);
	};

  onMount(async() => {
    await getConnections();
  });
</script>

<section>
	<main>
		<NavClose title={$_('connections.title')}/>
		<SearchBox
			placeholder={$_('accounts.placeholder')}
			focus
			on:input={onInputSearch}
		/>
		<ul>
			{#if $connectionsStore.length === 0}
				<p>
					{$_('connections.no_apps')}
				</p>
			{/if}
			{#each connections as item}
				<li class="card">
					<img
						src={item.icon}
						alt="icon"
						width="30"
						on:click={() => hanldeOnSelect(item)}
					/>
					<div on:click={() => hanldeOnSelect(item)}>
						<b>
							{item.domain}
						</b>
						<p>
							{item.title}
						</p>
					</div>
					<div
						class="icon"
						on:click={() => hanldeOnRemove(item)}
					>
						<CloseIcon className="trash-icon" />
					</div>
				</li>
			{/each}
		</ul>
	</main>
</section>

<style lang="scss">
	@import "../../styles/mixins";

	main {
		max-width: 520px;
		min-width: 300px;
		width: calc(100vw - 15px);
		height: calc(100vh - 15px);
	
		@include flex-center-top-column;
	}
	section {
		height: 100vh;
		@include flex-center-top-column;
	}
	ul {
		padding: 0;
    margin: 0;

    overflow-y: scroll;

		margin-block-start: 16px;
		height: 100%;

    & > li {
			min-width: 290px;
			height: 60px;

			background-color: var(--card-color);
			border: solid 1px var(--card-color);
			margin: 5px;

			@include flex-between-row;
			@include border-radius(16px);

			& > img {
				cursor: pointer;
				width: 30px;
				margin: 15px;
			}
			& > div {
				cursor: pointer;
				width: 100%;
				&.icon {
					margin: 15px;
					width: 30px;

					&:hover {
						:global(svg.trash-icon > path) {
              fill: var(--primary-color);
            }
					}
				}
				& > b {
					color: var(--text-color);
					font-size: 16px;
					@include text-shorten;
				}
				& > p {
					line-height: 0;
					font-size: 13px;
				}
			}

			&:hover {
				border-color: var(--primary-color);
			}
    }
	}
</style>