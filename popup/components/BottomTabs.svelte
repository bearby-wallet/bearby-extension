<script lang="ts">
  import type { Instance } from "@mateothegreat/svelte5-router";
  import { route, Router } from "@mateothegreat/svelte5-router";

  import GearIcon from './icons/GearIcon.svelte';
  import HomeIcon from './icons/HomeIcon.svelte';
  import TimerIcon from './icons/TimerIcon.svelte';

  let instance = $state<Instance>();

  const links = {
    home: '/',
    settings: '/settings',
    history: '/history'
  };
</script>

<nav>
  <a
    href={links.home}
    use:route
  >
    <HomeIcon selected={instance?.current.path === links.home}/>
  </a>
  <a
    href={links.history}
    use:route
  >
    <TimerIcon selected={instance?.current.path === links.history}/>
  </a>
  <a
    href={links.settings}
    use:route
  >
    <GearIcon selected={instance?.current.path === links.settings}/>
  </a>
</nav>

<style lang="scss">
  @import "../styles/mixins";
  nav {
    max-width: 320px;
    height: 50px;
    width: 100%;
    background-color: var(--card-color);
    z-index: 2;

    box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;

    justify-content: space-around;
    @include flex-center-vert;

    @media screen and (min-width: 400px) {
      @include border-top-radius(16px);
    }
  }
</style>
