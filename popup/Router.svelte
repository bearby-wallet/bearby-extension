<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { routes, type Route } from './routers';
    import { RouteGuard } from './routers/guard';

    import type { SvelteComponent } from "svelte";


    let currentComponent = $state<typeof  SvelteComponent | null>(null);

    function findRoute(path: string): Route | undefined {
        return routes.find(route => {
            const pattern = new RegExp(`^${route.path}$`);
            return pattern.test(path);
        });
    }

    async function handleRouteChange() {
        const path = window.location.hash.slice(1) || '/';
        const route = findRoute(path);

        if (route) {
            const guardedRoute = await RouteGuard.checkRoute(route);
            currentComponent = guardedRoute.component;
        } else {
            window.location.hash = '/';
        }
    }

    onMount(() => {
        window.addEventListener('hashchange', handleRouteChange);
        handleRouteChange();
    });

    onDestroy(() => {
        window.removeEventListener('hashchange', handleRouteChange);
    });
</script>

{#if currentComponent}
    <svelte:component this={currentComponent} />
{/if}
