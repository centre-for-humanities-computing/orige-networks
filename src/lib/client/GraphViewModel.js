class GraphViewModel {
    graph;
    #facets;

    constructor(graph, facets){
        this.graph = graph;
        this.#facets = facets;
    }

    getAllIDs() {
        return this.graph.nodes;
    }

    getFacets() {
        return this.#facets;
    }

    search(query, filters) {
        let trimmedQueryStr = query.trim();

        let results;

        if (trimmedQueryStr.length === 0 && filters.length === 0) {
            results = this.graph.nodes();
        } else {
            results = this.graph.filterNodes((key, attributes) => {
                return !!this.#nodeMatchesQueryString(trimmedQueryStr, attributes.data);
            })
        }

        return {
            resultSet: new Set(results),
            // facets
        }
    }

    #nodeMatchesQueryString(str, data) {
        return data.work?.indexOf(str) !== -1 || data.reference?.indexOf(str) !== -1;
    }

    getDetailsFromNodeId(id) {
        let result = this.graph.getNodeAttribute(id, 'data');

        if (!result) {
            return null;
        }


    }

    getNeighborsFromNodeId(id, degree) {

    }

    getDoctrinesFromNodeId (id) {
    }

    getMetadataForDataset() {
        return {
            totalNodes: this.graph.nodes().length,
            totalEdges: this.graph.edges().length
        }
    }
}

export { GraphViewModel }