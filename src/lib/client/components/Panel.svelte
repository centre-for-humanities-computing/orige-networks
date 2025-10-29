<script>
    let {
        header,
        isCollapsible = true,
        startCollapsed = true,
        children
    } = $props();

    let isCollapsed = $state(isCollapsible && startCollapsed);

    function toggleCollapse() {
        isCollapsed = !isCollapsed;
    }
</script>

<div class="panel">
    <div class="panel-header">
        {#if header.length > 0}
        <h2>{header}</h2>
        {/if}
        {#if isCollapsible}
            <button
                    class="fancy-button"
                    onclick={toggleCollapse}>{isCollapsed ? 'Show' : 'Hide'}
            </button>
        {/if}
    </div>
    <div class="panel-content">
        {#if !isCollapsed}
            {@render children()}
        {/if}

    </div>
</div>