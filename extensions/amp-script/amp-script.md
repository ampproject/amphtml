---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Runs custom JavaScript in a Web Worker.
---

## Usage

The `amp-script` component allows you to run custom JavaScript. To maintain AMP's performance guarantees, your code runs in a Web Worker, and certain restrictions apply.

### Virtual DOM

Your JavaScript can access the area of the page wrapped within the `<amp-script>` component. `amp-script` copies the component's children to a virtual DOM. Your code can access that virtual DOM as `document.body`.

For example, this `<amp-script>` component defines a DOM consisting of a single `<p>`.

```html
<amp-script src="http://example.com/my-script.js" width="300" height="100">
  <p>A single line of text</p>
</amp-script>
```

If your code appends an element to `document.body`:

```js
// my-script.js
const p = document.createElement('p');
p.textContent = 'A second line of text';
document.body.appendChild(p);
```

the new element will be placed after that `<p>`.

```html
<amp-script src="http://example.com/my-script.js" width="300" height="100">
  <p>A single line of text</p>
  <p>A second line of text</p>
</amp-script>
```

### Loading JavaScript

An `amp-script` element can load JavaScript in two ways:

-   remotely, from a URL
-   locally, from a `<script>` element on the page

#### From a remote URL

Use the `src` attribute to load JavaScript from a URL:

```html
<amp-script layout="container" src="https://example.com/hello-world.js">
  <button>Hello amp-script!</button>
</amp-script>
```

#### From a local element

You can also include your JavaScript inline, in a `script` tag. You must:

-   Set the `script` attribute of your `amp-script` to the local `script` element's `id`.
-   Include `target="amp-script"` in your `amp-script`.
-   Include `type="text/plain"` in your `script`. This way, the browser won't execute your script, allowing amp-script to control it.

```html
<!-- To use inline JavaScript, you must add a script hash to the document head. -->
<head>
  <meta
    name="amp-script-src"
    content="sha384-YCFs8k-ouELcBTgzKzNAujZFxygwiqimSqKK7JqeKaGNflwDxaC3g2toj7s_kxWG"
  />
</head>

...

<amp-script width="200" height="100" script="hello-world">
  <button>Hello amp-script!</button>
</amp-script>

<!-- Add [target="amp-script"] to the <script> element. -->
<script id="hello-world" type="text/plain" target="amp-script">
  const btn = document.querySelector('button');
  btn.addEventListener('click', () => {
    document.body.textContent = 'Hello World!';
  });
</script>
```

[tip type="default"]
For security reasons, `amp-script` elements with a `script` or cross-origin `src` attribute require a [script hash](#calculating-the-script-hash) in a `<meta name="amp-script-src" content="...">` tag. Also, same-origin `src` files must have [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type): `application/javascript` or `text/javascript`.

If your page contains multiple `amp-script` elements, each requiring a [script hash](#calculating-the-script-hash), include each as a whitespace-delimited list in a single `<meta name="amp-script-src" content="...">` tag (see [examples/amp-script/example.amp.html](https://github.com/ampproject/amphtml/blob/main/examples/amp-script/example.amp.html) for an example with multiple script hashes).
[/tip]

### How does it work?

`amp-script` runs your custom JavaScript in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers). Normally Web Workers don't have access to the DOM. But `amp-script` gives your code access to a virtual DOM. When your JavaScript modifies this virtual DOM, `amp-script` updates the real DOM.

Under the hood, `amp-script` uses [@ampproject/worker-dom](https://github.com/ampproject/worker-dom/). For design details, see the ["Intent to Implement" issue](https://github.com/ampproject/amphtml/issues/13471).

## Capabilities

### Supported APIs

DOM elements and their properties are generally supported, with a few limits. For example, your code can't add a new `<script>` or `<style>` tag to the DOM.

`amp-script` recreates many commonly used DOM APIs and makes them available to your code. This "hello world" example uses `getElementById()`, `addEventListener()`, `createElement()`, `textContent`, and `appendChild()`:

```js
const button = document.getElementById('textarea');

button.addEventListener('click', () => {
  const h1 = document.createElement('h1');
  h1.textContent = 'Hello World!';
  document.body.appendChild(h1);
});
```

Supported DOM APIs include:

-   Element getters like `getElementByName()`, `getElementsByClassName()`, `getElementsByTagName()`, `childNodes()`, `parentNode()`, and `lastChild()`
-   Mutators like `createTextNode()`, `appendChild()`, `insertBefore()`, `removeChild()`, and `replaceChild()`
-   Methods involving events like `addEventListener()`, `removeEventListener()`, and `createEvent()`
-   Property and attribute getters like `getAttribute()`, `hasAttribute()`
-   Event properties like `Event.target`, `Event.type`, and `Event.bubbles`
-   Element properties like `attributes`, `id`, `outerHTML`, `textContent`, `value`, `classList`, and `className`
-   And many more.

For a complete list of supported DOM APIs, see the [API compatibility table](https://github.com/ampproject/worker-dom/blob/main/web_compat_table.md).

`querySelector()` is supported for simple selectors - element, id, class, and attribute. So, `document.querySelector('.class')` will work, but `document.querySelector('.class1 .class2')` will not. [See the code](https://github.com/ampproject/worker-dom/blob/main/src/worker-thread/dom/Element.ts#L159) for details.

`amp-script` supports common Web APIs like `Fetch`, `WebSockets`, `localStorage`, `sessionStorage`, and `Canvas`. Presently, the `History` API is not implemented, and neither are cookies.

`amp-script` does not support the entire DOM API or Web API, as this would make `amp-script`'s own JavaScript too large and slow. If there's an API you'd like to see supported, please [file an issue](https://github.com/ampproject/amphtml/issues/new/choose) or [suggest and contribute the change yourself](https://github.com/ampproject/amphtml/blob/main/docs/contributing.md).

[tip type="default"]
For a set of samples showing `amp-script` in use, [see here](https://amp.dev/documentation/examples/components/amp-script/).
[/tip]

### Frameworks and libraries

Presently, libraries like [jQuery](https://jquery.com) will not work with `amp-script` without modification, as they use unsupported DOM APIs. However, [@ampproject/worker-dom](https://github.com/ampproject/worker-dom/) was designed to support the APIs that popular JavaScript frameworks use. `amp-script` has been tested with [React](http://reactjs.org/) and [Preact](https://preactjs.com/). To keep bundle sizes small, we recommend using Preact. Other frameworks may work but have not been thoroughly tested; if you're looking for support, please file an issue or contribute [here](https://github.com/ampproject/worker-dom/).

### Creating AMP elements

You can use `amp-script` to add an `amp-img` or `amp-layout` component to the DOM. Other AMP components are presently unsupported. If you need to create a different AMP element, please upvote on [&#35;25344](https://github.com/ampproject/amphtml/issues/25344) and add a comment describing your use case.

### Referencing amp-state

`amp-script` supports getting and setting [`amp-state`](https://amp.dev/documentation/components/amp-bind/#defining-and-initializing-state-with-<amp-state>) JSON. This lets `amp-script` interact with other AMP elements on the page via [`amp-bind` bindings](https://amp.dev/documentation/components/amp-bind/#bindings).

If you invoke `AMP.setState()` from `amp-script` after a user gesture, bindings can cause mutations to the DOM. Otherwise, state will be set, but binding will not occur (similar to [`amp-state` initialization](https://amp.dev/documentation/examples/components/amp-bind/?referrer=ampbyexample.com#initializing-state)). For more information, see [the section on user gestures](#user-gestures).

`AMP.setState()` works as described in the [`<amp-bind>` documentation](<https://amp.dev/documentation/components/amp-bind/#updating-state-variables-with-amp.setstate()>), merging an object literal into the specified state. This example shows how it can affect the DOM:

```html
<script id="myscript" type="text/plain" target="amp-script">
  const button = document.getElementsByTagName('button')[0];

  function changer() {
    AMP.setState({myText: "I have changed!"});
  }

  button.addEventListener('click', changer);
</script>

<amp-script layout="container" script="myscript">
  <p [text]="myText">Will I change?</p>
  <button>Change it!</button>
</amp-script>
```

`AMP.getState()` is asynchronous and returns a Promise. The promise resolves with the stringified value of the state variable it's passed. These examples demonstrate its use with different types:

```js
async function myFunction() {
  AMP.setState({'text': 'I am a string'});
  let text = await AMP.getState('text');

  AMP.setState({'number': 42});
  let number = Number(await AMP.getState('number'));

  AMP.setState({'obj': {'text': 'I am a string', 'number': 42}});
  let obj = JSON.parse(await AMP.getState('obj'));
}
```

Here's another example. `amp-state` doesn't support WebSocket URLs in its `src` attribute, but we can use `amp-script` to pass in data from a WebSocket.

```html
<amp-script width="1" height="1" script="webSocketDemo"> </amp-script>

<script type="text/plain" target="amp-script" id="webSocketDemo">
  const socket = new WebSocket('wss://websocket.example');
  socket.onmessage = event => {
    AMP.setState({socketData: event.data});
  };
</script>
```

[tip type="default"]
To use `AMP.setState()`, you must include the [`amp-bind`](https://amp.dev/documentation/components/amp-bind) extension script in the document head.
[/tip]

Note that if something else changes the DOM inside your `<amp-script>`, that change will not propagate to the virtual DOM. The syncing process is unidirectional. Thus it's best to avoid code like the following:

```html
<amp-script layout="container" script="myscript">
  <p [text]="myText">Will I change?</p>
</amp-script>
<button on="tap:AMP.setState({myText: 'I changed'})">
  Change this and amp-script won't know
</button>
```

### Retrieving data for `<amp-list>`

You may export a function to act as the data source for an [`<amp-list>`](https://amp.dev/documentation/components/amp-list/).
The exported function must return either JSON, or a Promise that resolves with JSON.

The export API is available on the global scope and has the following signature:

```js
/**
 * @param {string} name the name to identify the function by.
 * @param {Function} function the function to export.
 */
function exportFunction(name, function) {}
```

## Restrictions

In order to maintain AMP's guarantees of performance and layout stability, `amp-script` imposes some restrictions.

### Size of JavaScript code

`amp-script` has standards for the size of code:

-   Each inline script can contain up to 10,000 bytes
-   The scripts on a page can contain a total of up to 150,000 bytes
-   The scripts running in sandboxed mode on a page can contain a total of up to 300,000 bytes

### User gestures

In some cases, `amp-script` will not apply DOM changes triggered by your JavaScript code unless the code was triggered by a user gesture - say, a button tap. This helps keep [content layout shift](https://web.dev/cls/) from causing a poor user experience.

The rules are less restrictive for `amp-script` containers whose size cannot change. This is the case when the `layout` is not `container` and when the dimensions are specified in HTML. Let's call such containers "fixed-size". Containers whose size can change, we'll call "variable-sized".

Here are some examples of fixed-size containers:

<!-- prettier-ignore-start -->
```html
<amp-script layout="fill" height="300" width="500" script="myscript"></amp-script>

<amp-script layout="fixed-height" height="300" script="myscript" ></amp-script>
```

Here are some examples of variable-sized containers:

```html
<amp-script layout="responsive" script="myscript"></amp-script>

<amp-script layout="fixed" height="300" script="myscript"></amp-script>

<amp-script layout="container" height="300" width="500" script="myscript"></amp-script>
```
<!-- prettier-ignore-end -->

DOM changes are permitted as follows:

-   in **fixed-size containers**, your code can make any change at any time.
-   in **variable-size containers**, your code can only make a change after a user gesture. It then has 5 seconds to make changes. If your code makes one or more `fetch()`'s, it can continue to make changes until 5 seconds after the last `fetch()` completes.

<table>
  <tr>
   <td></td><td>fixed-size container</td><td>variable-size container</td>
  </tr>
  <tr>
   <td>change on page load</td><td>allowed anytime</td><td>not allowed</td>
  </tr>
  <tr>
   <td>change after user event</td><td>allowed anytime</td><td>allowed for 5 seconds + fetch()</td>
  </tr>
</table>

<!-- prettier-ignore-start -->
[tip type="default"]
[See here](https://amp.dev/documentation/guides-and-tutorials/learn/amp-html-layout/#layout) for more information about AMP's layout system.
[/tip]
<!-- prettier-ignore-end -->

## Calculating the script hash

Since custom JS run in `amp-script` is not subject to normal [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), you need to add a script hash:

-   for inline JavaScript
-   for JavaScript loaded from a cross-origin source

Include the script hash in a `meta[name=amp-script-src]` element in the document head. You need a hash for each script that's used by an `<amp-script>` component. Here are a few ways to build the hash:

-   If you omit the `<meta>` tag, AMP will output a console error containing the expected hash string. You can copy this to create the appropriate `<meta>` tag.
-   The [AMP Optimizer node module](https://www.npmjs.com/package/@ampproject/toolbox-optimizer) generates this hash and inserts the `<meta>` tag automatically.
-   Build it yourself, using the following steps:

1. Compute the SHA384 hash sum of the script's contents. This sum should be expressed in hexadecimal.
2. base64url-encode the result.
3. Prefix that with `sha384-`.

Here's how you calculate the hash in Node.js:

```js
const crypto = require('crypto');
const hash = crypto.createHash('sha384');

function generateCSPHash(script) {
  const data = hash.update(script, 'utf8');
  return (
    'sha384-' +
    data
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  );
}
```

The [@ampproject/toolbox-script-csp](https://www.npmjs.com/package/@ampproject/toolbox-script-csp) node module computes the hash as well.

This example shows how to use the script hash in HTML:

```html
<head>
  <!--
    A meta[name="amp-script-src"] element contains all script hashes for
    <amp-script> elements on the page, delimited by spaces.
  -->
  <meta
    name="amp-script-src"
    content="
      sha384-fake_hash_of_remote_js
      sha384-fake_hash_of_local_script
    "
  />
</head>
<body>
  <!--
    A "src" attribute with a cross-origin URL requires adding a script hash.

    If the hash of remote.js's contents is "fake_hash_of_remote_js",
    we'll add "sha384-fake_hash_of_remote_js" to the <meta> tag above.

-->
  <amp-script src="cross.origin/remote.js" layout="container"> </amp-script>

  <!--
    A "script" attribute also requires adding a script hash.

    If the hash of #myScript's text contents is "fake_hash_of_local_script",
    we'll add "sha384-fake_hash_of_local_script" to the <meta> tag above.
  -->
  <amp-script script="myScript" layout="container"> </amp-script>
  <script type="text/plain" target="amp-script" id="myScript">
    document.body.textContent += 'Hello world!';
  </script>
</body>
```

[tip type="default"]
During development, you can disable the JavaScript size and script hash requirements by adding a `data-ampdevmode` attribute to either the `amp-script` element or the root html node. Adding this attribute to the root html node will suppress all validation errors on the page. Adding it to the `amp-script` element will simply suppress errors about the size and the script hash.
[/tip]

## Attributes

### src

For executing remote scripts.

The URL of a JS file that will be executed in the context of this `<amp-script>`. The URL's protocol must be HTTPS. The HTTP response's `Content-Type` must be `application/javascript` or `text/javascript`.

### script

For executing local scripts.

The `id` of a `script[type=text/plain][target=amp-script]` element whose text content contains JS that will be executed in the context of this `<amp-script>`.

### sandbox

Applies extra restrictions to DOM that may be mutated by this `<amp-script>`. Similar to the `iframe[sandbox]` attribute, the value of the attribute can either be empty to apply all restrictions, or space-separated tokens to lift particular restrictions:

-   `allow-forms`: Allows [form elements](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements) to be created and modified. AMP requires special handling to prevent unauthorized state changing requests from user input. See amp-form's [security considerations](https://amp.dev/documentation/components/amp-form#security-considerations) for more detail.

### max-age

Requires the `script` attribute. This attribute is optional, but required for signed exchanges if `script` is specified.

The `max-age` attribute specifies the maximum lifetime in seconds the local script is allowed to be served from the time of [signed exchange (SXG)](https://amp.dev/documentation/guides-and-tutorials/optimize-and-measure/signed-exchange/) publishing. [AMP Packager](https://github.com/ampproject/amppackager) uses this value to compute the SXG `expires` time.

The value of `max-age` should be chosen carefully:

-   A longer `max-age` increases the potential security impact of a [SXG downgrade](https://wicg.github.io/webpackage/draft-yasskin-http-origin-signed-responses.html#seccons-downgrades).

-   A shorter `max-age` may prevent inclusion in AMP Caches that have a minimum SXG lifetime. For instance, the Google AMP Cache requires at least [4 days](https://github.com/ampproject/amppackager/blob/releases/docs/cache_requirements.md#google-amp-cache) (345600 seconds). Note that there's currently no reason to select `max-age` longer than 7 days (604800 seconds), due to the [maximum](https://wicg.github.io/webpackage/draft-yasskin-http-origin-signed-responses.html#name-signature-validity) set by the SXG spec.

If you don't publish signed exchanges, `max-age` does nothing.

### nodom

The optional `nodom` attribute optimizes `<amp-script>` for use as a data-layer rather than as a UI layer. It removes the ability for the `<amp-script>` to make DOM modifications, in favor of a signficantly smaller bundle size and therefore better performance. It also automatically hides the `<amp-script>`, so you may omit the height and width attributes.

### sandboxed

Note: Not to be confused with the **sandbox** attribute.

If set, this will signal that worker-dom should activate sandboxed mode. In this mode the Worker lives in its own crossorigin iframe, creating a strong security boundary. It also forces **nodom** mode. Because of the strong security boundary, sandboxed scripts do not need to provide a script hash.

### common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Errors and warnings

A few runtime errors may be encountered when using `amp-script`.

**The inline script is (...) bytes, which exceeds the limit of 10,000.**

No inline script can exceed 10,000 bytes. See [Size of JavaScript code](#size-of-javascript-code) above.

**Maximum total script size exceeded (...)**

The total of all non-sandboxed scripts used by a page cannot exceed 150,000 bytes. See [Size of JavaScript code](#size-of-javascript-code) above.

The total of all sandboxed scripts (see [Sandboxed Mode](#sandboxed)) used by a page cannot exceed 300,000 bytes. See [Size of JavaScript code](#size-of-javascript-code) above.

**Script hash not found.**

For local scripts and cross-origin scripts, you need to add a [script hash](#calculating-the-script-hash) for security.

**(...) must have "sha384-(...)" in meta[name="amp-script-src"]**

Again, you need the [script hash](#calculating-the-script-hash). Simply copy the value in this error into your `<meta>` tag.

**JavaScript script hash requirements are disabled in sandboxed mode.**

**JavaScript size and script hash requirements are disabled in development mode.**

If your `<amp-script>` includes the `data-ampdevmode` attribute, AMP won't check your [script hash](#calculating-the-script-hash) or the size of your code.

**Blocked (...) attempts to modify (...)**

To avoid undesirable content layout shift, `amp-script` disallows DOM mutations under certain conditions. See [User gestures](#user-gestures) above.

**amp-script... was terminated due to illegal mutation**

If a script attempts too many disallowed DOM changes, `amp-script` may halt the script so that it doesn't get too far out of sync with the DOM.

**AMP.setState only updated page state and did not reevaluate bindings due to lack of recent user interaction.**

If you modify a state variable in a variable-sized container before a user interaction, `amp-script` will not upate the DOM to avoid undesirable content layout shift. See [Referencing amp-state](#referencing-amp-state) above.

**Form elements (...) cannot be mutated unless your `<amp-script>` includes the attribute sandbox="allow-forms".**

This attribute is required for security. See [common attributes](#common-attributes) above.

**Sanitized node: (...)**

If your code adds a disallowed element (like `<script>`, `<style>`, or an unsupported AMP component), `amp-script` will remove it.
