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
     * @param {Graph|{ nodes: NodeObject[], edges: EdgeObject[]}} data - Can be either a Graph instance or lists of node and edge objects
     * @param {FacetListObject} facets - Available facets for filtering
     */
    constructor(data, facets) {
        if (data instanceof Graph) {
            this.graph = data;
        } else {
            this.graph = new Graph({ multi: true, type: "directed" });
            this.#graphView = new GraphView(this.graph);

            for (let node of data.nodes) {
                this.graph.addNode(node.id, {
                    label: node.reference ?? node.id,
                    x: this.#graphView.getDefaultXPos(),
                    y: this.#graphView.getDefaultYPos(),
                    color: this.#graphView.getNodeColorFromType(node.type),
                    size: GraphView.SIZE.MIN,
                    data: node
                });
            }

            for (let edge of data.edges) {
                this.graph.addEdge(edge.fromId, edge.toId, {
                    data: edge
                });
            }
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