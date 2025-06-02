<script>
    let {
        header,
        children
    } = $props();

    let isCollapsed = $state(true);

    function toggleCollapse() {
        isCollapsed = !isCollapsed;
    }
</script>

<div class="panel">
    <div class="panel-header">
        <h2>{header}</h2>
        <button onclick={toggleCollapse}>Show more</button>
    </div>
    <div
            class="panel-content"
            class:collapsed={isCollapsed}
    >
        {@render children()}
    </div>
</div>

<style>
    .panel {
        background-color: #eeeee4;
        border-radius: 5px;
        padding: 5px;
        border: 1px solid #21130d;
    }

    .panel-header {
        display: flex;
    }

    .panel-header > button {
        height: fit-content;
        justify-self: end;
        margin-left: auto;
    }

    .panel-header > h2 {
        margin: 0.5em;
    }

    .panel-content.collapsed {
        display: none;
    }
</style>