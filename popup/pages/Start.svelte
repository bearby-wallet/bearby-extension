<script lang="ts">
	import { _ } from 'popup/i18n';
	import { route } from 'popup/routers/navigation';
</script>

<main>
	<img
		src="/imgs/logo.webp"
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
			use:route
			class="btn outline"
		>
			{$_('start.btn_restore')}
		</a>
		<a
			href="/create"
			use:route
			class="btn primary"
		>
			{$_('start.btn_create')}
		</a>
	</div>
</main>

<style lang="scss">
	@use '../styles/mixins' as mix;

	img {
	 & {
	   max-width: 500px;
	   width: calc(100vw - 0px);
	 }
	}

	h1 {
	 & {
	   color: var(--text-color);
	   margin-block-end: 0;
	 }
	 @include mix.fluid-text(600px, 20pt, 40pt);
	}

	h3 {
	 & {
	   color: var(--text-color);
	 }
	 @include mix.fluid-text(600px, 14pt, 20pt);
	}

	main {
	 & {
	   background: inherit;
	   height: 100vh;
	 }

	 @include mix.flex-center-column;

	 & > div {
	   & {
	     width: 100%;
	     max-width: 290px;
	   }
   
	   @include mix.flex-between-row;

	   a {
	     & {
	       margin: 10px;
	     }
	   }
	 }
	}
</style>
