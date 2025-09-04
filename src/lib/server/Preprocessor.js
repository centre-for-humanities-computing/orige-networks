import {
    abbreviationToFullReference,
    stripParagraphFromAbbreviation
} from "$lib/utils/abbreviations.js";


class Preprocessor {
    #nodes = new Map();
    #edges = [];
    #facets = {
        works: new Map(),
        doctrines: new Map(),
        referencedWorks: new Map()
    }

    constructor() {
    }

    preprocess(entries) {
        let errors = [];

        for (let entry of entries) {
            this.#addNode(entry.id, entry.work, entry.reference, 'main');
            this.#addFilterFacet(this.#facets.works, entry.work);

            for (let quotation of [...entry.quotations, ...entry.relatedQuotations]) {
                const trimmedQuotation = quotation.trim();

                if (trimmedQuotation.length === 0) {
                    continue; // there seems to be quotations without data
                }

                const quotationId = trimmedQuotation;
                let { quotationWork, error } = this.#getWorkFromQuotationReference(trimmedQuotation);

                if (!error) {
                    this.#addNode(quotationId, quotationWork, quotation, 'quotedWork');
                    this.#addEdge(entry.id, quotationId, entry.doctrines);
                    this.#addFilterFacet(this.#facets.referencedWorks, quotationWork);
                } else {
                    errors.push({
                        type: 'quotation error',
                        entryID: entry.id,
                        error: quotation
                    })
                }
            }

            for (let doctrine of entry.doctrines) {
                this.#addFilterFacet(this.#facets.doctrines, doctrine);
            }
        }

        return {
            nodes: this.getAllNodes(),
            edges: this.getAllEdges(),
            facets: this.getAllFacets(),
            errors
        }
    }

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

    #addEdge(fromId, toId, doctrines) {
        this.#edges.push({
            fromId,
            toId,
            doctrines
        });
    }

    #addFilterFacet(filterType, key) {
        let prevCount = filterType.get(key) ?? 0;

        filterType.set(key, prevCount + 1);
    }

    #getWorkFromQuotationReference(reference) {
        let shortRef = stripParagraphFromAbbreviation(reference);
        let match = abbreviationToFullReference.get(shortRef)

        let error = false;

        if (!match) {
            console.log('error with ref "' + reference + '"');
            error = true;
        }
        return { match, error };
    }

    getAllNodes() {
        return Array.from(this.#nodes.values());
    }

    getAllEdges() {
        return this.#edges;
    }

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