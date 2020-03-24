# AMP Module Build

## Explainer

ES Modules or ECMAScript Modules (sometimes shortened to "ESM") is a collection
of features in modern JavaScript such as support for importing and exporting
variables, functions, etc. from one module to another. When a browser supports
ECMAScript Modules this also means that it supports features that were
implemented before ECMAScript modules such as native Promises, async/await,
css variables, custom elements, window.fetch, let/const,
arrow functions, and Shadow DOM. This allows us to remove polyfills and use
modern JavaScript syntax which is usually terser than ES5 which in turn will
impact the size of the JavaScript we serve to the client.

The module/nomodule pattern as it is called is a way to load the new modern
"module" build of the AMP runtime in a way were there would still be a fallback
"nomodule" build if the browser does not support ES Modules.

The HTML markup would look like:

```html
<script type="module" async src="https://www.ampproject.org/v0.mjs"></script>
<script nomodule async src="https://www.ampproject.org/v0.js"></script>
```

## Recommended Browser Support for Module build

There are some idiosyncrasies to how the module/nomodule pattern is loaded in
different browsers so we must take care in selecting the browsers we apply the
module/nomodule pattern.

Some AMP environments such as a normal web page, or an AMP story page may be
OK with "double fetching" where the browser will request both the module and
nomodule build, but environments like AMP for Ads are more sensitive to
additional request and might not be OK with the double fetching.

The Original documentation/source for the table and summary below can be found [here](https://gist.github.com/jakub-g/5fc11af85a061ca29cc84892f1059fec).

|IE/Edge|Firefox|Chrome|Safari |fetches module|fetches nomodule|executes|    |
|:-----:|:-----:|:----:|:-----:|:------------:|:--------------:|:------:|----|
|  15-  |  59-  |  55- |10.0-  |      v       |        v       |nomodule|❌  |
|  16   |       |      |10.1/3 |      v       |        v       |module  |❌  |
| 17-18 |       |      |       |  double!     |        v       |module  |❌❌|
|       |       |56-60 |       |              |        v       |nomodule|✅  |
|       |  60+  |  61+ |11.0+* |      v       |                |module  |✅  |

Summary:
- ✅ no browser does double execution (provided [the Safari hack](https://gist.github.com/samthor/64b114e4a4f539915a95b91ffd340acc))
- ✅ modern Chrome and Firefox never fetch more than necessary
- ⚠ Safari <11 may or may not double fetch (even with the hack); it does not on small test pages, but in real complex pages it does (it seems deterministic, but not clear what's the exact trigger)
- ⚠ Safari 11+ may still double fetch in some cases (see https://bugs.webkit.org/show_bug.cgi?id=194337)
- ❌ pre-2018 browsers do double fetches
- ❌❌ latest Edge does triple fetch (2x module + 1x nomodule)

The Google AMP Cache currently only applies the module/nomodule pattern to
Google Chrome, Microsoft Edge, Safari >= 11, and Firefox >= 60.

We currently do not recomment applying the module/nomodule pattern to browsers
that double or triple fetch (denoted by ❌ in the table above) in environments
like AMP for Ads.

## High Level Detailed Difference in Output

We use the [babel preset-modules plugin](https://github.com/babel/preset-modules)
to support module builds.

At a high level we we try and preserve and not transpile the following in the
AMP source:
- classes
- arrow functions
- async/await
- Object and Array spreads
- Array destructuring

We Also remove the following polyfills:
- document.contains
- DOMTokenList
- window.fetch
- Math.sign
- Object.assign
- Object.values
- Promises
- Array.includes

## Report a bug

[File an issue](https://github.com/ampproject/amphtml/issues/new?assignees=&labels=Type%3A+Bug&template=bug-report.md&title=) if you find a bug in AMP. Provide a detailed description and steps for reproducing the bug; screenshots and working examples that demonstrate the problem are appreciated!

