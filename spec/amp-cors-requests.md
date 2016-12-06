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

Many components and extensions in AMP take advantage of remote endpoints using CORS requests. For more detail
on CORS see [CORS Spec](https://www.w3.org/TR/cors/). This spec explains some of the key aspects of using CORS
in AMP.

## CORS and Cookies

Most of components that use CORS requests in AMP also either automatically set credentials mode or allow the
author to optionally enable it. The credentials mode sends origin cookies in the CORS request and it will also
allow the origin to set cookies in response (subject to 3rd-party cookie restrictions). The origin, however,
must enable credentials mode on the server side using `Access-Control-Allow-Credentials: true` response header.

### 3rd-Party Cookie Restrictions

The normal browser 3rd-party cookie restrictions apply to the credentialed CORS requests. These restrictions depend
on the browser and the platform, but for some browsers, the origin can only set cookies if the user has previously
visited the origin in a 1st-party (top) window. Or, in other words, only after the user has directly visited the
origin website itself. Given this, a service accessed via CORS cannot assume that it will be able to set cookies
by default.

## CORS Security in AMP

This security protocol consists of three components: `AMP-Same-Origin`, CORS origin and source origin restrictions.

CORS endpoints receive requesting origin via "Origin" HTTP header. This header has to be restricted to only allow the following origins:
 - *.ampproject.org
 - *.amp.cloudflare.com
 - The Publisher’s own origins

If `Origin` header is missing, AMP will set `AMP-Same-Origin: true` custom header. If this header is set it indicates the request is coming from same origin. And should, as rule, be allowed.

Source origin restrictions has to be implemented by requiring "__amp_source_origin" URL parameter to be within a set of the Publisher's own origins. The "__amp_source_origin" parameter is passed from AMP Runtime in all fetch requests and contains the source origin, e.g. "https://publisher1.com".

The resulting HTTP response has to also contain the following headers:
 - `Access-Control-Allow-Origin: <origin>`. Here "origin" refers to the requesting origin that was allowed via "Origin" request header above. Ex: "https://cdn.ampproject.org". This is a CORS spec requirement. Notice that while CORS spec allows the value of '\*' to be returned in this header, AMP strongly discourages use of '\*'. Instead the value of the "Origin" header should be validated and echoed for improved security.
 - `AMP-Access-Control-Allow-Source-Origin: <source-origin>`. Here "source-origin" indicates the source origin that is allowed to read the authorization response as was verified via "__amp_source_origin" URL parameter. Ex: "https://publisher1.com".
 - `Access-Control-Expose-Headers: AMP-Access-Control-Allow-Source-Origin`. This header simply allows CORS response to contain the "AMP-Access-Control-Allow-Source-Origin" header.

#### Note on State Changing Requests
When making requests that would change the state of your system (e.g. user subscribes to or unsubscribes from a mailing list), make sure to check the following:

If `Origin` header is set:

1. If the origin was not `*.ampproject.org`, `*.amp.cloudflare.com` or the publisher's (aka your) origin, stop and return an error response.
2. Check the `__amp_source_origin` query parameter. If it's not the publisher's origin stop and return an error response.
3. If both checks pass, proceed to process the request.

Otherwise, if `Origin` header is NOT set:

1. Check if the request has `AMP-Same-Origin: true` header. If not, stop and return an error response.
    * This custom request header is sent by AMP runtime when making an XHR request on sameorigin (document served from non-cache URL).
2. Otherwise proceed to process the request.

It's very important that these all are done first before processing the request, this provides protection against CSRF attacks and avoids processing untrusted sources requests.
