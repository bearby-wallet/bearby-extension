import Home from '../pages/Home.svelte';
import AccountsPage from '../pages/Accounts.svelte';
import TokensPage from '../pages/tokens.svelte';
import AddSeedAccountPage from '../pages/AddAccount.svelte';
import RestorePrivateKeyPage from '../pages/KeyRestore.svelte';
import SendPage from '../pages/Send.svelte';
import SettingsPage from '../pages/Settings.svelte';
import HistoryPage from '../pages/History.svelte';
import PopupPage from '../pages/Popup.svelte';
import RollsPage from '../pages/Rolls.svelte';
import ConnectPage from '../pages/Connect.svelte';
import AddTrackAccountPage from '../pages/AddTrack.svelte';
import SignMessagePage from '../pages/SignMessage.svelte';
import NetworkPage from '../pages/settings/Network.svelte';
import AccountPage from '../pages/settings/Account.svelte';
import GeneralPage from '../pages/settings/General.svelte';
import AdvancedPage from '../pages/settings/Advanced.svelte';
import ContactsPage from '../pages/settings/Contacts.svelte';
import ConnectionsPage from '../pages/settings/Connections.svelte';
import AboutPage from '../pages/settings/About.svelte';
import SecurityPage from '../pages/settings/Security.svelte';
import LockPage from '../pages/Lock.svelte';
import StartPage from '../pages/Start.svelte';
import CreatePage from '../pages/Create.svelte';
import WordsVerifyPage from '../pages/WordsVerify.svelte';
import SetupAccountPage from '../pages/SetupAccount.svelte';
import CreateSuccessPage from '../pages/CreateSuccess.svelte';
import RestorePage from '../pages/Restore.svelte';
import PubKeyRequestPage from '../pages/PubKeyRequest.svelte';
import NotFoundPage from '../pages/NotFoundPage.svelte';

import type { Component } from 'svelte';

export interface Route {
    path: string;
    component: Component<Record<string, never>, {}, "">;
    isProtected?: boolean;
}

export const notFoundRoute: Route = { 
    path: "*", 
    component: NotFoundPage 
};

export const protectedRoutes: Route[] = [
    { path: "/", component: Home, isProtected: true },
    { path: "/add-track", component: AddTrackAccountPage, isProtected: true },
    { path: "/accounts", component: AccountsPage, isProtected: true },
    { path: "/tokens", component: TokensPage, isProtected: true },
    { path: "/confirm", component: PopupPage, isProtected: true },
    { path: "/req-pubkey", component: PubKeyRequestPage, isProtected: true },
    { path: "/history", component: HistoryPage, isProtected: true },
    { path: "/rolls", component: RollsPage, isProtected: true },
    { path: "/sign-message", component: SignMessagePage, isProtected: true },
    { path: "/account", component: AccountPage, isProtected: true },
    { path: "/connect", component: ConnectPage, isProtected: true },
    { path: "/contacts", component: ContactsPage, isProtected: true },
    { path: "/connections", component: ConnectionsPage, isProtected: true },
    { path: "/settings", component: SettingsPage, isProtected: true },
    { path: "/about", component: AboutPage, isProtected: true },
    { path: "/security", component: SecurityPage, isProtected: true },
    { path: "/general", component: GeneralPage, isProtected: true },
    { path: "/advanced", component: AdvancedPage, isProtected: true },
    { path: "/send/:index/:address?", component: SendPage, isProtected: true },
    { path: "/add", component: AddSeedAccountPage, isProtected: true },
    { path: "/import", component: RestorePrivateKeyPage, isProtected: true },
    { path: "/network", component: NetworkPage, isProtected: true }
];

export const publicRoutes: Route[] = [
    { path: "/lock", component: LockPage },
    { path: "/start", component: StartPage },
    { path: "/create", component: CreatePage },
    { path: "/verify", component: WordsVerifyPage },
    { path: "/setup-account", component: SetupAccountPage },
    { path: "/created", component: CreateSuccessPage },
    { path: "/restore", component: RestorePage }
];

export const routes  = [...protectedRoutes, ...publicRoutes];

export function matchRoute(url: string, routes: Route[]): Route | null {
    const urlParts = url.split('/').filter(Boolean);
    
    for (const route of routes) {
        const routeParts = route.path.split('/').filter(Boolean);
        
        if (!isMatchingLength(routeParts, urlParts)) {
            continue;
        }
        
        let isMatch = true;
        
        for (let i = 0; i < routeParts.length; i++) {
            const routePart = routeParts[i];
            const urlPart = urlParts[i];
            
            if (routePart.startsWith(':')) {
                const isOptional = routePart.endsWith('?');
                if (!urlPart && !isOptional) {
                    isMatch = false;
                    break;
                }
                continue;
            }
            
            if (routePart !== urlPart) {
                isMatch = false;
                break;
            }
        }
        
        if (isMatch) {
            return route;
        }
    }
    
    return null;
}

export type ParamsRecord = Record<string, never>;
export function parseUrlParams(pattern: string, url: string): ParamsRecord {
  const params: ParamsRecord = {};
  const patternParts: string[] = pattern.split('/').filter(Boolean);
  const urlParts: string[] = url.split('/').filter(Boolean);

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    
    if (!patternPart.startsWith(':')) {
      continue;
    }

    let paramName = patternPart.slice(1);
    const isOptional = paramName.endsWith('?');
    
    if (isOptional) {
      paramName = paramName.slice(0, -1);
    }

    const value = urlParts[i];
    params[paramName] = value || null;
  }

  return params;
}


function isMatchingLength(routeParts: string[], urlParts: string[]): boolean {
    const optionalParams = routeParts.filter(part => part.endsWith('?')).length;
    return urlParts.length >= routeParts.length - optionalParams && 
           urlParts.length <= routeParts.length;
}
