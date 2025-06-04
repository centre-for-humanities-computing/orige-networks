<script>
    import Graph from "graphology";

    import { getContext, onMount, setContext } from "svelte";
    import { browser } from "$app/environment";
    import PanelContainer from "$lib/client/PanelContainer.svelte";
    import { CONTEXT } from "$lib/utils/constants.js";

    let { data } = $props();

    let exportedGraph = data.exportedGraph;
    let graph = Graph.from(exportedGraph);

    let availableData = data.availableData;

    // $inspect(availableData);

    /** @type {GraphState} */
    let graphState = $state({
        selectedNodeID: null,
        query: {
            queryStr: "",
            filters: []
        },
        filteredNodeIDs: []
    });

    setContext(CONTEXT.GRAPH_STATE, graphState);
    setContext(CONTEXT.AVAILABLE_DATA, availableData)

    let resolveURL = getContext(CONTEXT.RESOLVE_URL);

    /** @type {HTMLDivElement} */
    let container;
    let sigma;

    onMount( async () => {
        if (browser) {

            let { Sigma } = await import("sigma");

            // Instantiate sigma.js and render the graph
            const container1 =  document.getElementById("sigma-container");
            sigma = new Sigma(graph, container1);
        }
    })

    $effect(() => {
        graphState;

        console.log($state.snapshot(graphState));

        render();
    })

    function render() {
        if (!sigma) {
            return;
        }

        sigma.setSetting('nodeReducer', (id, node) => {
            if (!node.data || !node.data.doctrines.includes('Church')) {
                return {
                    ...node,
                    hidden: true
                };
            }
            return node;
        })

        sigma.scheduleRender(); // (https://www.sigmajs.org/docs/advanced/lifecycle#manual-rendering-triggers)
    }



</script>

<h1>Welcome to Orige.net</h1>
<p>Edges: {graph.edges().length}. Nodes: {graph.nodes().length}</p>

<p>Go to <a href={resolveURL("/about")}>ABOUT</a></p>

<div id="sigma-container" bind:this={container}></div>

<PanelContainer />

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