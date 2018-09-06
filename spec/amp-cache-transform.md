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

AMP Caches may impose additional constraints not yet specified. For instance,
they may require the origin to apply [AMP
transforms](amp-cache-modifications.md), and may only accept specific versions
of those transforms.

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

## Header syntax

The header value is a [parameterised list from header-structure-07](https://tools.ietf.org/html/draft-ietf-httpbis-header-structure-07#section-3.3).

## Server behavior

The list represents an ordered set of constraints. The server should respond
with an SXG variant matching the first parameterised identifier that it can
satisfy. If it cannot satisfy any of them, then it should respond with non-SXG
content.

For each identifier:

 1. If the identifier contains any parameters, then this identifier cannot be
    satisfied. The server should attempt to match the next one. (This reserves
    the parameter space for future additional constraints to be defined.)
 2. If the identifier is `any`, then the SXG is not intended for a particular
    prefetching intermediary, and therefore its subresource URLs needn't be (but
    may be) rewritten.
 3. Otherwise, if the identifier is an `id` from the list in
    [caches.json](../caches.json), then the SXG should have its subresource URLs
    rewritten. That `id`'s corresponding `cacheDomain` indicates the
    fully-qualified domain name that forms the basis for the URL rewrites.
 4. Otherwise, the identifier is invalid and cannot be satisfied. The server
    should attempt to match the next one.

If the server content-negotiates on `AMP-Cache-Transform`, it must include
`Vary: AMP-Cache-Transform` in all responses, whether signed or unsigned.

### URL rewrites

The exact set of rewrites is not yet fully specified; a few
[examples](amp-cache-modifications.md#user-content-cache-urls)
are available, and a [reference implementation](https://github.com/ampproject/amppackager)
will soon be available. In the interim, the Google AMP Cache will not require
any rewrites (and, as a result, will not prefetch any subresources).

## Caching proxy behavior

An intermediary proxy may choose to cache these SXG responses and serve them to
future requestors. Strict adherence to
[Vary](https://tools.ietf.org/html/rfc7234#section-4.1) would mean that, e.g. a
response to a request containing `AMP-Cache-Transform: any` would not match a
response to a request containing `AMP-Cache-Transform: google, any`, since the
two requests are not semantically equivalent. However, this would lead to
unnecessary duplication in the cache, as the former response obviously can serve
the latter response.

If the proxy can ensure that a cached response satisfies a new request (either
because the new request is a superset of the cached request, or through some
unspecified examination of the response), then it can serve that response.

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
