import Graph from "graphology";
import { GraphView } from "$lib/client/GraphView.js";

class GraphModel {
    graph;
    #graphView;
    #facets;

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

    init() {
        this.graph.forEachNode((key, attr) => {
            attr.size = this.#graphView.getNodeSizeFromType(key, attr.data.type)
        });

        this.#graphView.init();
    }

    getFacets() {
        return this.#facets;
    }
}

export { GraphModel }