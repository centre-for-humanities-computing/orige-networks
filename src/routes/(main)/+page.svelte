<script>

    import { getContext, onMount, setContext, untrack } from "svelte";
    import { browser } from "$app/environment";
    import { CONTEXT } from "$lib/utils/constants.js";

    import Graph from "graphology";
    import { GraphView } from "$lib/client/GraphView.js";
    import { GraphViewModel } from "$lib/client/GraphViewModel.js";
    import Panel from "$lib/client/components/Panel.svelte";
    import FilterList from "$lib/client/components/FilterList.svelte";

    let { data } = $props();
    let graphViewModel = new GraphViewModel(Graph.from(data.serializedGraph), data.allFacets);

    /** @type {Set<string>} */
    const allNodes = graphViewModel.getNodeIDSet();

    /**
     * @typedef Filter
     * @prop {"work"|"doctrine"|"reference"} type
     * @prop {string} value
     */

    /**
     * @typedef QueryState
     * @prop {string} queryString
     * @prop {Filter[]} filters
     */

    /**
     * @type {QueryState}
     */
    let queryState = $state({
        queryString: "",
        filters: []
    });

    /**
     * @typedef GraphViewState
     * @prop {string|null} currentSelection
     * @prop {Set<string>} hiddenNodes
     * @prop {Set<string>} fadedNodes
     * @prop {boolean} unfadeRelatedNodes
     * @prop {boolean} showHiddenNeighbors
     */

    /**
     * @type {GraphViewState}
     */
    let graphViewState = $state({
        currentSelection: null,
        hiddenNodes: new Set(),
        fadedNodes: new Set(),
        unfadeRelatedNodes: false,
        showHiddenNeighbors: false
    });

    /** @type {{data: NodeObject, doctrines: string[], neighbors: Set<string>}|null} */
    let selectedNodeDetails = $derived.by(() => {
        if (graphViewState.currentSelection === null) {
            return null;
        }
        return graphViewModel.getDetailsFromNodeID(graphViewState.currentSelection);
    });

    function generatePanelHeaderWithFilterCount(header, filterType) {
        let count = queryState.filters.filter(f => filterType === f.type).length;
        if (count === 0) {
            return header;
        }

        return `${header} (${count} ${count === 1 ? "filter" : "filters"} selected)`;
    }

    /**
     * Clears the current query state
     */
    function clearQueryState() {
        queryState.queryString = '';
        queryState.filters = [];
    }

    /**
     * Clears the current graph view state
     */
    function clearGraphViewState() {
        graphViewState.hiddenNodes.clear();
        clearFadedViewState();
        clearHighlightedViewState()
    }

    /**
     * Clears state for highlighted nodes
     */
    function clearHighlightedViewState() {
        graphViewState.currentSelection = null;
    }

    /**
     * Clears state for faded/"background" nodes
     */
    function clearFadedViewState() {
        graphViewState.fadedNodes.clear();
    }

    let facets = graphViewModel.getFacets();

    // Global context
    setContext(CONTEXT.QUERY_STATE, queryState);
    setContext(CONTEXT.GRAPH_STATE, graphViewState);
    setContext(CONTEXT.FACETS, facets);

    let resolveURL = getContext(CONTEXT.RESOLVE_URL);

    /** @type {HTMLDivElement} */
    let container;

    /** @type {import('sigma').Sigma} */
    let sigma;

    /**
     * Set up sigma container and listeners
     */
    onMount( async () => {
        if (browser) {

            let { Sigma } = await import("sigma");

            // Instantiate sigma.js and render the graphModel
            sigma = new Sigma(graphViewModel.graph, container, { zIndex: true, allowInvalidContainer: true });

            // Creates and inserts a new layer between graph

            /**
             * A handler for click events on nodes
             * @param {SigmaNodeEventPayload} event
             */
            function nodeClickedHandler(event) {
                graphViewState.currentSelection = event.node;
            }

            /**
             * Handler for clicks on canvas/stage
             * @param {SigmaEventPayload} event
             */
            function stageClickHandler(event) {
                graphViewState.currentSelection = null;
            }

            // Adds handler for node clicks
            sigma.on('clickNode', nodeClickedHandler);

            // Handler for clicking outside the nodes
            sigma.on('clickStage', stageClickHandler)
        }
    })

    // Effect for text and filter queries
    $effect(() => {
        queryState.queryString;
        queryState.filters.length;
        graphViewState.showHiddenNeighbors;

        untrack(() => {
            let matches = applySearch();

            if (graphViewState.showHiddenNeighbors) {
                let neighbors = new Set();
                for (let match of matches) {
                    graphViewModel.graph.forEachNeighbor(match, (neighbor, attributes) => {
                        neighbors.add(neighbor);
                    });
                }
                matches = matches.union(neighbors);
            }

            graphViewState.hiddenNodes = allNodes.difference(matches);

            render();
        })
    });

    // Effect for clicking or unclicking a single node
    $effect(() => {
        graphViewState.currentSelection;
        graphViewState.unfadeRelatedNodes;

        untrack(() => {
            clearFadedViewState();
            if (graphViewState.currentSelection === null) {
                render();
                return;
            }

            let shown = new Set();
            shown.add(graphViewState.currentSelection);
            let neighbors = new Set();

            // Show immediate neighbors
            graphViewModel.graph.forEachNeighbor(graphViewState.currentSelection, (neighbor, attributes) => {
                neighbors.add(neighbor);
                shown.add(neighbor);
            });

            if (graphViewState.unfadeRelatedNodes) {
                // Show neighbors of depth 2
                for (let neighbor of neighbors) {
                    graphViewModel.graph.forEachNeighbor(neighbor, (adjecentNeighbor, attributes) => {
                        shown.add(adjecentNeighbor);
                    });
                }
            }

            graphViewState.fadedNodes = allNodes.difference(shown);

            render();
        })
    })

    /**
     * Searches through the model based on the current state (query string and filters)
     * @return {Set<string>} - A set of string-based IDs
     */
    function applySearch() {
        graphViewState.currentSelection = null;

        let { queryString, filters } = $state.snapshot(queryState);
        let results = graphViewModel.search(queryString, filters)

        return results.resultSet;
    }

    /**
     * Renders the graph view state
     */
    function render() {
        if (!sigma) {
            return;
        }

        // nodeReducer and edgeReducer callback params vary from the documentation. :-(

        // Applies pre-render formatting for nodes
        sigma.setSetting('nodeReducer', (id, node) => {

            // Hides irrelevant nodes (based on filter/search)
            if (graphViewState.hiddenNodes.has(id)) {
                return {
                    ...node,
                    hidden: true
                };
            }

            // Highlights selected node
            if (graphViewState.currentSelection === id) {
                return {
                    ...node,
                    color: GraphView.COLORS.HIGHLIGHT,
                    forceLabel: true,
                    zIndex: 99
                }
            }

            // Greys out nodes not in selection and neighbors
            if (graphViewState.fadedNodes.has(id)) {
                return {
                    ...node,
                    color: GraphView.COLORS.FADE,
                    label: null,
                    zIndex: 1
                }
            }

            // Everything else shown as usual
            return {
                ...node,
                zIndex: 10
            };
        });

        // Applies pre-render formatting for edges
        sigma.setSetting('edgeReducer', (id, edge) => {

            // Show all edges for non-hidden nodes if no node is selected
            if (graphViewState.currentSelection === null) {
                return edge;
            }

            /**
             * Helper function for edge-node relationships
             * Returns true if at least one node in the edge is faded (grey)
             * @param {string} edgeID
             * @return {boolean}
             */
            function edgeHasFadedExtremityNode(edgeID) {
                let nodes = graphViewModel.graph.extremities(edgeID);

                return (graphViewState.fadedNodes.has(nodes[0]) || graphViewState.fadedNodes.has(nodes[1]));
            }

            /**
             * Helper function for edge-node relationships
             * Returns true if at least one node in the edge is highlighted (grey)
             * @param {string} edgeID
             * @return {boolean}
             */
            function edgeHasHighlightedExtremityNode(edgeID) {
                let nodes = graphViewModel.graph.extremities(edgeID);

                return nodes.some(id => id === graphViewState.currentSelection);
            }

            // Highlights edge if connected to highlighted node
            if (edgeHasHighlightedExtremityNode(id)) {
                return {
                    ...edge,
                    color: GraphView.COLORS.HIGHLIGHT,
                    zIndex:99
                }
            }

            // Hides edge if connected to one or more faded nodes (remove visual clutter)
            if (edgeHasFadedExtremityNode(id)) {
                return {
                    ...edge,
                    hidden: true
                }
            }

            return {
                ...edge,
                color: GraphView.COLORS.HIGHLIGHT,
                zIndex:99
            }



        })

        // Gode eksempler her på brug af reducers til hhv. highlight og mattering
        // https://github.com/jacomyal/sigma.js/blob/main/packages/storybook/stories/1-core-features/4-use-reducers/index.ts

        sigma.scheduleRender(); // (https://www.sigmajs.org/docs/advanced/lifecycle#manual-rendering-triggers)
    }


</script>

{#snippet info(/** @type {string} */ title, /** @type {string} */ text)}
    <div>
        <p class="details-key">{title}</p>
        <p class="details-value">{text.trim().length > 0 ? text : 'None'}</p>
    </div>
{/snippet}

<div id="sigma-container" bind:this={container}></div>

<div id="expand-graph-container">
    {#if graphViewState.hiddenNodes.size > 0}
        <div>
            <input type="checkbox" id="show-hidden-neighbors" bind:checked={graphViewState.showHiddenNeighbors}>
            <label for="show-hidden-neighbors">Show hidden neighbors</label>
        </div>
    {/if}
    {#if graphViewState.currentSelection}
        <div>
            <input type="checkbox" id="show-additional-neighbors" bind:checked={graphViewState.unfadeRelatedNodes}/>
            <label for="show-additional-neighbors">Show extra degree of neighbors</label>
        </div>
    {/if}
</div>

<div id="details-panel" class:hidden={!graphViewState.currentSelection} class="bordered">
    {#if graphViewState.currentSelection && selectedNodeDetails}
    <Panel
            header={selectedNodeDetails.data.reference}
            isCollapsible={false}
    >
        {@render info("Work", selectedNodeDetails.data.work)}
        {@render info("Reference", selectedNodeDetails.data.reference)}
        {@render info("ID", graphViewState.currentSelection)}
        {@render info("Doctrines", selectedNodeDetails.doctrines.join(', '))}

        {#if selectedNodeDetails.data.type === "main"}
            {@render info("Biblical quotations", Array.from(selectedNodeDetails.neighbors).join(', '))}
        {:else}
            {@render info("Referencing passages", Array.from(selectedNodeDetails.neighbors).map(nodeID => graphViewModel.getWorkFromNodeID(nodeID)).join(', '))}
        {/if}

    </Panel>
    {/if}
</div>

<div id="search-filter-panel-container" class="bordered">
    <Panel header="Search" isCollapsible={false}>
        <input class="fill" type="text" bind:value={queryState.queryString} placeholder="Search by work or biblical reference...">
    </Panel>

    <hr />

    <Panel header={generatePanelHeaderWithFilterCount("Works", "work")}>
        <FilterList
                facetOptions={facets.works}
                type="work"
        />
    </Panel>

    <hr />

    <Panel header={generatePanelHeaderWithFilterCount("Doctrines", "doctrine")}>
        <FilterList
                facetOptions={facets.doctrines}
                type="doctrine"
        />
    </Panel>

    <hr />

    <Panel header={generatePanelHeaderWithFilterCount("Referenced works", "reference")}>
        <FilterList
                facetOptions={facets.quotedReferences}
                type="reference"
        />
    </Panel>

</div>

<div id="extra-panel">
        <p class="italic">Nodes: {graphViewModel.getMetadataForDataset().totalNodes - graphViewState.hiddenNodes.size} (total: {graphViewModel.getMetadataForDataset().totalNodes}).</p>
</div>

<style>
    #sigma-container {
        position: absolute;
        z-index: -1;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: white;
    }
</style>