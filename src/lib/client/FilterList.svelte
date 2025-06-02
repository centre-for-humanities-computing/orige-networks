<script>
    let {
        options
    } = $props();

    let limit = $state(10);

    let displayOptions = $derived.by(() => {
        let res = [];
        for (let i = 0; i < Math.min(options.length, limit); i++) {
            res.push(options[i]);
        }
        return res;
    })
</script>

<div>
        {#each displayOptions as opt}
            <div class="filter-element">
                <input type="checkbox" />
                <span>{opt.key}</span>
                <span class="text-count">{opt.count}</span>
            </div>
        {/each}
    {#if options.length > limit}
        <button onclick={() => {limit += 5}}>Show more options</button>
    {/if}
</div>

<style>
    .filter-element {
        display: flex;
        gap: 20px;
    }

    .text-count {
        margin-left: auto;
        font-style: oblique;
    }
</style>