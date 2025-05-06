<script lang="ts">
	import { _ }	 from 'popup/i18n';
	import { route } from 'popup/routers/navigation';
</script>

<main>
	<img src="/imgs/logo.webp" alt="logo" class="logo" />
	<h1>{$_('start.title')}</h1>
	<h3>{$_('start.subt_title')}</h3>
	<div class="button-group">
		<a href="/restore" use:route class="btn outline">{$_('start.btn_restore')}</a>
		<a href="/create" use:route class="btn primary">{$_('start.btn_create')}</a>
	</div>
</main>

<style lang="scss">
	@use '../styles/mixins' as mix;

	:global(body) {
		margin: 0;
		padding: 0;
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: #1a1a2e;
		padding: 20px;
	}

	.logo {
		max-width: 200px;
		width: 100%;
		margin-bottom: 1rem;
	}

	h1 {
		color: white;
		margin: 0;
		@include mix.fluid-text(600px, 24pt, 36pt);
		text-align: center;
	}

	h3 {
		color: white;
		@include mix.fluid-text(600px, 16pt, 20pt);
		text-align: center;
		margin: 0.5rem 0 2rem;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		width: 100%;
		max-width: 300px;
		justify-content: center;
	}

	.outline {
		border: 1px solid white;
		color: white;
		&:hover {
			background: white;
			color: #1a1a2e;
		}
	}

	.primary {
		background: #007bff;
		color: white;
		&:hover {
			background: darken(#007bff, 10%);
		}
	}

	@media (max-width: 600px) {
		.button-group {
			flex-direction: column;
			gap: 0.5rem;
		}

		.btn {
			width: 100%;
		}
	}
</style>
