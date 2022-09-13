<script>
	import Router from 'svelte-spa-router';
	import { onMount } from 'svelte';

	import { setupI18n } from 'popup/i18n';
  import routes from './routers';
	
	import settingsStore from 'popup/store/settings';

	import { Locales } from 'config/locale';


	let loaded = false;

	onMount(async () => {
		const { locale } = $settingsStore;
		try {
			if (locale === Locales.Auto) {
				await setupI18n();
			} else {
				await setupI18n({
					withLocale: locale
				});
			}
		} catch (err) {
			console.error(err);
			await setupI18n({
				withLocale: Locales.EN
			});
		}

		loaded = true;
	});
</script>


{#if loaded}
	<Router  {routes} />
{/if}

<style lang="scss">
	@import "./styles/general";
</style>
