# Error reporting in AMP

AMP reports 90% of errors to the endpoint specified by the `errorReportingUrl`
config property, with the remaining 10% reporting to the endpoint specified by
the `betaErrorReportingUrl` config. E.g. for `cdn.ampproject.org`

-   90%: `https://us-central1-amp-error-reporting.cloudfunctions.net/r`
-   10%: `https://us-central1-amp-error-reporting.cloudfunctions.net/r-beta`

The following fields are reported:

-   `v=string` - AMP version
-   `noamp={0,1}` - whether the document contains non-AMP JavaScript
-   `m=string` - the error message
-   `a={0,1}` - whether the error is labeled as "user" error (as opposed to a "dev" error).
-   `ex={0,1}` - whether the error is labeled as "expected".
-   `dw={0,1}` - whether the document is presented in a detached window (e.g., inside an iframe)
-   `3p={0,1}` - whether the error occurred in the 3p context.
-   At most one of the following:
    -   `sxg=1` - the runtime was build with the `--sxg` (Signed Exchanges) flag.
    -   `esm=1` - the runtime was build with the `--esm` (JavaScript Modules) flag.
    -   `3p=1` - the runtime is served from a third party.
-   `rt=string` - the runtime type.
-   `cdn=string` - the value of `cdnUrl` in the runtime configuration, or the value of the `runtime-host` meta tag if the former is undefined.
-   `adid=string` - _(`rt=inabox` only)_ the A4A ID.
-   `ca=1` - _(deprecated)_ whether this is a canary version of AMP.
-   `bt=string` - runtime release channel type.
-   `or=string` - _(optional)_ the ancestor origin if available.
-   `vs=string` - _(optional)_ the viewer's state.
-   `iem=1` - _(optional)_ whether this document is iframed.
-   `rvu=string` - _(optional)_ the viewer URL, provided by the viewer.
-   `mso=string` - _(optional)_ the messaging origin for viewer communication.
-   `exps=string` - _(optional)_ the defined experiments and whether they are turned on, in the format `expname=1,expname=0,expname=1`...
-   `el=string` - _(optional)_ the identifier/information on the associated DOM element.
-   `args=string` - _(optional)_ JSON.Stringified arguments associated with the error object.
-   `s=string` - _(optional)_ the error stack.
-   `f=string` - _(optional)_ the error's file name.
-   `l=number` - _(optional)_ the error's line number.
-   `c=number` - _(optional)_ the error's column number.
-   `r=string` - the document's referrer.
-   `ae=string` - accumulated/correlated error messages.
-   `fr=string` - the document's location fragment.
-   `pt=1` - _(optional)_ _internal implementation detail_

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
