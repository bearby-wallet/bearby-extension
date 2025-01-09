<script lang="ts">
	import { _ } from 'popup/i18n';

	import { DEFAULT_CURRENCIES } from 'config/currencies';
	import { Themes } from 'config/theme';
	import { Locales } from 'config/locale';
	import { setupI18n } from 'popup/i18n';

	import settingsStore from 'popup/store/settings';
  import { setCurrency, setTheme, setLocale } from 'popup/backend/settings';

	import NavClose from '../../components/NavClose.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';


	const themesList = Object.values(Themes);
	const locales = Object.values(Locales);

	const hanldeChangeCurrency = async (e: Event) => {
		const currency = (e.target as HTMLInputElement).value;
		await setCurrency(currency);
	};
	const hanldeChangeTheme = async (e: Event) => {
		const theme = (e.target as HTMLInputElement).value;
		await setTheme(theme);
	};
	const hanldeChangeLocale = async (e: Event) => {
		const locale = (e.target as HTMLInputElement).value;
		await setLocale(locale);
		try {
			if (locale === Locales.Auto) {
				await setupI18n();
			} else {
				await setupI18n({
					withLocale: locale
				});
			}
		} catch {
			await setupI18n({
				withLocale: Locales.EN
			});
		}
	};
</script>

<main>
	<NavClose title={$_('general.title')}/>
	<div>
		<Jumbotron
			title={$_('general.currency.title')}
			description={$_('general.currency.description')}
		>
			<select oninput={hanldeChangeCurrency}>
				{#each DEFAULT_CURRENCIES as currency}
					<option
						value={currency}
						selected={currency === $settingsStore.currency}
					>
						{currency}
					</option>
				{/each}
			</select>
		</Jumbotron>
		<Jumbotron
			title={$_('general.theme.title')}
			description={$_('general.theme.description')}
		>
			<select oninput={hanldeChangeTheme}>
				{#each themesList as theme}
					<option
						value={theme}
						selected={theme === $settingsStore.theme}
					>
						{theme}
					</option>
				{/each}
			</select>
		</Jumbotron>
		<Jumbotron
			title={$_('general.lang.title')}
			description={$_('general.lang.description')}
		>
			<select oninput={hanldeChangeLocale}>
				{#each locales as locale}
					<option
						value={locale}
						selected={locale === $settingsStore.locale}
					>
						{locale}
					</option>
				{/each}
			</select>
		</Jumbotron>
	</div>
</main>

<style lang="scss">
	@use "../../styles/mixins";

	main {
		height: 100vh;
		@include flex-center-top-column;
	}
	select {
		text-transform: uppercase;
	}
</style>
