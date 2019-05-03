# `AMP-Cache-Transform` HTTP request header

## Problem

The [Signed Exchanges](https://wicg.github.io/webpackage/draft-yasskin-http-origin-signed-responses.html)
(**SXG**) spec introduces a [new format](https://wicg.github.io/webpackage/draft-yasskin-http-origin-signed-responses.html#application-signed-exchange)
for delivery of web content. AMP's [use of SXG](https://amphtml.wordpress.com/2018/01/09/improving-urls-for-amp-pages/)
requires additional information to enable proper content negotation on a URL.

### "Understands" vs "Prefers"

This format should be sent in two cases:

  * delivery from origin server to intermediary
  * delivery from intermediary to user

Ideally, it would *not* be sent in direct delivery from origin server to user,
as that would best be served by a traditional HTTP exchange (e.g. requiring less
computational overhead, and able to modify state).

Therefore, the need arises for the origin to distinguish requests from users and
requests from SXG intermediaries. That is, there is a difference between "I can
understand the SXG format" and "I prefer an SXG if available". `Accept:
application/signed-exchange` indicates the former. No currently-defined header
indicates the latter.

### Target-specific constraints

AMP SXG are intended for [privacy-preserving
prefetch](https://wicg.github.io/webpackage/draft-yasskin-webpackage-use-cases.html#private-prefetch)
from a referring page (such as a Google Search results page) to a coordinating
AMP cache (such as the Google AMP Cache). If the referrer wishes to prefetch
subresources as well, they must also be served from a coordinating AMP cache, in
order to preserve privacy. In order for those subresources to be *useful*, they
must be referenced by the signed HTML page.

Therefore, the requestor of an SXG may require the origin to produce an SXG
tailored to the AMP Cache that is requesting it, by rewriting its subresource
URLs appropriately.

AMP caches may may require the origin to apply [AMP
transforms](amp-cache-modifications.md), and may only accept specific versions
of those transforms. This allows the AMP cache to:

  1. Make continuous improvements to the AMP transforms and the transformed AMP
     validation code.
  2. Try to satisfy [AMP's design principles](https://amp.dev/about/how-amp-works),
     especially as deficiencies in the transforms are found, by guaranteeing
     that its cache of SXGs don't contain those deficiencies.
  3. Keep its validation code of bounded complexity, by not needing to validate
     all possible versions of the transforms.
  4. Guarantee that all responses it fetches from publishers are useful, and
     don't require a second fetch for unsigned content.

## Solution

The presence of the `AMP-Cache-Transform` header indicates that the requestor
would prefer an `application/signed-exchange` variant of the resource at the
given URL, but would accept a non-SXG variant. If a requestor sends this, it
should also explicitly include the relevant
`application/signed-exchange;v=something` in its `Accept` header, so that the
responder knows which versions of the SXG standard are supported by the
requestor.

The value of the header indicates target-specific constraints on the transformed
AMP within the SXG. If a server is unable to meet those constraints, it should
respond with non-SXG (unsigned) AMP, as the AMP Cache will need to apply those
transforms itself, and thus be unable to use the provided signature.

If the server responds with an SXG, it should include an `AMP-Cache-Transform`
*outer* response header, specifying which of the alternatives it chose to
satisfy. This allows intermediary caching proxies to cache responses with
minimal understanding of the underlying format.

## Header syntax

The header value is a [parameterised list from header-structure-07](https://tools.ietf.org/html/draft-ietf-httpbis-header-structure-07#section-3.3).

## Server behavior

### Request header

The list represents an ordered set of constraints. The server should respond
with an SXG variant matching the first parameterised identifier that it can
satisfy. If it cannot satisfy any of them, then it should respond with non-SXG
content.

For each identifier:

 1. If the identifier contains a `v` parameter, then its value represents a set
    of AMP transform versions. The server should respond with an SXG only if it
    can produce one of the versions in that set (see [Version negotation](#version-negotiation)).
 2. If the identifier contains any parameters besides those mentioned above,
    then this identifier cannot be satisfied. The server should attempt to match
    the next one. (This reserves the parameter space for future additional
    constraints to be defined.)
 3. If the identifier is `any`, then the SXG is not intended for a particular
    prefetching intermediary, and therefore its subresource URLs needn't be (but
    may be) rewritten.
 4. Otherwise, if the identifier is an `id` from the list in
    [caches.json](../caches.json), then the SXG should have its subresource URLs
    rewritten. That `id`'s corresponding `cacheDomain` indicates the
    fully-qualified domain name that forms the basis for the URL rewrites.
 5. Otherwise, the identifier is invalid and cannot be satisfied. The server
    should attempt to match the next one.

The server should ensure its copy of `caches.json` is no more than 60 days
out-of-date with the canonical linked above.

#### Version negotation

This section uses the ABNF rules of
[RFCF5234](https://tools.ietf.org/html/rfc5234), augmented with the list
extension defined in [RFC7230 section 7](https://tools.ietf.org/html/rfc7230#section-7),
the OWS rule from [RFC7230 section 3.2.3](https://tools.ietf.org/html/rfc7230#section-3.2.3),
and the "sh-" rules in [header-structure-07](https://tools.ietf.org/html/draft-ietf-httpbis-header-structure-07).

The `v` parameter value must be a string. Its value (after parsing as a string)
must conform to the following ABNF:

```
v_spec = #v_range
v_range = sh-integer / sh-integer OWS ".." OWS sh-integer
```

If the contents of the parameter string fail to parse as `v_spec` , then the
server should fail to satisfy this parameterised identifier, but should not
immediately fail the entire parameterised list.

There are additional semantic constraints on the spec:
 * Each `sh-integer` must be non-negative.
 * Two integers in a pair `X..Y` must satisfy `X<=Y`.
 * No two ranges in a spec should intersect. (`A..B` and `C..D` intersect if
   `B >= C && A <= D`.)

If the parameter fails to meet these criteria, then the server may choose not to
satisfy the parameterised identifier. Otherwise, the server can satisfy the
identifier if any of the following is true for any `v_range` in the list:

 1. The `v_range` is a single integer, and the server can produce exactly that
    version.
 2. The `v_range` is a pair of integers `x..y`, and the server can produce a
    version in the closed interval _[x, y]_.

If the server can respond with multiple versions in the set, it should respond
with the highest version it can produce, but may respond with older versions in
that set if other reasons dictate it (e.g. cache efficiency).

If the server does not know what version of the transforms it provides, then it
cannot satisfy any `v_spec`.

### Response header

If the server responds with an SXG, it should include an `AMP-Cache-Transform`
outer response header, with a value equal to the most specific constraint that
it can satisfy -- that is, a list of size 1. For now, that means:

 1. If it rewrote subresource URLs for a particular cache, the identifier should
    be the id of the cache.
 2. Otherwise, the identifier should be `any`.
 3. It should have a `v` parameter whose value is the AMP transform version it
    responded with.

### `Vary` header

For a given URL, if the server content-negotiates on `AMP-Cache-Transform`, it
must include `Vary: AMP-Cache-Transform` in all responses, whether signed or
unsigned.

Note that this also likely means it's negotiating on `Accept`, so it should
include `Vary: Accept` in these cases, too. The high-entropy nature of `Accept`
causes cache fragmentation in default setups; publishers may wish to configure
caches under their control to convert incoming `Accept` headers into
lower-entropy forms, e.g. by performing the content negotiation (using
hard-coded knowledge about what variants are available at a given URL) and
including only the negotiated media-type, without q-values. The publisher may
also specify
[Variants](https://httpwg.org/http-extensions/draft-ietf-httpbis-variants.html)
to aid caching proxies that understand that header.

### URL rewrites

The exact set of rewrites is not yet fully specified; a few
[examples](amp-cache-modifications.md#user-content-cache-urls)
are available, and a [reference implementation](https://github.com/ampproject/amppackager)
will soon be available. In the interim, the Google AMP Cache will not require
any rewrites (and, as a result, will not prefetch any subresources).

The list of rewrites is limited to base URLs within `caches.json` in order to
provide the publisher some assurance that the rewritten subresources are
faithful representations of the original subresources.

For the sake of security, all script source URLs will need to be on
`cdn.ampproject.org`, regardless of the target AMP cache. This provides the
publisher additional assurance that the JS is not an arbitrary payload. It would be
nice to get rid of this dependency; something like [signature-based
SRI](https://github.com/mikewest/signature-based-sri) might be feasible.

## Interaction with content negotation

If the URL serves multiple variants, and is thus subject to [HTTP proactive
negotation](https://tools.ietf.org/html/rfc7231#section-3.4.1), then
`AMP-Cache-Transform` should only take effect after proactive negotiation has
selected a resource of content type `application/signed-exchange`. In theory,
there may be an interaction with content negotation. For instance, assume the
request is:

```
Accept-Language: en, de
AMP-Cache-Transform: google
```

and the server can only deliver a resource of `de`+`google` or `en`+`cloudflare`.
In this case, content negotiation may select `en`, and then
`AMP-Cache-Transform` negotiation would see that the constraint cannot be
satisfied. In practice, it is expected that this will not happen. Servers should
avoid such pessimizing interactions with HTTP content negotiation, by being able
to serve SXGs on all variants of an AMP URL.

## Caching proxy behavior

An intermediary proxy may choose to cache these SXG responses and serve them to
future requestors. Strict adherence to
[Vary](https://tools.ietf.org/html/rfc7234#section-4.1) would mean that, e.g. a
response to a request containing `AMP-Cache-Transform: any` would not match a
response to a request containing `AMP-Cache-Transform: google, any`, since the
two requests are not semantically equivalent. However, this would lead to
unnecessary duplication in the cache, as the former response obviously can serve
the latter response.

If the proxy can ensure that a cached response satisfies a new request, then it
can serve that response. It can do that by comparing the `AMP-Cache-Transform`
response header of the cached response to the `AMP-Cache-Transform` request
header of the new request. The response matches the request if there exists a
parameterised identifier `spec` in the request list for which all of the
following is true:

 1. Any of:
    1. `spec`'s identifier is `any`.
    2. `spec`'s identifier is identical to the response's identifier.
 2. Any of:
    1. `spec` does not include a `v` parameter.
    2. `spec`'s `v` parameter is a valid `v_spec`, the response has a `v`
       parameter (specifying a single version as per
       [above](#response-header)), and the response's `v` is an element of the
       request's `v`.
 3. `spec` does not include any parameter other than those mentioned above.

The above is merely informational; a cache may choose any strategy that doesn't
serve mismatched responses (i.e. obeys the "Server behavior" specification
above).

## Future work

As this defines a new content negotiation header field, we should ensure that it
meets the criteria set for integration with [HTTP
Variants](https://tools.ietf.org/html/draft-ietf-httpbis-variants-04#section-6).

## Alternatives considered

### q-values and media type parameters

Alternatively, one could use
[q-values](https://tools.ietf.org/html/rfc7231#section-5.3.1) for specifying
preference of `application/signed-exchange` over other variants, and [media type
parameters](https://tools.ietf.org/html/rfc7231#section-3.1.1.1) for specifying
target and version requirements. These are idiomatic applications of existing
syntaxes, but may come with some downsides. This is an area under investigation
and
[discussion](https://lists.w3.org/Archives/Public/ietf-http-wg/2019JanMar/0174.html);
feel free to get involved.

## Example

A requestor wishing to receive an SXG, without any constraints on its
subresource URLs, would send:

```
AMP-Cache-Transform: any
```

The responder may send an SXG with subresource URLs rewritten for a
particular cache or with the original subresource URLs, or a non-SXG response.

A requestor wishing to receive an SXG to be served from and prefetched from the
Google AMP Cache (e.g. [Googlebot](https://support.google.com/webmasters/answer/182072))
would send:

```
AMP-Cache-Transform: google
```

The responder must either send an SXG with subresource URLs rewritten for the
Google AMP Cache, or a non-SXG response.

A requestor wishing to receive transformed AMP of a specific version may send a
request like:

```
AMP-Cache-Transform: google;v="1..3,5"
```

The responder must either send an SXG with subresource URLs rewritten for the
Google AMP Cache and whose AMP transform version is 1, 2, 3, or 5, or else a
non-SXG response.
