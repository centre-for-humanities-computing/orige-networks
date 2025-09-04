import { graphModel } from "$lib/server/app.js";

export function load() {
    return {
        serializedGraph: graphModel.graph.export(),
        allFacets: graphModel.getFacets()
    };
}