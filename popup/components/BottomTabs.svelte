<script lang="ts">
  import { route, getCurrentRoute } from "popup/routers/navigation";

  import GearIcon from './icons/GearIcon.svelte';
  import HomeIcon from './icons/HomeIcon.svelte';
  import TimerIcon from './icons/TimerIcon.svelte';

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
    <HomeIcon selected={getCurrentRoute() === links.home}/>
  </a>
  <a
    href={links.history}
    use:route
  >
    <TimerIcon selected={getCurrentRoute() === links.history}/>
  </a>
  <a
    href={links.settings}
    use:route
  >
    <GearIcon selected={getCurrentRoute() === links.settings}/>
  </a>
</nav>

<style lang="scss">
  @use '../styles/mixins' as mix;
  nav {
    max-width: 320px;
    height: 50px;
    width: 100%;
    background-color: var(--card-color);
    z-index: 2;

    box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;

    justify-content: space-around;
    @include mix.flex-center-vert;

    @media screen and (min-width: 400px) {
      @include mix.border-top-radius(16px);
    }
  }
</style>
