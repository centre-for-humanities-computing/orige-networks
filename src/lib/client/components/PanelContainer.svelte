<script>
    import Panel from "$lib/client/components/Panel.svelte";
    import FilterList from "$lib/client/components/FilterList.svelte";
    import { getContext } from "svelte";
    import { CONTEXT } from "$lib/utils/constants.js";

    let facets = getContext(CONTEXT.FACETS);
    let queryState = getContext(CONTEXT.QUERY_STATE);

    let queryStr = queryState.queryStr;
    
</script>
<div class="panel-container">
    <Panel header="Search" startCollapsed={false}>
        <p class="small collapse-margin-vertical"> Search by work reference name or quotation, e.g., "Hum.Jes.Nav." or "Luke 13"</p>
        <input type="text" bind:value={queryStr}>
        <button onclick={() => queryState.queryStr = queryStr}>Search</button>
    </Panel>

    <Panel header="Works">
        <FilterList
                facetOptions={facets.works}
                type="work"
        />
    </Panel>

    <Panel header="Doctrines">
        <FilterList
                facetOptions={facets.doctrines}
                type="doctrine"
        />
    </Panel>

    <Panel header="Referenced works">
        <FilterList
            facetOptions={facets.quotedReferences}
            type="references"
        />
    </Panel>

</div>

<style>
    .panel-container {
        position: absolute;
        bottom: 0;
        right: 0;
        margin: 15px;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
</style>