import forceAtlas2 from 'graphology-layout-forceatlas2'
import random from 'graphology-layout/random';

/**
 * A semi-static class for setting up view configuration for the graph model
 */
class GraphView {
    /**
     * @readonly
     * @enum {string}
     */
    static COLORS = {
        PRIMARY: '#76b5c5',
        SECONDARY: '#eab676',
        HIGHLIGHT: '#C8553D',
        FADE: '#D3D3D3',
        DEFAULT: '#21130d'
    }

    /**
     * @readonly
     * @enum {number}
     */
    static SIZE = {
        MIN: 5,
        MAX: 15
    }

    /**
     * @readonly
     * @enum {number}
     */
    static LAYOUT = {
        ITERATIONS: 500,
        GRAVITY: 12
    }

    /** @type {import('graphology').default} */
    #graph;

    /**
     * A new instance
     * @param {import('graphology').default} graph
     */
    constructor(graph) {
        this.#graph = graph;
    }

    /**
     * Inits the graph view using default layout configuration
     * @param {boolean} randomized - Whether to randomize the initial layout before applying force
     * @param {boolean} inferSettings - Whether to let Graphology infer ForceAtlas2 settings from graph
     */
    init(randomized = true, inferSettings = true) {
        if (randomized) {
            console.log('Assigning random starting positions for nodes.');
            random.assign(this.#graph);
        }

        console.log('Calculating positions based on ForceAtlas2 algorithm');
        if (inferSettings) {
            console.log('Inferring settings from graph data...')
            const inferredSettings = forceAtlas2.inferSettings(this.#graph);
            forceAtlas2.assign(this.#graph, {
                iterations: GraphView.LAYOUT.ITERATIONS,
                settings: inferredSettings
            })
        } else {
            console.log('Using default settings...')
            forceAtlas2.assign(this.#graph, {
                iterations: GraphView.LAYOUT.ITERATIONS,
                settings: {
                    gravity: GraphView.LAYOUT.GRAVITY
                }
            });
        }

    }

    /**
     * Returns a default x position
     * @return {number}
     */
    getDefaultXPos() {
        return Math.random();
    }

    /**
     * Returns a default y position
     * @return {number}
     */
    getDefaultYPos() {
        return Math.random();
    }

    /**
     * Gets the corresponding color for a node type
     * @param {"main"|"quotedWork"} type
     * @return {GraphView.COLORS}
     */
    getNodeColorFromType(type) {
        if (type === 'main') {
            return GraphView.COLORS.PRIMARY;
        } else if (type === 'quotedWork') {
            return GraphView.COLORS.SECONDARY;
        }
        return GraphView.COLORS.DEFAULT; // fallback
    }

    /**
     * Gets the default node size from type
     * @param {string} id
     * @param {string} type
     * @param {function} ratio
     * @return {GraphView.SIZE|number}
     */
    getNodeSizeFromType(id, type, ratio = null) {
        if (type === 'quotedWork') {
            if (ratio) {
                return mapRange(ratio, GraphView.SIZE.MIN, GraphView.SIZE.MAX)
            } else {
                return clamp(this.#graph.degree(id), GraphView.SIZE.MIN, GraphView.SIZE.MAX);
            }
        }
        return GraphView.SIZE.MIN;
    }
}

/**
 * A utility function to clamp a number between min and max
 * @param {number} num
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function clamp(num, min, max) {
    if (num <= min) {
        return min;
    }
    if (num >= max) {
        return max;
    }
    return num;
}

function mapRange(ratio, toMin, toMax) {

    return (toMax - toMin) * ratio + toMin;
}

export { GraphView }