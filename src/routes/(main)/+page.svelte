<script>

    import { getContext, onMount, setContext, untrack } from "svelte";
    import { browser } from "$app/environment";
    import { CONTEXT } from "$lib/utils/constants.js";

    import Graph from "graphology";
    import { GraphView } from "$lib/client/GraphView.js";
    import { GraphViewModel } from "$lib/client/GraphViewModel.js";
    import PanelContainer from "$lib/client/components/PanelContainer.svelte";
    import Panel from "$lib/client/components/Panel.svelte";

    let { data } = $props();
    let graphViewModel = new GraphViewModel(Graph.from(data.serializedGraph), data.allFacets);

    /** @type {Set<string>} */
    const allNodes = graphViewModel.getNodeIDSet();

    /**
     * @typedef Filter
     * @prop {string} type
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

    let filterListUI = $derived.by(() => {
        function getStringFromType(type) {
            return queryState.filters.filter(f => f.type === type).map(f => f.value).join(', ')
        }

        return {
            works: getStringFromType('work'),
            doctrines: getStringFromType('doctrine'),
            references: getStringFromType('reference')
        }
    });

    /**
     * @typedef GraphViewState
     * @prop {Set<string>} hiddenNodes
     * @prop {Set<string>} fadedNodes
     * @prop {Set<string>} highlightedNodes
     * @prop {boolean} highlightRelated
     * @prop {boolean} showHiddenNeighbors
     */

    /**
     * @type {GraphViewState}
     */
    let graphViewState = $state({
        hiddenNodes: new Set(),
        fadedNodes: new Set(),
        highlightedNodes: new Set(),
        highlightRelated: false,
        showHiddenNeighbors: false
    });

    $inspect(graphViewState)

    let renderedNodes = $derived.by(() => {
       return allNodes.difference(graphViewState.hiddenNodes);
    });

    /** @type {string|null} */
    let currentSelection = $state(null);

    /** @type {{data: NodeObject, doctrines: string[], neighbors: Set<string>}|null} */
    let selectedNodeDetails = $derived.by(() => {
        if (currentSelection === null) {
            return null;
        }

        return graphViewModel.getDetailsFromNodeID(currentSelection);
    });

    /**
     * Util function to add a node to a set
     * @param {string[]} nodes
     * @param {Set<string>} set
     */
    function addNodesToSet(nodes, set) {
        for (let node of nodes) {
            set.add(node);
        }
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

    function clearHighlightedViewState() {
        graphViewState.highlightedNodes.clear();
    }

    function clearFadedViewState() {
        graphViewState.fadedNodes.clear();
    }

    // Global context
    setContext(CONTEXT.QUERY_STATE, queryState);
    setContext(CONTEXT.GRAPH_STATE, graphViewState);
    setContext(CONTEXT.FACETS, graphViewModel.getFacets());

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
             * A handler for click events
             * @param {SigmaNodeEventPayload} event
             */
            function nodeClickedHandler(event) {
                clearHighlightedViewState();
                currentSelection = event.node; // graphModel.getNodeAttribute(nodeID, 'data') === null ? null : nodeID;
            }

            /**
             *
             * @param {SigmaEventPayload} event
             */
            function stageClickHandler(event) {
                currentSelection = null;
                clearHighlightedViewState();
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
            console.log('rendering triggered')

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
        currentSelection;
        graphViewState.highlightedNodes;
        graphViewState.highlightRelated;

        untrack(() => {
            clearHighlightedViewState();
            clearFadedViewState();
            if (currentSelection === null) {
                render();
                return;
            }

            graphViewState.highlightedNodes.add(currentSelection);

            let shown = new Set();
            shown.add(currentSelection);
            let neighbors = new Set();

            // Show immediate neighbors
            graphViewModel.graph.forEachNeighbor(currentSelection, (neighbor, attributes) => {
                neighbors.add(neighbor);
                shown.add(neighbor);
            });

            if (graphViewState.highlightRelated) {
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

    function applySearch() {
        currentSelection = null;

        let { queryString, filters } = $state.snapshot(queryState);
        let results = graphViewModel.search(queryString, filters)
        console.log(results)

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
        sigma.setSetting('nodeReducer', (id, node) => {
            if (graphViewState.hiddenNodes.has(id)) {
                return {
                    ...node,
                    hidden: true
                };
            }
            if (graphViewState.highlightedNodes.has(id)) {
                return {
                    ...node,
                    color: GraphView.COLORS.HIGHLIGHT,
                    forceLabel: true,
                    zIndex: 99
                }
            }
            if (graphViewState.fadedNodes.has(id)) {
                return {
                    ...node,
                    color: GraphView.COLORS.FADE,
                    label: null,
                    zIndex: 1
                }
            }

            return {
                ...node,
                zIndex: 10
            };
        });

        sigma.setSetting('edgeReducer', (id, edge) => {
            if (currentSelection === null) {
                return edge;
            }

            function edgeHasFadedExtremityNode(edgeID) {
                let nodes = graphViewModel.graph.extremities(edgeID);

                return (graphViewState.fadedNodes.has(nodes[0]) || graphViewState.fadedNodes.has(nodes[1]));
            }

            function edgeHasHighlightedExtremityNode(edgeID) {
                let nodes = graphViewModel.graph.extremities(edgeID);

                return graphViewState.highlightedNodes.has(nodes[0]) || graphViewState.highlightedNodes.has(nodes[1]);
            }

            if (edgeHasHighlightedExtremityNode(id)) {
                return {
                    ...edge,
                    color: GraphView.COLORS.HIGHLIGHT,
                    zIndex:99
                }
            }

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

{#snippet info(title, text)}
    <div>
        <p class="details-key">{title}</p>
        <p class="details-value">{text.trim().length > 0 ? text : 'None'}</p>
    </div>
{/snippet}

<div id="sigma-container" bind:this={container}></div>

<div id="details-panel" class:hidden={!currentSelection}>
    {#if currentSelection && selectedNodeDetails}
    <Panel
            header={selectedNodeDetails.data.reference}
            isCollapsible={false}
    >
        <input type="checkbox" id="show-additional-neighbors" bind:checked={graphViewState.highlightRelated}/>
        <label for="show-additional-neighbors">Highlight related references</label>
        {@render info("Work", selectedNodeDetails.data.work)}
        {@render info("Reference", selectedNodeDetails.data.reference)}
        {@render info("ID", currentSelection)}
        {@render info("Doctrines", selectedNodeDetails.doctrines.join(', '))}

        {#if selectedNodeDetails.data.type === "main"}
            {@render info("Biblical quotations", Array.from(selectedNodeDetails.neighbors).join(', '))}
        {:else}
            {@render info("Referencing passages", Array.from(selectedNodeDetails.neighbors).map(nodeID => graphViewModel.getWorkFromNodeID(nodeID)).join(', '))}
        {/if}

    </Panel>
    {/if}
</div>

<PanelContainer />

<div id="extra-panel">
    <Panel
            header=""
            isCollapsible={false}
        >
        <p class="italic">Nodes: {graphViewModel.getMetadataForDataset().totalNodes} ({graphViewModel.getMetadataForDataset().totalNodes - graphViewState.hiddenNodes.size} shown).</p>
        {#if queryState.filters.length > 0}
            <p>Applied filters:</p>
            <ul>
                {#if filterListUI.works.length > 0}
                    <li>Works: <em>{filterListUI.works}</em></li>
                {/if}
                {#if filterListUI.doctrines.length > 0}
                    <li>Doctrines: <em>{filterListUI.doctrines ?? '—'}</em></li>
                {/if}
                {#if filterListUI.references.length > 0}
                    <li>References: <em>{filterListUI.references}</em></li>
                {/if}
            </ul>
        {/if}
        {#if graphViewState.hiddenNodes.size > 0}
            <div>
                <input type="checkbox" id="show-hidden-neighbors" bind:checked={graphViewState.showHiddenNeighbors}>
                <label for="show-hidden-neighbors">Show hidden neighbors</label>
            </div>
        {/if}
    </Panel>
</div>

<footer id="footer">

</footer>

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

    #footer {
        position: absolute;
        bottom: 0;
        left: 0;
        font-size: 0.8rem;
        margin-inline: 10px;
    }

    .italic {
        font-style: italic;
    }

    #extra-panel {
        position: absolute;
        bottom: 0;
        left: 0;
        margin: 15px;
    }

    #details-panel {
        position: absolute;
        top: 0;
        right: 0;
        margin: 15px;
        max-width: 30vw;
    }

    .details-key {
        font-stretch: semi-expanded;
        font-weight: bold;
        margin-bottom: 0;
    }

    .details-value {
        font-size: 0.8em;
        margin-top: 0;
    }

    .hidden {
        display: none;
    }
</style>