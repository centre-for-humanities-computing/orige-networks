<script>
 import "$lib/client/assets/styles.css"
 import { resolve } from '$app/paths';
 import { setContext } from "svelte";
 import { CONTEXT } from "$lib/utils/constants.js";

 let { children } = $props();

</script>

<nav>
 <div class="nav-item">
  <a href={resolve("/")}>Orige.net</a>
 </div>
    <div class="nav-item">
        <a href={resolve("/glossaries")}>Glossaries</a>
    </div>
    <div class="nav-item">
        <a href={resolve("/how-to-use")}>How to use</a>
    </div>
 <div class="nav-item">
  <a href={resolve("/about")}>About</a>
 </div>
</nav>
  {@render children()}