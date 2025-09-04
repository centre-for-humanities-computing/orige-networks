import appRootPath from "app-root-path";
import path from 'node:path';
import fs from 'node:fs';
import { Preprocessor } from "$lib/server/Preprocessor.js";
import * as privateEnvVars from '$env/static/private';
import Graph from "graphology";
import { GraphModel } from "$lib/server/GraphModel.js";

const DEVELOPMENT_MODE = privateEnvVars.NODE_ENV === 'development' || privateEnvVars.DEV_MODE === 'true';
const FORCE_RENDER = true;

const APP_ROOT_PATH = appRootPath.toString();
const APP_DATA_DIR = path.join(APP_ROOT_PATH, 'data');
const JSON_FILE_PATH = path.join(APP_DATA_DIR, 'references.json');

// Loads initial JSON data
let data = loadJSONData(JSON_FILE_PATH);

let preprocessor = new Preprocessor();
let results = preprocessor.preprocess(data.entries);

const nodes = results.nodes;
const edges = results.edges;
const facets = results.facets;
const errors = results.errors;

if (errors.length > 0) {
    const ERROR_FILE_PATH = "/Users/au335497/Temp/orige-net/errors.json";
    saveJSONData(ERROR_FILE_PATH, errors);
}

let graphModel;

// DEV MODE
if (DEVELOPMENT_MODE && !FORCE_RENDER) {
    const GRAPH_FILE_PATH = "/Users/au335497/Temp/orige-net/graph.json"; // Change in prod.

    try {
        if (fs.existsSync(GRAPH_FILE_PATH)) {
            graphModel = Graph.from(loadJSONData(GRAPH_FILE_PATH));
        } else {
            graphModel = new GraphModel(nodes, edges, facets);
            graphModel.init();

            saveJSONData(GRAPH_FILE_PATH, graphModel.export())
        }
    } catch (err) {
        console.error('Something went wrong. Creating new graph.')
    }
} else {
    // PRODUCTION
    graphModel = new GraphModel(nodes, edges, facets);
    graphModel.init();
}

export { graphModel }

/**
 * Main data loader function
 * @param {string} filePath
 * @return {*}
 */
function loadJSONData(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

function saveJSONData(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}