<script lang="ts">
	import { link } from 'svelte-spa-router';
	import { fly } from 'svelte/transition';
	import { _ } from 'popup/i18n';

</script>

<main>
	<img
		src="/imgs/logo.png"
		alt="logo"
	>
	<h1>
		{$_('start.title')}
	</h1>
	<h3>
		{$_('start.subt_title')}
	</h3>
	<div>
		<a
			href="/restore"
			use:link
			class="btn secondary"
		>
			{$_('start.btn_restore')}
		</a>
		<a
			href="/create"
			use:link
			class="btn primary"
		>
			{$_('start.btn_create')}
		</a>
	</div>
</main>

<style lang="scss">
	@import "../styles/mixins";

	img {
		max-width: 500px;
    width: calc(100vw - 90px);
	}

	h1 {
		color: var(--text-color);
		@include fluid-font(320px, 1024px, 22px, 55px);
	}

	h3 {
		color: var(--text-color);
		@include fluid-font(320px, 1024px, 16px, 30px);
	}

	main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-column;

		& > div {
			@include flex-between-row;
			width: 100%;
			max-width: 290px;

			a {
				margin: 10px;
			}
		}
	}
</style>
