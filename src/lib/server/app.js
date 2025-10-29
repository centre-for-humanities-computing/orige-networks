import appRootPath from "app-root-path";
import path from 'node:path';
import fs from 'node:fs';
import { Preprocessor } from "$lib/server/Preprocessor.js";
import * as privateEnvVars from '$env/static/private';
import Graph from "graphology";
import { GraphModel } from "$lib/server/GraphModel.js";

const DEVELOPMENT_MODE = privateEnvVars.NODE_ENV === 'development' || privateEnvVars.DEV_MODE === 'true';
const FORCE_RENDER = false;

const APP_ROOT_PATH = appRootPath.toString();
const APP_DATA_DIR = path.join(APP_ROOT_PATH, 'data');
const JSON_FILE_PATH = path.join(APP_DATA_DIR, 'references.json');

// Loads initial JSON data
let data = loadJSONData(JSON_FILE_PATH);

// Processes data from file to
let preprocessor = new Preprocessor();
const {
    nodes,
    edges,
    facets,
    errors
} = preprocessor.preprocess(data.entries);

if (DEVELOPMENT_MODE && errors.length > 0) {
    const ERROR_FILE_PATH = privateEnvVars.ERROR_FILE_PATH;
    if (ERROR_FILE_PATH) {
        saveJSONData(ERROR_FILE_PATH, errors);
    }
}

let graphModel;

const GRAPH_FILE_PATH = privateEnvVars.GRAPH_FILE_PATH;
console.log(GRAPH_FILE_PATH);

// DEV MODE
if (DEVELOPMENT_MODE && GRAPH_FILE_PATH && !FORCE_RENDER) {
    try {
        if (fs.existsSync(GRAPH_FILE_PATH)) {
            console.log('Loading graph from existing file.');
            const graph = Graph.from(loadJSONData(GRAPH_FILE_PATH));
            graphModel = new GraphModel(graph, facets);
        } else {
            console.log('No existing file found. Creating new graph model.')
            graphModel = new GraphModel({ nodes, edges }, facets);
            graphModel.init({ calculateCentrality: 'degree' });

            saveJSONData(GRAPH_FILE_PATH, graphModel.graph)
        }
    } catch (err) {
        console.error('Something went wrong. Creating new graph.')
    }
} else {
    // PRODUCTION
    graphModel = new GraphModel({ nodes, edges }, facets);
    graphModel.init({ calculateCentrality: 'degree' });
}

console.log('---');
console.log('Web app is up and running! :-)');
console.log('---');

export { graphModel }

/**
 * Loads JSON from a file path
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

/**
 * Saves JSON data to a file path
 * @param {string} filePath
 * @param {*} data
 */
function saveJSONData(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}