import {bfsFromNode} from 'graphology-traversal/bfs';

class GraphViewModel {
    /**
     * @type {import('graphology').default}
     */
    graph;

    /**
     * @type {FacetListObject}
     */
    #facets;

    /**
     * Creates a new instance
     * @param {import('graphology').default} graph
     * @param {FacetListObject} facets
     */
    constructor(graph, facets){
        this.graph = graph;
        this.#facets = facets;
    }

    /**
     * Returns a set of all node IDs
     * @return {Set<string>}
     */
    getNodeIDSet() {
        return new Set(this.graph.nodes());
    }

    /**
     * Returns all facets
     * @return {FacetListObject}
     */
    getFacets() {
        return this.#facets;
    }

    /**
     * Performs a search in the graph data
     * @param {string} query - A query string
     * @param {Filter[]} filters - A list of applied filters
     * @return {{ resultSet: Set<string> }}
     */
    search(query, filters) {
        let trimmedQueryStr = query.trim();

        let results = new Set(this.graph.nodes());

        if (trimmedQueryStr.length > 0) {
            let searchResults = new Set(this.graph.filterNodes((key, attributes) => {
                return this.#nodeMatchesQueryString(trimmedQueryStr, attributes.data);
            }));
            results = results.intersection(searchResults);
        }

        if (filters.length > 0) {
            let filterResults = new Set(this.graph.filterNodes((key, attributes) => {
                return this.#nodeMatchesFilterList(key, filters);
            }));
            results = results.intersection(filterResults);
        }

        return {
            resultSet: results,
            // facets
        }
    }

    /**
     * Whether a node matches a query string. Search fields: 'work' and 'reference'
     * @param {string} str
     * @param {NodeObject} data
     * @return {boolean}
     */
    #nodeMatchesQueryString(str, data) {
        let lowerStr = str.toLowerCase();

        if (data.work && data.work.toLowerCase().indexOf(lowerStr) !== -1) {
            return true;
        }
        if (data.reference && data.reference.toLowerCase().indexOf(lowerStr) !== -1) {
            return true;
        }
        return false;
    }

    /**
     * Whether a node matches one or more filters in the list
     * @param {string} nodeID
     * @param {Filter[]} filters
     * @return {boolean}
     */
    #nodeMatchesFilterList(nodeID, filters) {
        let data = this.graph.getNodeAttribute(nodeID, 'data');

        for (let filter of filters) {
            if (this.#nodeMatchesFilter(nodeID, data, filter)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Whether a nodeID matches the given filter
     * @param {string} nodeID
     * @param {Entry} nodeData
     * @param {Filter} filter
     * @return {boolean}
     */
    #nodeMatchesFilter(nodeID, nodeData, filter) {
        if ((filter.type === 'work' || filter.type === 'reference') && nodeData.work === filter.value) {
            return true;
        }
        if (filter.type === 'doctrine' && this.#getDoctrinesFromNodeID(nodeID).includes(filter.value)) {
            return true;
        }
    }

    /**
     * Retrieves the title of the work (Origen or biblical) from the node ID
     * @param {string} nodeID
     * @return {string}
     */
    getWorkFromNodeID(nodeID) {
        let data = this.graph.getNodeAttribute(nodeID, 'data');
        return data.reference;
    }

    /**
     * Gets details about a single node
     * @param {string} nodeID
     * @return {{data: NodeObject, doctrines: string[], neighbors: Set<string>}}
     */
    getDetailsFromNodeID(nodeID) {
        let data = this.graph.getNodeAttribute(nodeID, 'data');
        let doctrines = this.#getDoctrinesFromNodeID(nodeID);
        let neighbors = new Set(this.#getNeighborsFromNodeID(nodeID));

        return {
            data,
            doctrines,
            neighbors
        }
    }

    /**
     * Gets all neighbors belonging to the node
     * @param {string} nodeID
     * @return {string[]}
     */
    #getNeighborsFromNodeID(nodeID) {
        return this.graph.neighbors(nodeID);
    }

    /**
     * Gets all nodes within N degrees of the starting node.
     * Starting node = 0, direct neighbors = 1, etc.
     * @param {string} nodeID
     * @param {number} maxDegree
     * @return {Set<string>} - A set of node IDs
     */
    getNDegreeNeighborsFromNodeID(nodeID, maxDegree = 1) {
        let results = new Set();

        bfsFromNode(this.graph, nodeID, function (node, attr, depth) {
            results.add(node);
            return depth >= maxDegree;
        });

        return results;
    }

    /**
     * Retrieves a list of unique doctrines associated with a given node
     * @param {string} nodeID
     * @return {string[]}
     */
    #getDoctrinesFromNodeID(nodeID) {
        let allDoctrines = this.graph.mapEdges(nodeID, (edge, attr) => {
            return attr.data.doctrines;
        }).flat();

        let uniqueDoctrines = new Set(allDoctrines);
        return Array.from(uniqueDoctrines);
    }

    /**
     * Returns metadata about the full dataset
     * @return {{ totalNodes: number, totalEdges: number }}
     */
    getMetadataForDataset() {
        return {
            totalNodes: this.graph.nodes().length,
            totalEdges: this.graph.edges().length
        }
    }
}

export { GraphViewModel }