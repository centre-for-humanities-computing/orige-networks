<script>
 import "$lib/client/assets/styles.css"
 import { base } from '$app/paths';
 import { setContext } from "svelte";
 import { CONTEXT } from "$lib/utils/constants.js";

 let { children } = $props();

 /**
  * Resolves a path
  * @param {string} path
  */
 function resolveURL(path) {
  return `${base}${path}`;
 }

 setContext(CONTEXT.RESOLVE_URL, resolveURL);

</script>

<nav>
 <div class="nav-item">
  <a href={resolveURL("/")}>Orige.net</a>
 </div>
    <div class="nav-item">
        <a href={resolveURL("/glossaries")}>Glossaries</a>
    </div>
 <div class="nav-item">
  <a href={resolveURL("/about")}>About</a>
 </div>
</nav>
  {@render children()}