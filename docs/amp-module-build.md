# AMP Module Build

## Explainer

ES Modules is an official, standardized module system for JavaScript. However, on the AMP Project and for many in the wider web community, they are also an inflection point for supported JavaScript features from user-agents that is declarative and well known. When a browser supports ES Modules we can infer it also supports other modern features that were implemented before ES Modules were introduced. These include classes, promises, async/await, css variables, custom elements, window.fetch, let/const, arrow functions, and Shadow DOM. Like others, we're using this signal to remove polyfills and leverage modern JavaScript syntax more closely mirroring our authored source. Even better, this output is significantly terser than our previous output (which was compiled to ~ECMAScript 5) and helps improve performance for all AMP Documents.

The [module/nomodule pattern](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/) is a way to load the modern "module" build of the AMP runtime in a way were there would still be a fallback "nomodule" build if the browser does not support ES Modules.

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

| IE/Edge | Firefox | Chrome | Safari  | fetches module | fetches nomodule | executes |      |
| :-----: | :-----: | :----: | :-----: | :------------: | :--------------: | :------: | ---- |
|   15-   |   59-   |  55-   |  10.0-  |       v        |        v         | nomodule | ❌   |
|   16    |         |        | 10.1/3  |       v        |        v         |  module  | ❌   |
|  17-18  |         |        |         |    double!     |        v         |  module  | ❌❌ |
|         |         | 56-60  |         |                |        v         | nomodule | ✅   |
|         |   60+   |  61+   | 11.0+\* |       v        |                  |  module  | ✅   |

Summary:

-   ✅ no browser does double execution (provided [the Safari hack](https://gist.github.com/samthor/64b114e4a4f539915a95b91ffd340acc))
-   ✅ modern Chrome and Firefox never fetch more than necessary
-   ⚠ Safari <11 may or may not double fetch (even with the hack); it does not on small test pages, but in real complex pages it does (it seems deterministic, but not clear what's the exact trigger)
-   ⚠ Safari 11+ may still double fetch in some cases (see https://bugs.webkit.org/show_bug.cgi?id=194337)
-   ❌ pre-2018 browsers do double fetches
-   ❌❌ latest Edge does triple fetch (2x module + 1x nomodule)

The AMP Project recommends applying the module/nomodule pattern for Google Chrome, Microsoft Edge >= 79, Safari >= 11, and Firefox >= 60.

For other user-agents, we recommend sticking with the traditional single script loading model as part of our standard boilerplate.

Specifically, this will help avoid the double or triple fetching issues (denoted by an ❌in the table above).

## High Level Detailed Difference in Output

We use the [babel preset-env plugin](https://babeljs.io/blog/2020/03/16/7.9.0) with `{bugfixes: true}` enabled to support module builds.

At a high level we now avoid compiling the following in the AMP "module" output:

-   classes
-   arrow functions
-   async/await
-   Object and Array spreads
-   Array destructuring

We Also remove the following polyfills:

-   document.contains
-   DOMTokenList
-   window.fetch
-   Math.sign
-   Object.assign
-   Object.values
-   Promises
-   Array.includes
-   CSS.escape()

## Report a bug

[File an issue](https://github.com/ampproject/amphtml/issues/new?assignees=&labels=Type%3A+Bug&template=bug-report.yml) if you find a bug in AMP. Provide a detailed description and steps for reproducing the bug; screenshots and working examples that demonstrate the problem are appreciated!
