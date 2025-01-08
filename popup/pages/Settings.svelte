<script lang="ts">
	import { push } from 'popup/routers/navigation';
	import { _ } from 'popup/i18n';

	import BottomTabs from '../components/BottomTabs.svelte';
	import TextElement from '../components/TextElement.svelte';
	import TopBar from '../components/TopBar.svelte';


	let items = [
		{
			title: $_('settings.account.title'),
			description: $_('settings.account.description'),
			link: '/account'
		},
		{
			title: $_('settings.general.title'),
			description: $_('settings.general.description'),
			link: '/general'
		},
		{
			title: $_('settings.contacts.title'),
			description: $_('settings.contacts.description'),
			link: '/contacts'
		},
		{
			title: $_('settings.advanced.title'),
			description: $_('settings.advanced.description'),
			link: '/advanced'
		},
		{
			title: $_('settings.networks.title'),
			description: $_('settings.networks.description'),
			link: '/network'
		},
		{
			title: $_('settings.connections.title'),
			description: $_('settings.connections.description'),
			link: '/connections'
		},
		{
			title: $_('settings.security.title'),
			description: $_('settings.security.description'),
			link: '/security'
		},
		{
			title: $_('settings.about.title'),
			description: $_('settings.about.description'),
			link: '/about'
		}
	];
</script>

<section>
	<TopBar />
	<main>
		<ul>
			{#each items as item, i}
				<li on:mouseup={() => push(item.link)}>
					<TextElement
						title={item.title}
						description={item.description}
					/>
				</li>
			{/each}
		</ul>
	</main>
	<BottomTabs />
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
		@include flex-center-top-column;
	}
  section {
		height: fit-content;
		@include flex-center-top-column;
	}
	ul {
		padding: 0;
    margin: 0;
    overflow-y: scroll;

		height: calc(100vh - 86px);
		max-width: 500px;

		& > li {
			cursor: pointer;
			color: var(--text-color);
			min-width: 290px;

			@include flex-between-row;
		}
	}
</style>
