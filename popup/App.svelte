<script lang="ts">
  import { onMount } from "svelte";

  import { setupI18n } from "popup/i18n";
  import settingsStore from "popup/store/settings";
  import { Locales } from "config/locale";
  import Router from './Router.svelte';

  let loading = $state(true);;

  onMount(async () => {
    const { locale } = $settingsStore;
    try {
      if (locale === Locales.Auto) {
        await setupI18n();
      } else {
        await setupI18n({
          withLocale: locale,
        });
      }
      loading = false;
    } catch (err) {
      console.error(err);
      await setupI18n({
        withLocale: Locales.EN,
      });
    }
  });
</script>

{#if !loading}
  <Router />
{/if}

<style lang="scss">
  @import "./styles/general";
</style>
