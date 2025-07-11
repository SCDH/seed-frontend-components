# One-URL Principle

The same text always has to be presented on one and the same URL, no
matter how we get there, be it by navigating through collections or by
searching.

This is the **One-URL Principle**!

It's aim is to reduce redundancy to the outside world.

## Sources of Redundancy

APIs like
[DTS](https://distributed-text-services.github.io/specifications/) and
[TextAPI](https://textapi.sub.uni-goettingen.de/) allow to us to have
the same document (or manifest) in multiple collections. If the URL to
the document includes the collection identifier, this will lead to
redundancy to the outside world.

If a DSE is made accessible through navigating collections which leads
to `/api/<collection>/<text>` and through searching which leads to
`/search/details/<text>`, then the `<text>` is presented redundantly
to the outside world.


## Why Redundancy is Bad

- Communication
- Consigning annotations
