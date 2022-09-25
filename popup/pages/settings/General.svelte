<script lang="ts">
	import { _ } from 'popup/i18n';

	import { DEFAULT_CURRENCIES } from 'config/currencies';
	import { Themes } from 'config/theme';
	import { Locales } from 'config/locale';
	import { setupI18n } from 'popup/i18n';

	import settingsStore from 'popup/store/settings';
  import { setCurrency } from 'popup/backend/settings';

	import NavClose from '../../components/NavClose.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';


	const themesList = Object.values(Themes);
	const locales = Object.values(Locales);

	const hanldeChangeCurrency = async (e) => {
		const currency = e.target.value;
		await setCurrency(currency);
	};
	const hanldeChangeTheme = async (e) => {
		const theme = e.target.value;
		await changeTheme(theme);
	};
	const hanldeChangeLocale = async (e) => {
		const locale = e.target.value;
		await changeLocale(locale);
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
	const hanldeOnReset = async () => {
    console.log('hanldeOnReset');
	};
</script>

<main>
	<NavClose title={$_('general.title')}/>
	<div>
		<Jumbotron
			title={$_('general.currency.title')}
			description={$_('general.currency.description')}
		>
			<select on:input={hanldeChangeCurrency}>
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
			<select on:input={hanldeChangeTheme}>
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
			<select on:input={hanldeChangeLocale}>
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
	@import "../../styles/mixins";

	main {
		height: 100vh;
		@include flex-center-top-column;
	}
	select {
		text-transform: uppercase;
	}
	button {
		width: 290px;
	}
</style>
