<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# CORS Requests in AMP

Many AMP components and extensions take advantage of remote endpoints by using
Cross-Origin Resource Sharing (CORS) requests.  This document explains the key
aspects of using CORS in AMP.  To learn about CORS itself, see the
[W3 CORS Spec](https://www.w3.org/TR/cors/).

<div class="noshowtoc">

* [Why do I need CORS for my own origin?](#why-do-i-need-cors-for-my-own-origin-)
* [Utilizing cookies for CORS requests](#utilizing-cookies-for-cors-requests)
* [CORS security in AMP](#cors-security-in-amp)
    * [Verify CORS requests](#verify-cors-requests)
      - [1) Allow requests for specific CORS origins](#1-allow-requests-for-specific-cors-origins)
      - [2) Allow same-origin requests](#2-allow-same-origin-requests)
      - [3) Restrict requests to source origins](#3-restrict-requests-to-source-origins)
    + [Send CORS response headers](#send-cors-response-headers)
        * [Access-Control-Allow-Origin: &lt;origin&gt;](#access-control-allow-origin-origin)
        * [AMP-Access-Control-Allow-Source-Origin: &lt;source-origin&gt;](#amp-access-control-allow-source-origin-source-origin)
        * [Access-Control-Expose-Headers: AMP-Access-Control-Allow-Source-Origin](#access-control-expose-headers-amp-access-control-allow-source-origin)
    + [Processing state changing requests](#processing-state-changing-requests)
  * [Example walkthrough: Handing CORS requests and responses](#example-walkthrough-handing-cors-requests-and-responses)
  * [Testing CORS in AMP](#testing-cors-in-amp)

</div>

## Why do I need CORS for my own origin?

You might be confused as to why you'd need CORS for requests to your own origin,
let's dig into that.

AMP components that fetch dynamic data (e.g., amp-form, amp-list, etc.) make
CORS requests to remote endpoints to retrieve the data.  If your AMP page
includes such components, you'll need to handle CORS so that those requests do
not fail.

Let's illustrate this with an example:

Let's say you have an AMP page that lists products with prices. To update the
prices on the page, the user clicks a button, which retrieves the latest prices
from a JSON endpoint (done via the amp-list component). The JSON is on your
domain.

Okay, so the page is *on my domain* and the JSON is *on my domain*.  I see no
problem!

Ah, but how did your user get to your AMP page?  Is it a cached page they
access? It's quite likely that your user did not access your AMP page directly,
but instead they discovered your page through another platform. For example,
Google Search uses the Google AMP Cache to render AMP pages quickly; these are
cached pages that are served from the Google AMP Cache, which is a *different*
domain. When your user clicks the button to update the prices on your page, the
cached AMP page sends a request to your origin domain to get the prices, which
is a mismatch between origins (cache -> origin domain). To allow for such
cross-origin requests, you need to handle CORS, otherwise, the request fails.

<amp-img alt="CORS and Cache" layout="responsive" src="https://amp.dev/static/img/docs/CORS_with_Cache.png" width="809" height="391">
  <noscript>
    <img alt="CORS and Cache" src="https://amp.dev/static/img/docs/CORS_with_Cache.png" />
  </noscript>
</amp-img>

**Okay, what should I do?**

1.  For AMP pages that fetch dynamic data, make sure you test the cached version
    of those pages; *don't just test on your own domain*. (See [Testing CORS in AMP](#testing-cors-in-amp) section below)
2.  Follow the instructions in this document for handling CORS requests and
    responses.


## Utilizing cookies for CORS requests

Most AMP components that use CORS requests either automatically set the
[credentials mode](https://fetch.spec.whatwg.org/#concept-request-credentials-mode)
or allow the author to optionally enable it. For example, the
[`amp-list`](https://amp.dev/documentation/components/amp-list)
component fetches dynamic content from a CORS JSON endpoint, and allows the
author to set the credential mode through the `credentials` attribute.

*Example: Including personalized content in an amp-list via cookies*

```html
<amp-list credentials="include"
    src="<%host%>/json/product.json?clientId=CLIENT_ID(myCookieId)">
  <template type="amp-mustache">
    Your personal offer: ${{price}}
  </template>
</amp-list>
```

By specifying the credentials mode, the origin can include cookies in the CORS
request and also set cookies in the response (subject to
[third-party cookie restrictions](#third-party-cookie-restrictions)).

### Third-party cookie restrictions

The same third-party cookie restrictions specified in the browser also apply to
the credentialed CORS requests in AMP. These restrictions depend on the browser
and the platform, but for some browsers, the origin can only set cookies if the
user has previously visited the origin in a 1st-party (top) window. Or, in other
words, only after the user has directly visited the origin website itself. Given
this, a service accessed via CORS cannot assume that it will be able to set
cookies by default.

## CORS security in AMP

To ensure valid and secure requests and responses for your AMP pages, you must:

1. [Verify the request](#verify-cors-requests).
2. [Send the appropriate response headers](#send-cors-response-headers).

If you're using Node in your backend, you can use the [AMP CORS middleware](https://www.npmjs.com/package/amp-toolbox-cors), which is part of the [AMP Toolbox](https://github.com/ampproject/amp-toolbox).

### Verify CORS requests

When your endpoint receives a CORS request:

1. [Verify that the CORS <code>Origin</code> header is an allowed origin (publisher's origin + AMP caches)](#verify-cors-header).
2.  [If there isn't an Origin header, check that the request is from the same origin (via `AMP-Same-Origin`)](#allow-same-origin-requests).
3.  [If the request is a state change (e.g., POST), check that the origin is from the source origin (via `__amp_source_origin`)](#restrict-requests-to-source-origins).


#### 1) Allow requests for specific CORS origins
<span id="verify-cors-header"></span>

CORS endpoints receive the requesting origin via the `Origin` HTTP header.
Endpoints should only allow requests from: (1) the publisher's own origin; and
(2) every `cacheDomain` origin listed in <https://cdn.ampproject.org/caches.json>.

For example, endpoints should allow requests from:
  *  Google AMP Cache subdomain: `https://<publisher's domain>.cdn.ampproject.org` <br>(for example, `https://nytimes-com.cdn.ampproject.org`)
  *  Cloudflare AMP Cache: `https://<publisher's domain>.amp.cloudflare.com`

{% call callout('Read on', type='read') %}
For information on AMP Cache URL formats, see these resources:
- [Google AMP Cache Overview](https://developers.google.com/amp/cache/overview)
- [Cloudflare AMP Cache](https://amp.cloudflare.com/)
{% endcall %}


#### 2) Allow same-origin requests
<span id="allow-same-origin-requests"></span>

For same-origin requests where the `Origin` header is missing, AMP sets the
following custom header:

```text
AMP-Same-Origin: true
```

This custom header is sent by the AMP Runtime when an XHR request is made on
the same origin (i.e., document served from a non-cache URL). Allow requests
that contain the `AMP-Same-Origin:true` header.

#### 3) Restrict requests to source origins
<span id="restrict-requests-to-source-origins"></span>

In all fetch requests, the AMP Runtime passes the `"__amp_source_origin"` query
parameter, which contains the value of the source origin (for example,
`"https://publisher1.com"`).

To restrict requests to only source origins, check that the value of the
`"__amp_source_origin"` parameter is within a set of the Publisher's own
origins.

### Send CORS response headers

After verifying the CORS request, the resulting HTTP response must contain the following headers:

##### Access-Control-Allow-Origin: &lt;origin&gt;

This header is a <a href="https://www.w3.org/TR/cors/">W3 CORS Spec</a> requirement, where <code>origin</code> refers to the requesting origin that was allowed via the CORS <code>Origin</code> request header (for example, <code>"https://&lt;publisher's subdomain>.cdn.ampproject.org"</code>).

Although the W3 CORS spec allows the value of <code>*</code> to be returned in the response, for improved security, you should:


* If the `Origin` header is present, validate and echo the value of the <code>`Origin`</code> header.
* If the `Origin` header isn't present, validate and echo the value of the <code>"__amp_source_origin"</code>.

##### AMP-Access-Control-Allow-Source-Origin: &lt;source-origin&gt;

This header allows the specified <code>source-origin</code> to read the authorization response. The <code>source-origin</code> is the value specified and verified in the <code>"__amp_source_origin"</code> URL parameter (for example, <code>"https://publisher1.com"</code>).

##### Access-Control-Expose-Headers: AMP-Access-Control-Allow-Source-Origin

This header simply allows the CORS response to contain the <code>AMP-Access-Control-Allow-Source-Origin</code> header.</dd>

### Processing state changing requests

{% call callout('Important', type='caution') %}
Perform these validation checks *before* you process the request. This validation helps to provide protection against CSRF attacks, and avoids processing untrusted sources requests.
{% endcall %}


Before processing requests that could change the state of your system (for
example, a user subscribes to or unsubscribes from a mailing list), check the
following:

**If the `Origin` header is set**:

1.  If the origin does not match one of the following values, stop and return an error
    response:
    - `*.ampproject.org`
    - `*.amp.cloudflare.com`
    - the publisher's origin (aka yours)

    where `*` represents a wildcard match, and not an actual asterisk ( * ).

2.  If the value of the `__amp_source_origin` query parameter is not the
    publisher's origin, stop and return an error response.
3.  If the two checks above pass, process the request.

**If the `Origin` header is NOT set**:

1.  Verify that the request contains the `AMP-Same-Origin: true` header. If the
    request does not contain this header, stop and return an error response.
2.  Otherwise, process the request.

## Example walkthrough: Handing CORS requests and responses

There are two scenarios to account for in CORS requests to your endpoint:

1.  A request from the same origin.
2.  A request from a cached origin (from an AMP Cache).

Let's walk though these scenarios with an example. In our example, we manage the `example.com` site that hosts an AMP page named `article-amp.html.`The AMP page contains an `amp-list` to retrieve dynamic data from a `data.json` file that is also hosted on `example.com`.  We want to process requests to our `data.json` file that come from our AMP page.  These requests could be from the AMP page on the same origin (non-cached) or from the AMP page on a different origin (cached).

<amp-img alt="CORS example" layout="fixed" src="https://amp.dev/static/img/docs/cors_example_walkthrough.png" width="629" height="433">
  <noscript>
    <img alt="CORS example" src="https://amp.dev/static/img/docs/cors_example_walkthrough.png" />
  </noscript>
</amp-img>

### Allowed origins

Based on what we know about CORS and AMP (from [Verify CORS requests](#verify-cors-requests) above), for our example we will allow requests from the following domains:

* `example.com` ---  Publisher's domain
* `example-com.cdn.ampproject.org` --- Google AMP Cache subdomain
* `example.com.amp.cloudflare.com`--- Cloudflare AMP Cache subdomain
* `cdn.ampproject.org` --- Google's legacy AMP Cache domain

### Response headers for allowed requests

For requests from the allowed origins, our response will contain the following headers:

```text
Access-Control-Allow-Origin: <origin>
AMP-Access-Control-Allow-Source-Origin: <source-origin>
Access-Control-Expose-Headers: AMP-Access-Control-Allow-Source-Origin
```

These are additional response headers we might include in our CORS response:

```text
Access-Control-Allow-Credentials: true
Content-Type: application/json
Access-Control-Max-Age: <delta-seconds>
Cache-Control: private, no-cache
```

### Pseudo CORS logic

Our logic for handling CORS requests and responses can be simplified into the following pseudo code:

```text
IF CORS header present
   IF origin IN allowed-origins AND sourceOrigin = publisher
      allow request & send response
   ELSE
      deny request
ELSE
   IF "AMP-Same-Origin: true"
      allow request & send response
   ELSE
      deny request
```

#### CORS sample code

Here's a sample JavaScript function that we could use to handle CORS requests and responses:

```javascript
function assertCors(req, res, opt_validMethods, opt_exposeHeaders) {
  var unauthorized = 'Unauthorized Request';
  var origin;
  var allowedOrigins = [
     "https://example.com",
     "https://example-com.cdn.ampproject.org",
     "https://example.com.amp.cloudflare.com",
     "https://cdn.ampproject.org" ];
  var allowedSourceOrigin = "https://example.com";  //publisher's origin
  var sourceOrigin = req.query.__amp_source_origin;


  // If same origin
  if (req.headers['amp-same-origin'] == 'true') {
      origin = sourceOrigin;
  // If allowed CORS origin & allowed source origin
  } else if (allowedOrigins.indexOf(req.headers.origin) != -1 &&
      sourceOrigin == allowedSourceOrigin) {
      origin = req.headers.origin;
  } else {
      res.statusCode = 401;
      res.end(JSON.stringify({message: unauthorized}));
      throw unauthorized;
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Expose-Headers',
      ['AMP-Access-Control-Allow-Source-Origin']
          .concat(opt_exposeHeaders || []).join(', '));
  res.setHeader('AMP-Access-Control-Allow-Source-Origin', sourceOrigin);

}
```

**Note**: For a working code sample, see [app.js](https://github.com/ampproject/amphtml/blob/master/build-system/app.js#L1199).

### Scenario 1:  Get request from AMP page on same origin

In the following scenario, the `article-amp.html` page requests the `data.json` file; the origins are the same.

<amp-img alt="CORS example - scenario 1" layout="fixed" src="https://amp.dev/static/img/docs/cors_example_walkthrough_ex1.png" width="657" height="155">
  <noscript>
    <img alt="CORS example" src="https://amp.dev/static/img/docs/cors_example_walkthrough_ex1.png" />
  </noscript>
</amp-img>

If we examine the request, we'll find:

```text
Request URL: https://example.com/data.json?__amp_source_origin=https%3A%2F%2Fexample.com
Request Method: GET
AMP-Same-Origin: true
```

As this request is from the same origin, there is no `Origin` header but the custom AMP request header of `AMP-Same-Origin: true` is present.  In the request URL, we can find the source origin through the `__amp_source_origin` query parameter.  We can allow this request as it's from the same origin.

Our response headers would be:

```text
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: https://example.com
Access-Control-Expose-Headers: AMP-Access-Control-Allow-Source-Origin
AMP-Access-Control-Allow-Source-Origin: https://example.com
```

### Scenario 2:  Get request from cached AMP page

In the following scenario, the `article-amp.html` page cached on the Google AMP Cache requests the `data.json` file; the origins differ.

<amp-img alt="CORS example - scenario 2" layout="fixed" src="https://amp.dev/static/img/docs/cors_example_walkthrough_ex2.png" width="657" height="155">
  <noscript>
    <img alt="CORS example" src="https://amp.dev/static/img/docs/cors_example_walkthrough_ex2.png" />
  </noscript>
</amp-img>

If we examine this request, we'll find:

```text
Request URL: https://example.com/data.json?__amp_source_origin=https%3A%2F%2Fexample.com
origin: https://example-com.cdn.ampproject.org
Request Method: GET
```

As this request contains an `Origin` header, we'll verify that it's from an allowed origin.  In the request URL, we can find the source origin through the `__amp_source_origin` query parameter.  We can allow this request as it's from an allowed origin.

Our response headers would be:

```text
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: https://example-com.cdn.ampproject.org
Access-Control-Expose-Headers: AMP-Access-Control-Allow-Source-Origin
AMP-Access-Control-Allow-Source-Origin: https://example.com
```

## Testing CORS in AMP

When you are testing your AMP pages, make sure to include tests from the cached versions of your AMP pages.

### Verify the page via the cache URL

To ensure your cached AMP page renders and functions correctly:

1.  From your browser, open the URL that the AMP Cache would use to access your AMP page. You can determine the cache URL format from this [tool on AMP By Example](https://ampbyexample.com/advanced/using_the_google_amp_cache/).

    For example:
    * URL: `https://amp.dev/documentation/guides-and-tutorials/start/create/basic_markup`
    * AMP Cache URL format: `https://www-ampproject-org.cdn.ampproject.org/c/s/www.ampproject.org/docs/tutorials/create.html`

1.  Open your browser's development tools and verify that there are no errors and that all resources loaded correctly.

### Verify your server response headers

You can use the `curl` command to verify that your server is sending the correct HTTP response headers.  In the `curl` command, provide the request URL and any custom headers you wish to add.

**Syntax**:  `curl <request-url> -H <custom-header> - I`

For CORS requests in AMP, be sure to add the  `__amp_source_origin=` query parameter to the request URL, which emulates what the AMP system does.

#### Test request from same origin

In a same-origin request, the AMP system adds the custom `AMP-Same-Origin:true` header.

Here's our curl command for testing a request from `https://ampbyexample.com` to the `examples.json` file (on the same domain):

```shell
curl 'https://ampbyexample.com/json/examples.json?__amp_source_origin=https%3A%2F%2Fampbyexample.com' -H 'AMP-Same-Origin: true' -I
```

The results from the command show the correct response headers (note: extra information was trimmed):

```text
HTTP/2 200
access-control-allow-headers: Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token
access-control-allow-credentials: true
access-control-allow-origin: https://ampbyexample.com
amp-access-control-allow-source-origin: https://ampbyexample.com
access-control-allow-methods: POST, GET, OPTIONS
access-control-expose-headers: AMP-Access-Control-Allow-Source-Origin
```

#### Test request from cached AMP page

In a CORS request not from the same domain (i.e., cache), the `origin` header is part of the request.

Here's our curl command for testing a request from the cached AMP page on the Google AMP Cache to the `examples.json` file:

```shell
curl 'https://ampbyexample.com/json/examples.json?__amp_source_origin=https%3A%2F%2Fampbyexample.com' -H 'origin: https://ampbyexample-com.cdn.ampproject.org' -I
```

The results from the command show the correct response headers:

```text
HTTP/2 200
access-control-allow-headers: Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token
access-control-allow-credentials: true
access-control-allow-origin: https://ampbyexample-com.cdn.ampproject.org
amp-access-control-allow-source-origin: https://ampbyexample.com
access-control-allow-methods: POST, GET, OPTIONS
access-control-expose-headers: AMP-Access-Control-Allow-Source-Origin
```
