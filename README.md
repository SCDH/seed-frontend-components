# SEED Frontend Components

A collection of [web
components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
for building frontends for electronic editions.

Developing web components does not entail a decision to use a certain
JS framework. They are framework-agnostic.  They can even be
integrated in Imperia or other CMSs.

## List of Web Components

- `<seed-synopsis>`: a container in a synopsis setup
- `<seed-synopsis-text>`: an single HTML text in a `<iframe>` element
  with synoptical features
- `<seed-transform-rest>`: transform XML input (or other format) to
  HTML (or other format) using a RESTful webservice implementing the
  [*Transformation API*](transformation-api.md).
- `<seed-transform-sef>`: transform XML input with XSLT compiled to
  SEF, running in the browser only.
- `<seed-transform-form>`: a generic web form for choosing
  transformations, input documents and runtime parameters manually by
  the user before passing it down to either `<seed-transform-rest>` or
  `<seed-transform-sef>`
- `<seed-download-link>`: a consumer of the transformation result from
  `<seed-transform-rest>` or `<seed-transform-sef>`


## Usage Examples

See the  [*example web pages*](#example-web-pages) section below.

There's also a list of real-world [*use cases*](#use-cases) below.

## Installation

Install from the [npm registry](-/packages/6733)! The NPM package
contains the components in the `src` folder, but neither the index
page nor the `examples`.

### Registry set up

Put this into your packages [`.npmrc`](https://docs.npmjs.com/cli/v9/configuring-npm/npmrc):

```shell
# 805 is the group ID of SCDH toplevel group
@scdh:registry=https://zivgitlab.uni-muenster.de/api/v4/projects/805/packages/npm/
```

Downstream packages should always use the 805 as project ID.

Reason: This package has dependencies on other packages prefixed with
`@scdh` in the SCDH toplevel group. By using the toplevel group ID,
npm will be forwarded to the right projects by gitlab.


### Install

```shell
npm i @scdh/seed-frontend-components
```

## Development

Run a development server, accessible through `http://localhost:5173`:

```shell
npm run dev
```

This will serve pages like `index.html`.

Run tests:

```shell
npm run test
```
### Example Web Pages

Running the [development server](#development) will bring up several
pages with usage examples. They are contained in the
[`examples`](examples) folder.

- [`examples/xslt-rest.html`](examples/xslt.html) shows how to use the
  web components for running XSL transformations on a service
  implementing the [`Transformation API`](transformation-api.js). The
  example page expects a service listening on `localhost:8080`. The
  central component for transforming is just
  `<seed-transform-rest>`. The containing elements are for generating
  the form around it and for passing the user input to the component.

- [`examples/xslt-sef.html`](examples/sef.html) shows how to use the
  components for running XSL transformations in the browser using
  [SaxonJS](https://www.saxonica.com/saxon-js/documentation2/index.html#!about). All
  the resources under the `transformation-api` subfolder belong to
  this page: They implement the [`Transformation
  API`](transformation-api.md) as static resources. XSLT must be
  compiled to
  [SEF](https://www.saxonica.com/saxon-js/documentation2/index.html#!about)
  files. You can use
  [oXygen](https://www.oxygenxml.com/doc/versions/25.1/ug-editor/topics/compile-xsl-for-saxon-x-tools.html)
  for compilation. This example page is almost the same as
  `examples/xslt-rest.html`, except the `<seed-transform-sef>`
  component which uses `SaxonJS` as a transformation engine instead of
  a web service.

- [examples/synopsis.html](examples/synopsis.html) shows how to use
  the web components for presenting several texts in parallel or
  synoptically. The presented files need some internal JS to make the
  synchronized scrolling work.


## Design Principles / Contributing

1. Follow the **events up; properies down** principle.

1. Write components the [Lit](https://lit.dev/docs/) way.

1. Prefer TS over JS.

1. Do not configure the TS compiler to be tolerant when type checking.

## Further Reading

- [Lit documentation](https://lit.dev/docs/)

- [Vite guide](https://vitejs.dev/guide/)

## Use Cases

- [Jiob Frontend](https://zivgitlab.uni-muenster.de/SCDH/schnocks-ijob/hiob-synopsis-frontend)
