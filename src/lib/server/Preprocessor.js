import {
    abbreviationToFullReference,
    stripParagraphFromAbbreviation
} from "$lib/utils/abbreviations.js";

/**
 * @typedef Entry
 * @prop {string} work
 * @prop {string} reference
 * @prop {string[]} quotations
 * @prop {string[]} doctrines
 * @prop {string[]} relatedQuotations
 * @prop {{ created: number, edited: number }} _meta
 * @prop {number} id
 */

/**
 * @typedef NodeObject
 * @prop {string|number} id
 * @prop {work} id
 * @prop {string} reference
 * @prop {"main"|"quotedWork"} type
 */

/**
 * @typedef EdgeObject
 * @prop {string|number} fromId
 * @prop {string|number} toId
 * @prop {string[]} doctrines
 */

/**
 * @typedef FacetMapObject
 * @prop {Map<string, number>} works
 * @prop {Map<string, number>} referencedWorks
 * @prop {Map<string, number>} doctrines
 */

/** @typedef Facet
 * @prop {string} key
 * @prop {number} count
 */

/** @typedef FacetListObject
 * @prop {Facet[]} works
 * @prop {Facet[]} doctrines
 * @prop {Facet[]} quotedReferences
 * */

class Preprocessor {
    /** @type {Map<string|number, NodeObject>} */
    #nodes = new Map();

    /** @type {EdgeObject[]} */
    #edges = [];

    /** @type FacetMapObject */
    #facets = {
        works: new Map(),
        referencedWorks: new Map(),
        doctrines: new Map()
    }

    constructor() {
    }

    /**
     * Processes all entry objects from the JSON file
     * @param {Entry[]} entries
     * @return {{
     * nodes: NodeObject[],
     * edges: EdgeObject[],
     * facets: FacetListObject,
     * errors: { type: string, entryID: number, error: string }[]
     * }}
     */
    preprocess(entries) {
        /** @type {{ type: string, entryID: number, error: string }[] } */
        let errors = [];

        for (let entry of entries) {
            this.#addNode(entry.id, entry.work, entry.reference, 'main');
            this.#incrementFilterFacetByKey(this.#facets.works, entry.work);

            for (let quotation of [...entry.quotations, ...entry.relatedQuotations]) {
                const trimmedQuotation = quotation.trim();

                if (trimmedQuotation.length === 0) {
                    continue; // there seems to be quotations without data
                }

                const quotationId = trimmedQuotation;
                let { work, error } = this.#getWorkFromQuotationReference(trimmedQuotation);

                if (!error) {
                    this.#addNode(quotationId, work, quotation, 'quotedWork');
                    this.#addEdge(entry.id, quotationId, entry.doctrines);
                    this.#incrementFilterFacetByKey(this.#facets.referencedWorks, work);
                } else {
                    errors.push({
                        type: 'quotation error',
                        entryID: entry.id,
                        error: quotation
                    })
                }
            }

            for (let doctrine of entry.doctrines) {
                this.#incrementFilterFacetByKey(this.#facets.doctrines, doctrine);
            }
        }

        return {
            nodes: this.getAllNodes(),
            edges: this.getAllEdges(),
            facets: this.getAllFacets(),
            errors
        }
    }

    /**
     * Adds a new node object to the temporary mapping
     * @param {string|number} id
     * @param {string} work
     * @param {string} reference
     * @param {"main"|"quotedWork"} type
     */
    #addNode(id, work, reference, type) {
        let node = this.#nodes.get(id);
        if (!node) {
            this.#nodes.set(id, {
                id,
                work,
                reference,
                type
            });
        }
    }

    /**
     * Adds a new edge object to the temporary mapping
     * @param {string|number} fromId
     * @param {string|number} toId
     * @param {string[]} doctrines
     */
    #addEdge(fromId, toId, doctrines) {
        this.#edges.push({
            fromId,
            toId,
            doctrines
        });
    }

    /**
     * Increments the counter for a given facet filter type
     * @param {Map<string, number>} filterType
     * @param {string} key
     */
    #incrementFilterFacetByKey(filterType, key) {
        if (!filterType || !filterType instanceof Map) {
            return;
        }
        let prevCount = filterType.get(key) ?? 0;

        filterType.set(key, prevCount + 1);
    }

    /**
     * Gets full biblical reference work from abbreviated quotation reference
     * @param {string} reference
     * @return {{work: string, error: boolean}}
     */
    #getWorkFromQuotationReference(reference) {
        let shortRef = stripParagraphFromAbbreviation(reference);
        let work = abbreviationToFullReference.get(shortRef)

        let error = false;

        if (!work) {
            console.log('error with ref "' + reference + '"');
            error = true;
        }
        return { work, error };
    }

    /**
     * Returns all node objects as array
     * @return { NodeObject[] }
     */
    getAllNodes() {
        return Array.from(this.#nodes.values());
    }

    /**
     * Returns all edge objects
     * @return { EdgeObject[] }
     */
    getAllEdges() {
        return this.#edges;
    }

    /**
     * Gets all facets (as sorted arrays)
     * @return {FacetListObject}
     */
    getAllFacets() {
        let works = this.#getSortedFacetFilters(this.#facets.works);
        let doctrines = this.#getSortedFacetFilters(this.#facets.doctrines);
        let quotedReferences = this.#getSortedFacetFilters(this.#facets.referencedWorks);

        return {
            works,
            doctrines,
            quotedReferences
        }
    }

    /**
     * Sorts facet filter map by count and transforms to array
     * @param {Map<string, number>} filterType
     * @return { {key: string, count: number}[] }
     */
    #getSortedFacetFilters(filterType) {
        let res = [];
        for (let [key, value] of filterType) {
            res.push({
                key,
                count: value
            })
        }
        return res.sort((a, b) => b.count - a.count);
    }
}

export { Preprocessor }