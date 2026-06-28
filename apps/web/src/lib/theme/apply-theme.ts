import type { ResolvedThemeMode } from "./types";
import { ADMIN_PATH_PREFIXES } from "./is-storefront-path";

const THEME_ATTR = "data-theme";

/** Apply resolved mode to `<html>` — class, attribute, color-scheme (admin only). */
export function applyThemeToDocument(mode: ResolvedThemeMode, root: HTMLElement = document.documentElement): void {
  const isDark = mode === "dark";
  root.classList.add("admin-site");
  root.classList.remove("storefront-site");
  root.classList.toggle("dark", isDark);
  root.setAttribute(THEME_ATTR, mode);
  root.style.colorScheme = mode;
  if (typeof document !== "undefined" && document.body) {
    document.body.classList.remove("storefront-site");
  }
}

/** Storefront — lock document to light (strip dark class, mark html/body). */
export function forceStorefrontLightTheme(root: HTMLElement = document.documentElement): void {
  root.classList.remove("dark", "admin-site");
  root.classList.add("storefront-site");
  root.setAttribute(THEME_ATTR, "light");
  root.style.colorScheme = "light";
  if (typeof document !== "undefined" && document.body) {
    document.body.classList.add("storefront-site");
  }
}

export function clearStorefrontSiteMarkers(root: HTMLElement = document.documentElement): void {
  root.classList.remove("storefront-site");
  if (typeof document !== "undefined" && document.body) {
    document.body.classList.remove("storefront-site");
  }
}

export function readStoredThemePreference(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("againerp-theme");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { preference?: string } };
    return parsed.state?.preference ?? null;
  } catch {
    return null;
  }
}

export function readLegacyAppStorePreference(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("againerp-prototype");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { theme?: string } };
    return parsed.state?.theme ?? null;
  } catch {
    return null;
  }
}

/** Inline script for layout `<head>` — storefront always light; admin respects saved preference. */
export const THEME_INIT_SCRIPT = `(function(){
  var p=location.pathname;
  var admin=${JSON.stringify([...ADMIN_PATH_PREFIXES])};
  var isAdmin=admin.some(function(x){return p===x||p.indexOf(x+'/')===0;});
  var r=document.documentElement;
  if(!isAdmin){
    function lock(){
      r.classList.remove('dark','admin-site');
      r.classList.add('storefront-site');
      r.setAttribute('data-theme','light');
      r.style.colorScheme='light';
      r.style.backgroundColor='#ffffff';
      if(document.body){
        document.body.classList.add('storefront-site');
        document.body.style.backgroundColor='#ffffff';
        document.body.style.color='#0f172a';
      }
    }
    lock();
    if(document.readyState==='loading'){
      document.addEventListener('DOMContentLoaded',lock);
    }
    var ticks=0;
    var guard=setInterval(function(){lock();if(++ticks>=40){clearInterval(guard);}},50);
    return;
  }
  r.classList.remove('storefront-site');
  r.classList.add('admin-site');
  if(document.body){document.body.classList.remove('storefront-site');}
  var stored=null;
  try{var raw=localStorage.getItem('againerp-theme');if(raw){var j=JSON.parse(raw);stored=j.state&&j.state.preference;}}catch(e){}
  var sys=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
  var mode=stored==='dark'?'dark':stored==='light'?'light':sys?'dark':'light';
  r.classList.toggle('dark',mode==='dark');
  r.setAttribute('data-theme',mode);
  r.style.colorScheme=mode;
})();`;
