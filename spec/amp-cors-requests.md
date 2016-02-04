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

## CORS Security in AMP

This security protocol consists of two components: CORS origin and source origin restrictions.

CORS endpoints receive requesting origin via "Origin" HTTP header. This header has to be restricted to only allow the following origins:
 - *.ampproject.org
 - The Publisher’s own origins

Source origin restrictions has to be implemented by requiring "__amp_source_origin" URL parameter to be within a set of the Publisher's own origins. The "__amp_source_origin" parameter is passed from AMP Runtime in all fetch requests and contains the source origin, e.g. "https://publisher1.com".

The resulting HTTP response has to also contain the following headers:
 - `Access-Control-Allow-Origin: <origin>`. Here "origin" refers to the requesting origin that was allowed via "Origin" request header above. Ex: "https://cdn.ampproject.org". This is a CORS spec requirement.
 - `AMP-Access-Control-Allow-Source-Origin: <source-origin>`. Here "source-origin" indicates the source origin that is allowed to read the authorization response as was verified via "__amp_source_origin" URL parameter. Ex: "https://publisher1.com".
 - `Access-Control-Expose-Headers: AMP-Access-Control-Allow-Source-Origin`. This header simply allows CORS response to contain the "AMP-Access-Control-Allow-Source-Origin" header.
