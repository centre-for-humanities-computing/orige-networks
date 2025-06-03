<script>
    import Graph from "graphology";

    import { onMount, setContext } from "svelte";
    import { browser } from "$app/environment";
    import PanelContainer from "$lib/client/PanelContainer.svelte";

    let { data } = $props();

    let exportedGraph = data.exportedGraph;
    let graph = Graph.from(exportedGraph);

    let availableData = data.availableData;

    $inspect(availableData);

    let graphState = $state({
        selectedWorks: ["hello"]
    });

    setContext('graphState', graphState);
    setContext('availableData', availableData)

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

        alert('now in version 0.0.2')

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
<button onclick={() => graphState.selectedWorks.push('test')}>Klik</button>
<p>Edges: {graph.edges().length}. Nodes: {graph.nodes().length}</p>

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