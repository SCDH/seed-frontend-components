# Transformation API

The web components `<seed-transform-*>` are clients of a RESTful
webservice implementing *Transformation API*. It is specified by the
[SEED XML
Transformer](https://zivgitlab.uni-muenster.de/search?search=seed+xml+transformer&search_code=true&scope=projects),
which is also its reference implementation: [TransformationAPI OpenAPI
specs](https://zivgitlab.uni-muenster.de/SCDH/tei-processing/seed-xml-transformer/-/blob/master/api/src/main/openapi/xml_transformer.yaml?ref_type=heads)

The web components do not talk to the *Transformer API* directly, but
via an NPM package implementing an axios-based typescript client,
called
[@scdh/seed-xml-transformer-ts-client](https://zivgitlab.uni-muenster.de/SCDH/tei-processing/seed-xml-transformer/-/packages/6784).

The web component `<seed-transform-rest>` does the actual work, i.e.,
it makes a POST request sending the source document (or its URI) and
runtime parameters to the RESTful API's
`/transform/{transformationID}` resource.

The web components offering forms just grep information from
`/transform/{transformationID}/info` and
`/transform/{transformationID}/parameters`, which are read-only
resources on the API.


## Transformer API and SaxonJS

Instead of requesting the service to transform a source document on
`/transform/{transformationID}`, an XSLT transformation can also be
run inside the browser using
[SaxonJS](https://www.saxonica.com/saxon-js/documentation2/index.html). In
this case, the XSL stylesheet has to be compiled to the SEF format.

The web component `<seed-transform-sef>` behaves exactly like
`<seed-transform-rest>` expect that it does not request the RESTful
webservice to do the transformation, but it gets the compiled
stylesheet from it and runs the transformation inside the browser.

With `<seed-transform-sef>` the *Transformation API* can omit
`/transform/{transformationID}` resources and provide
`/transform/{transformationID}/transformation.sef` instead, which
sends back the compiled stylesheet in SEF format.

This variant of the *Transformation API* can be implemented on a
static web server like github pages or gitlab pages, since only JSON
and SEF files have to be returned on requests.

The [`examples/transformation-api`](examples/transformation-api)
directory provides such a read-only SEF variant of the *Transformation
API*.
