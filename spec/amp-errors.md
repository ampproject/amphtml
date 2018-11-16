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

# Error reporting in AMP

AMP reports errors to the endpoint specified by the `errorReportingUrl` config
property. E.g. `https://amp-error-reporting.appspot.com/r` for `cdn.ampproject.org`.

The following fields are reported:

- `v=string` - AMP version
- `m=string` - the error message
- `a=1` - whether the error is labeled as "user" error (as opposed to a "dev" error).
- `ex=1` - whether the error is labeled as "expected".
- `3p=1` - whether the error occured in the 3p context.
- `ca=1` - whether this is a canary version of AMP.
- `or=string` - the ancestor origin if available.
- `iem=1` - whether this document is iframed.
- `rvu=string` - the viewer URL, provided by the viewer.
- `mso=string` - the messaging origin for viewer communication.
- `el=string` - the identifier/information on the associated DOM element.
- `s=string` - the error stack.
- `f=string` - the error's file name.
- `l=number` - the error's line number.
- `c=number` - the error's column number.
- `r=string` - the document's referrer.
- `ae=string` - accumulated/correlated error messages.
- `fr=string` - the document's location fragment.

## "Expected" errors

The "expected" errors are marked with `&ex=1`.

An expected error is identified by the `.expected` property on the `Error` object being `true`.
You can use the `Log.prototype.expectedError` method to create an error that is marked
as expected.

An "expected" error is still an error, i.e. some features are disabled or not
functioning fully because of it. However, it's an expected error. E.g. as is the
case with some browser API missing (storage).

Thus, the error can be classified differently by log aggregators. The main goal
is to monitor that an "expected" error doesn't deteriorate over time. It's
impossible to completely eliminate it.
