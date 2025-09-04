<script>

    import { getContext, onMount, setContext } from "svelte";
    import { browser } from "$app/environment";
    import PanelContainer from "$lib/client/components/PanelContainer.svelte";
    import Panel from "$lib/client/components/Panel.svelte";
    import { CONTEXT } from "$lib/utils/constants.js";

    import { isNotNullNotEmptyString } from "$lib/utils/helpers.js";
    import { GraphViewModel } from "$lib/client/GraphViewModel.js";
    import Graph from "graphology";
    import { GraphView } from "$lib/client/GraphView.js";

    let { data } = $props();
    let graphViewModel = new GraphViewModel(Graph.from(data.serializedGraph), data.allFacets);

    let currentSelection = $state(null);

    let queryState = $state({
        queryString: "",
        filters: []
    });

    /** @type {GraphState} */
    let graphState = $state({
        // renderedNodeIDs: new Set(graphViewModel.graph.nodes()),
        hiddenNodes: null, // TODO
        fadedNodes: null, // TODO
        highlightedNodes: null, // TODO
    });

    let selectedNodeDetails = $derived.by(() => {
        let nodeID = currentSelection;
        if (nodeID === null) {
            return null;
        }
        let data = graphViewModel.graph.getNodeAttribute(nodeID, 'data');

        let allDoctrines = graphViewModel.graph.mapEdges(nodeID, (edge, attr) => {
            console.log(attr)
            return attr.data.doctrines;
        }).flat();
        let uniqueDoctrines = new Set(allDoctrines);

        let doctrines = Array.from(uniqueDoctrines);
        return {
            data,
            doctrines
        }
    });

    function clearQueryState() {
        queryState.queryString = '';
        queryState.filters = [];
    }

    // Global context
    setContext(CONTEXT.QUERY_STATE, queryState);
    setContext(CONTEXT.GRAPH_STATE, graphState);
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

            /**
             * A handler for click events
             */
            function nodeClickedHandler(event) {
                currentSelection = event.node; // graphModel.getNodeAttribute(nodeID, 'data') === null ? null : nodeID;
                clearQueryState();
            }

            function stageClickHandler(event) {
                currentSelection = null;
            }

            // Adds handler for node clicks
            sigma.on('clickNode', nodeClickedHandler);

            // Handler for clicking outside the nodes
            sigma.on('clickStage', stageClickHandler)
        }
    })

    // Effect for text and filter queries
    $effect(() => {
        queryState;
        graphState;

        console.log('rendering triggered')

        let matches = applySearch();



        render(renderableNodes, highlightedNodes);
    });

    // Effect for clicking a single node
    $effect(() => {
        graphState.selectedNodeID;

        let highlightedNodes = new Set();
        if (graphState.selectedNodeID) {
            highlightedNodes.add(graphState.selectedNodeID);
            graphViewModel.graph.forEachNeighbor(graphState.selectedNodeID, (neighbor, attributes) => highlightedNodes.add(neighbor));
        }
    })


    function render(hidden, highlighted, faded) {
        if (!sigma) {
            return;
        }

        // nodeReducer and edgeReducer callback params vary from the documentation. :-(
        sigma.setSetting('nodeReducer', (id, node) => {
            if (hidden.has(id)) {
                return {
                    ...node,
                    hidden: true
                };
            }
            if (highlighted.has(id)) {
                return {
                    ...node,
                    color: GraphView.COLORS.HIGHLIGHT,
                    forceLabel: true,
                    zIndex: 99
                }
            }
            if (faded.has(id)) {
                return {
                    ...node,
                    color: GraphView.COLORS.FADE,
                    label: null
                }
            }

            return node;
        });

        sigma.setSetting('edgeReducer', (id, edge) => {
            let extremities = graphViewModel.graph.extremities(id);
            if (highlighted.has(extremities[0]) && highlighted.has(extremities[1])) {
                return {
                    ...edge,
                    color: GraphView.COLORS.HIGHLIGHT,
                    zIndex:99
                }
            }
            return edge;

        })

        // Gode eksempler her på brug af reducers til hhv. highlight og mattering
        // https://github.com/jacomyal/sigma.js/blob/main/packages/storybook/stories/1-core-features/4-use-reducers/index.ts

        sigma.scheduleRender(); // (https://www.sigmajs.org/docs/advanced/lifecycle#manual-rendering-triggers)
    }

    function applySearch() {
        currentSelection = null;

        console.log(queryState)
        let results = graphViewModel.search(queryState.queryString)
        console.log(results)

        return results.resultSet;

/*
        if (queryStr.length > 0) {
            let { matches, neighbors } = searchByQueryString(queryStr);

            searchResults = matches.union(neighbors);
        } else {
            searchResults = allNodes;
        }

        if (queryState.filters.length > 0) {
            searchResults = applyFilters(searchResults, $state.snapshot(queryState.filters));
        }

        return searchResults;

 */
    }

    function applyFilters(nodes, filters) {
        let res = new Set();
        for (let filter of filters) {
            for (let nodeID of nodes) {
                if (filterMatchesNode(filter, nodeID)) {
                    res.add(nodeID);
                }
            }
        }
        return res;
    }

    function filterMatchesNode(filter, nodeID) {
        let data = graphViewModel.graph.getNodeAttribute(nodeID, 'data');

        if (data) {
            if (filter.type === 'work' && data.work === filter.value) {
                return true;
            }
            if (filter.type === 'doctrine' && data.doctrines.includes(filter.value)) {
                return true;
            }
        }

        return false;
    }

    function searchByQueryString(queryStr) {
        let matches = new Set();
        let neighbors = new Set();
        for (let node of graphViewModel.graph.nodes()) {
            if (node.includes(queryStr)) {
                matches.add(node);
                graphViewModel.graph.forEachNeighbor(node, neighbor => neighbors.add(neighbor));
            }
        }
        return {
            matches,
            neighbors
        };
    }

    function getNeighborsFromNodeID(nodeID) {
        return graphViewModel.graph.mapNeighbors(graphState.selectedNodeID, (neighbor, attributes) => {
            console.log(attributes)
            return {
                neighborID: neighbor,
                // doctrines: attributes.data?.doctrines ?? []
            }
        });
    }

    function getFullWorkFromAbbreviation(abbreviation) {
        let ref = /^[A-Za-z0-9]+ [0-9.:]+$/;
        let match = ref.exec(abbreviation);
        console.log(abbreviation)
        console.log(match);

        if (isNotNullNotEmptyString(abbreviation)) {
            return getFullReferenceFromAbbr.get(abbreviation);
        }
        return 'No reference available';
    }

</script>

{#snippet info(title, text)}
    <div>
        <p class="details-key">{title}</p>
        <p class="details-value">{text ?? '—'}</p>
    </div>
{/snippet}

<div id="sigma-container" bind:this={container}></div>

<div id="details-panel" class:hidden={!graphState.selectedNodeID}>
    <Panel
            header={selectedNodeDetails?.reference}
            isCollapsible={false}
    >
        {@render info("Work", selectedNodeDetails?.work)}
        {@render info("Reference", selectedNodeDetails?.reference)}
        {@render info("ID", graphState.selectedNodeID)}
        {@render info("Doctrines", selectedNodeDetails?.doctrines?.join(', '))}


    </Panel>
</div>

<PanelContainer />

<footer id="footer">
    <p class="italic">Nodes: {graphViewModel.getMetadataForDataset().totalNodes}. Edges: {graphViewModel.getMetadataForDataset().totalEdges}.</p>
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