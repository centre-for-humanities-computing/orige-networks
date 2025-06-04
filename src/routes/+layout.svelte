<script>

 import { base } from '$app/paths';
 import { setContext } from "svelte";
 import { CONTEXT } from "$lib/utils/constants.js";

 let { children } = $props();

 /**
  * Resolves a path
  * @param {string} path
  */
 function resolveURL(path) {
  if (base === "") {
   return path;
  }
  return `${base}/${path}`;
 }

 setContext(CONTEXT.RESOLVE_URL, resolveURL);

</script>

<nav>
 <h1>Hej</h1>
</nav>

 <div>
  {@render children()}
 </div>

<style>
 :root {
  font-family: "Helvetica Neue", sans-serif;
  color: #21130d;
 }
 nav {
  z-index: 999;
 }
</style>