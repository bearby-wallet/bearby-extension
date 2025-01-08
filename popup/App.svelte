<script lang="ts">
  import type { Instance } from "@mateothegreat/svelte5-router";
  import { Router } from "@mateothegreat/svelte5-router";
  import { onMount } from "svelte";

  import { setupI18n } from "popup/i18n";
  import routes from "./routers";
  import { routerGuard } from "./routers/guard"
  import settingsStore from "popup/store/settings";
  import { Locales } from "config/locale";
  import LockPage from './pages/Lock.svelte';

  let instance = $state<Instance>();
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
  <LockPage />
{/if}
<Router 
  bind:instance
  {routes}
  pre={routerGuard}
/>

<style lang="scss">
  @import "./styles/general";
</style>
