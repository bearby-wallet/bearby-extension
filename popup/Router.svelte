<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { matchRoute, notFoundRoute, parseUrlParams, routes  } from './routers';
    import { RouteGuard } from './routers/guard';
    import { currentParams, currentRoute } from "popup/store/route";
    import { push } from './routers/navigation';

    export function findRouteByHash(hash: string) {
        const path = hash.replace('#', '').replace(/^\//, '/');
        const found = matchRoute(path, routes);

        if (found) {
            return found;
        }

        return notFoundRoute;
    }

    async function handleRouteChange() {
        const path = window.location.hash.slice(1) || '/';
        const route = findRouteByHash(path);
        const params = parseUrlParams(route.path, path);

        currentParams.set(params);

        if (route) {
            const guardedRoute = await RouteGuard.checkRoute(route);
            currentRoute.set(guardedRoute);
        } else {
            currentRoute.set(notFoundRoute);
        }
    }

    onMount(() => {
        const handleNavigate = (event: CustomEvent) => {
            push(event.detail.path);
        };

        window.addEventListener('hashchange', handleRouteChange);
        handleRouteChange();
    });
    
    onDestroy(() => {
        window.removeEventListener('hashchange', handleRouteChange);
    });
</script>

{#if $currentRoute}
    <svelte:component this={$currentRoute.component} {...$currentParams}/>
{/if}

