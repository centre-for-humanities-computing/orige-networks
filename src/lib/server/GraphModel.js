import Graph from "graphology";
// import betweennessCentrality from 'graphology-metrics/centrality/betweenness';
import { GraphView } from "$lib/client/GraphView.js";
import { degreeCentrality } from "graphology-metrics/centrality/degree";

class GraphModel {
    /** @type {Graph} */
    graph;

    /** @type {GraphView} */
    #graphView;

    /** @type {FacetListObject} */
    #facets;

    /**
     * Creates a new graph model instance
     * @param {NodeObject[]} nodes
     * @param {EdgeObject[]} edges
     * @param {FacetListObject} facets
     */
    constructor(nodes, edges, facets) {
        this.graph = new Graph({ multi: true, type: "directed" });
        this.#graphView = new GraphView(this.graph);

        for (let node of nodes) {
            this.graph.addNode(node.id, {
                label: node.reference ?? node.id,
                x: this.#graphView.getDefaultXPos(),
                y: this.#graphView.getDefaultYPos(),
                color: this.#graphView.getNodeColorFromType(node.type),
                size: GraphView.SIZE.MIN,
                data: node
            });
        }

        for (let edge of edges) {
            this.graph.addEdge(edge.fromId, edge.toId, {
                data: edge
            });
        }

        this.#facets = facets;
    }

    /**
     * Inits the model by applying transformations based on final graph properties
     * @param {?{ calculateCentrality: "degree" }} options
     */
    init(options = {}) {
        if (options?.calculateCentrality === 'degree') {
            degreeCentrality.assign(this.graph);
            const centralities = this.graph.nodes().map(node => this.graph.getNodeAttribute(node, 'degreeCentrality'));

            const max = Math.max(...centralities);
            const min = Math.min(...centralities);

            function ratioFn(val) {
                let factor = 1 / (max - min);
                return (val - min) * factor;
            }

            this.graph.forEachNode((key, attr) => {
                let ratio = ratioFn(attr.degreeCentrality);

                attr.size = this.#graphView.getNodeSizeFromType(key, attr.data.type, ratio)
            });
        } else {
            this.graph.forEachNode((key, attr) => {
                attr.size = this.#graphView.getNodeSizeFromType(key, attr.data.type)
            });
        }

        this.#graphView.init();
    }

    /**
     * Returns available facets
     * @return {FacetListObject}
     */
    getFacets() {
        return this.#facets;
    }
}

export { GraphModel }