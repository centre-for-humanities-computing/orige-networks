# Orige.net

This is web application for the Orige.net project.
- Project PI: Giovanni Hermanin De Reichenfeld (giovanni.hermanin@cas.au.dk)
- Project details: https://pure.au.dk/portal/da/projects/marie-sk%C5%82odowska-curie-project-scriptural-networks-digital-explor

## About the web application
The web application is a lightweight viewer of the literary references in Origen of Alexandria.
These references are modeled as a graph with two kinds of nodes:
1. Passages from Origen's works (blue), and
2. referenced theological works (brown).

References and quotations are modeled as edges in the graph.

The application has basic search and filter functionality based on free-text search,
`work`-based filtering, `doctrine` filtering, and `referenced works` filtering. 

### Technologies
The application is built as a pre-rendered, static site using Svelte, SvelteKit, and the static adapter (https://svelte.dev/docs/kit/adapter-static). The graph database is modeled using Graphology
(https://graphology.github.io/) and rendered with SigmaJS
(https://www.sigmajs.org/).

### Data and data processing
The web app requires a JSON file containing all entries that will be modeled in the graph: `./data/references.json`.
Each entry has the following properties: 
- `id: number` - an internal ID, e.g., `12`.
- `work: string` - The name of the individual work in which the quotation appears, e.g., `"Contra Celsum  (Cels.)"`.
- `reference: string` - The passage in which the quotation appears as work and paragraph, e.g., `"Cels. 1.4"`.
- `doctrines: string[]` - The doctrines that the passage treats, e.g., `["Redemption/Justification"]`.
- `quotations: string[]` - The works and passage(s) that are quoted in the passage, e.g., `["Exod 31:18"]`.
- `relatedQuotations: string[]` - Related quotations, e.g., `["Exod 32:19", "Exod 34:1", "Rom 2:15"]`.
- `_meta: { created: number, edited: number }` - Metadata about time of creation and editing of the entry.

On application start, all entries are parsed and analyzed to create a graph model in the following steps:
1. Each entry is transformed into a `Node` object and added to the graph model.
2. All `quotation` and `relatedQuotation` properties are transformed into `Node` objects and added to the graph model.
3. For each `quotation` and `relatedQuotation`, an `Edge` object is created and added to the graph model which goes from the entry to the (related) quotation.

### Client-side data
The following data is passed on to the client side on a page load:
- The `Graphology` instance
- A `facets` object containing information about possible filters
- A `Set` of all node ids (currently not used; might be removed later)

## Deployment
The application is built and rendered server-side to be deployed via GitHub Pages. Therefore, no other hosting is necessary.
To enable this, a deployment workflow for GitHub Actions is located in `./.github/workflows/deploy.yml`.

The deployment workflow will be triggered automatically on git tags to the repository in the form `vx.x.x`,
where `x` is one or more digits ([SemVer](https://semver.org/)). The workflow can also be triggered manually on the GitHub repository ("Actions" tab).

When triggered, the workflow builds the project and uploads the resulting build _artifact_ to the GitHub Page for the project.

## User guide
### Editing 'about' and 'glossaries'

These files are in a Markdown format
(https://www.markdownguide.org/). They can be found and edited as markdown-formatted text under `/lib/server/assets/`.