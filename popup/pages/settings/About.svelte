<script lang="ts">
	import { _ } from 'popup/i18n';

	import { Runtime } from 'lib/runtime';

	import NavClose from '../../components/NavClose.svelte';

  const manifest = Runtime.runtime.getManifest(); 

	const links = [
		{
			name: $_('about.issues'),
			url: 'https://github.com/bearby-wallet/bearby-extension/issues'
		},
		{
			name: $_('about.tg'),
			url: 'https://t.me/bearbychat'
		}
	];
</script>

<main>
	<NavClose title={$_('about.title')}/>
  <img
		src="/imgs/logo.webp"
		alt="logo"
	>
	<h2>
		{$_('about.version')} - {manifest.version}
	</h2>
  <h2>
		{$_('about.manifest_version')} - {manifest.manifest_version}
	</h2>
	<ul>
		{#each links as link}
			<li>
				<a
					href={link.url}
					target="_blank"
				>
					{link.name}
				</a>
			</li>
		{/each}
	</ul>
</main>

<style lang="scss">
	@import "../../styles/mixins";

	main {
		height: 100vh;
		@include flex-center-top-column;
	}
	h2,
  ul {
		z-index: 99;
	}
	ul {
		margin: 0;
    padding: 0;
		z-index: 2;
    margin-top: 30px;
		& > li {
			text-align: center;
		}
		& > li > a {
			cursor: pointer;
			color: var(--text-color);
			line-height: 30px;
			font-size: 21pt;

			&:hover {
				color: var(--primary-color);
			}
		}
	}
	img {
		position: fixed;
		max-width: 900px;
		width: 130vw;
		margin: 15vh auto;
		left: auto;
		right: auto;
		top: -47px;
		opacity: 0.2;
    z-index: 1;
	}
</style>
