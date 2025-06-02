<script>
    import Panel from "$lib/client/Panel.svelte";
    import FilterList from "$lib/client/FilterList.svelte";
    import { getContext } from "svelte";

    let availableData = getContext('availableData');

    console.log()

</script>
<div class="panel-container">
    <Panel header="Search">
        <input type="text">
    </Panel>

    <Panel header="Works">
        <FilterList options={availableData.works}/>
    </Panel>

    <Panel header="Doctrines">
        <FilterList options={availableData.doctrines}/>
    </Panel>

    <Panel header="Referenced works">
        <p>Dummy text</p>
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