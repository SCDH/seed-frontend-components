# The `filter` Endpoint of the `searchApi` Slice

The filter endpoint is required, albeit it sends exactly the same
query as the `documents` endpoint.

Here is the reason:

The setup of the facets - making up the list of terms for every
facet - must be as the effect of a processed query. For the empty
search string, i.e., getting all documents, we get all the facet terms
in a facet. For a certain search string, the facets terms must be
reduced to the ones that are still present in the result set.

When a facet filter is activated, the result set must be reduced, but
the *all* the currrent facet terms must stay in place *unchanged*.

So we have to be able to distinguish search events, that effect

1. the result set and the set of facet terms
2. the result set only, but not the set of facet terms

So:

- `documents` -> 1
- `filters` -> 2

You can try a setup, where only the `documents` entpoint is used: It's
on the `no-filter-endpoint` branch. You can observe, how the facets
get re-arranged on every facet action – too bad!

So having two endpoints that do exactly the same internally, is for
hooking effects to their fulfilled matchers in different contexts,
i.e., view components.


## Alternatives

An alternative would be evaluating, if a facet filter was applied in
the search query. However, there is not really a clear criterion,
because for case 1 above we have the need to set both, the result set
and the set of terms. So, presence of facet terms is not a criterion.
