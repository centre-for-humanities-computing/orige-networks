import forceAtlas2 from 'graphology-layout-forceatlas2'
import random from 'graphology-layout/random';

class GraphView {
    static COLORS = {
        PRIMARY: '#76b5c5',
        SECONDARY: '#eab676',
        HIGHLIGHT: '#C8553D',
        FADE: '#D3D3D3',
        DEFAULT: '#21130d'
    }

    static SIZE = {
        MIN: 5,
        MAX: 15
    }

    static LAYOUT = {
        ITERATIONS: 50,
        GRAVITY: 10
    }

    #graph;

    constructor(graph) {
        this.#graph = graph;
    }

    init(randomized = true) {
        if (randomized) {
            random.assign(this.#graph);
        }

        forceAtlas2.assign(this.#graph, {
            iterations: GraphView.LAYOUT.ITERATIONS,
            settings: {
                gravity: GraphView.LAYOUT.GRAVITY
            }
        });
    }

    getDefaultXPos() {
        return Math.random();
    }

    getDefaultYPos() {
        return Math.random();
    }

    getNodeColorFromType(type) {
        if (type === 'main') {
            return GraphView.COLORS.PRIMARY;
        } else if (type === 'quotedWork') {
            return GraphView.COLORS.SECONDARY;
        }
        return GraphView.COLORS.DEFAULT;
    }

    getNodeSizeFromType(id, type) {
        if (type === 'quotedWork') {
            return clamp(this.#graph.degree(id), GraphView.SIZE.MIN, GraphView.SIZE.MAX);
        }
        return GraphView.SIZE.MIN;
    }
}

function clamp(num, min, max) {
    if (num <= min) {
        return min;
    }
    if (num >= max) {
        return max;
    }
    return num;
}

export { GraphView }