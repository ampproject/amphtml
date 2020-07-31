---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Runs custom JavaScript in a Web Worker.
---

<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

## Usage

The `amp-script` component allows you to run custom JavaScript. To maintain AMP's performance guarantees, your code runs in a Web Worker, and certain restrictions apply.

An `amp-script` element can load JavaScript in two ways:

- remotely, from a URL
- locally, from a `<script>` element on the page

### Load JavaScript from a remote URL

Use the `src` attribute to load JavaScript from a URL:

```html
<amp-script layout="container" src="https://example.com/hello-world.js">
  <button>Hello amp-script!</button>
</amp-script>
```

### Load JavaScript from a local element

You can also include your JavaScript inline, in a `script` tag. You must:

- Set the `script` attribute of your `amp-script` to the local `script` element's `id`.
- Include `target="amp-script"` in your `amp-script`.
- Include `type="text/plain"` in your `script`. This way, the browser won't execute your script, allowing amp-script to control it.

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
For security reasons, `amp-script` elements with a `script` or cross-origin `src` attribute require a [script hash](#script-hash) in a `<meta name="amp-script-src" content="...">` tag. Also, same-origin `src` files must have [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type): `application/javascript` or `text/javascript`.
[/tip]

## How does it work?

`amp-script` runs your custom JavaScript in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) that has access to a virtual DOM. When your JavaScript code modifies this virtual DOM, `amp-script` forwards these changes to the main thread and applies them to the `amp-script` element subtree.

For example, adding an element to `document.body`:

```js
// my-script.js
const p = document.createElement('p');
p.textContent = 'I am added to the body!';
document.body.appendChild(p);
```

Will be reflected on the page as a new child of the `amp-script` element:

```html
<amp-script src="http://example.com/my-script.js" width="300" height="100">
  <p>I am added to the body!</p>
</amp-script>
```

Under the hood, `amp-script` uses [@ampproject/worker-dom](https://github.com/ampproject/worker-dom/). For design details, see the ["Intent to Implement" issue](https://github.com/ampproject/amphtml/issues/13471).

## State manipulation

`amp-script` supports getting and setting [`amp-state`](https://amp.dev/documentation/components/amp-bind/#initializing-state-with-amp-state) JSON via JavaScript.

This enables advanced interactions between `amp-script` and other AMP elements on the page via `amp-bind` [bindings](https://amp.dev/documentation/components/amp-bind/#bindings). Invoking `AMP.setState()` from `amp-script` may cause mutations to the DOM as long as it was triggered by user gesture, otherwise it will only implicitly set state (similar to [`amp-state` initialization](https://amp.dev/documentation/examples/components/amp-bind/?referrer=ampbyexample.com#initializing-state)).

[tip type="default"]
`AMP.setState()` requires the [`amp-bind`](https://amp.dev/documentation/components/amp-bind) extension script to be included in the document head.
[/tip]

```js
/**
 * Deep-merges `json` into the current amp-state.
 * @param {!Object} json A JSON object e.g. must not contain circular references.
 */
AMP.setState(json) {}

/**
 * Asynchronously returns amp-state.
 * @param {string=} expr An optional JSON expression string e.g. "foo.bar".
 * @return {!Promise<!Object>}
 */
AMP.getState(expr) {}
```

### Example with WebSocket and AMP.setState()

```html
<amp-script width="1" height="1" script="webSocketDemo"> </amp-script>

<!--
  <amp-state> doesn't support WebSocket URLs in its "src" attribute,
  but we can use <amp-script> to work around it. :)
-->
<script type="text/plain" target="amp-script" id="webSocketDemo">
  const socket = new WebSocket('wss://websocket.example');
  socket.onmessage = event => {
    AMP.setState({socketData: event.data});
  };
</script>
```

<<<<<<< HEAD

## Restrictions

=======

### Exporting functions for use in <amp-list>

You may export functions to act as the data source for an `<amp-list>`.
The exported function must return either JSON, or a Promise which will eventually contain JSON.

The export API is available on the global scope, and has the following signature:

```js
/**
 * @param {string} name the name to identify the function by.
 * @param {Function} function the function to export.
 */
function exportFunction(name, function) {}
```

<<<<<<< HEAD

### Restrictions

> > > > > > > # 028539ec4... amp-script docs

## Restrictions

> > > > > > > a5dcf61d7... gulp prettify --fix

### Allowed APIs

Currently, most DOM elements and their properties are supported. DOM query APIs like `querySelector` have partial support. Browser APIs like `History` are not implemented yet. See the [API compatibility table](https://github.com/ampproject/worker-dom/blob/master/web_compat_table.md) for details.

If there's an API you'd like to see supported, please [file an issue](https://github.com/ampproject/amphtml/issues/new) and mention `@choumx` and `@kristoferbaxter`.

### Size of JavaScript code <a name="size-of-javascript-code"></a>

`amp-script` has the following restrictions on JavaScript file size:

- Maximum of 10,000 bytes per `amp-script` element that uses a local script via `script[type=text/plain][target=amp-script]`.
- Maximum total of 150,000 bytes for all `amp-script` elements on the page.

### User gestures <a name="user-gestures"></a>

In some cases, `amp-script` requires a user gesture to apply changes triggered by your JavaScript code (we call these "mutations") to the `amp-script`'s DOM children. This helps avoid poor user experience from unexpected content jumping.

The rules for mutations are as follows:

1. For `amp-script` elements with [non-container layout](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout#supported-values-for-the-layout-attribute), mutations are always allowed.
2. For `amp-script` elements with container layout, mutations are allowed for five seconds following a user gesture. This five second window is extended once if a `fetch()` is triggered.

### Creating AMP elements

With regard to dynamic creation of AMP elements (e.g. via `document.createElement()`), only `amp-img` and `amp-layout` are currently allowed. Please upvote or comment on [&#35;25344](https://github.com/ampproject/amphtml/issues/25344) with your use case.

## Calculating the script hash <a name="script-hash"></a>

Since custom JS run in `amp-script` is not subject to normal [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), you need to add this script hash:

- for inline JavaScript
- for JavaScript loaded from a cross-origin source

Include the script hash in a `meta[name=amp-script-src]` element in the document head. Here are a few ways to build the hash:

- If you omit the `<meta>` tag, AMP will output a console error containing the expected hash string. You can copy this to create the appropriate `<meta>` tag.
- The [AMP Optimizer node module](https://www.npmjs.com/package/@ampproject/toolbox-optimizer) generates this hash and inserts the `<meta>` tag automatically.
- Build it yourself, using the following steps:

1. Compute the SHA384 hash sum of the script's contents. This sum should be expressed in hexadecimal.
2. base64url-encode the result.
3. Prefix that with `sha384-`.

Here's how you calculate the hash in Node.js:

```js
const crypto = require('crypto');
const hash = crypto.createHash('sha384');

function generateCSPHash(script) {
  const data = hash.update(script, 'utf-8');
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

There is also a node module available which does it for you: [@ampproject/toolbox-script-csp](https://www.npmjs.com/package/@ampproject/toolbox-script-csp).

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
    ">
</head>
<body>
  <!--
    A "src" attribute with a cross-origin URL requires adding a script hash.

    If the hash of remote.js's contents is "fake_hash_of_remote_js",
    we'll add "sha384-fake_hash_of_remote_js" to the <meta> tag above.

-->
<amp-script src="cross.origin/remote.js" layout=container>
</amp-script>

  <!--
    A "script" attribute also requires adding a script hash.

    If the hash of #myScript's text contents is "fake_hash_of_local_script",
    we'll add "sha384-fake_hash_of_local_script" to the <meta> tag above.
  -->
  <amp-script script=myScript layout=container>
  </amp-script>
  <script type=text/plain target=amp-script id=myScript>
    document.body.textContent += 'Hello world!';
  </script>
</body>
```

[tip type="default"]
During development, you can disable the JavaScript size and script hash requirements by adding a `data-ampdevmode` attribute to either the `amp-script` element or the root html node. Adding this to the root html node will suppress all validation errors on the page. Adding it to the `amp-script` element will simply suppress errors about the size and the script hash.
[/tip]

## Attributes

**src**

For executing remote scripts.

The URL of a JS file that will be executed in the context of this `<amp-script>`. The URL's protocol must be HTTPS and the HTTP response's `Content-Type` must be `application/javascript` or `text/javascript`.

**script**

For executing local scripts.

The `id` of a `script[type=text/plain][target=amp-script]` element whose text content contains JS that will be executed in the context of this `<amp-script>`.

**sandbox (optional)**

Applies extra restrictions to DOM that may be mutated by this `<amp-script>`. Similar to the `iframe[sandbox]` attribute, the value of the attribute can either be empty to apply all restrictions, or space-separated tokens to lift particular restrictions:

- `allow-forms`: Allows [form elements](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements) to be created and modified. AMP requires special handling to prevent unauthorized state changing requests from user input. See amp-form's [security considerations](https://amp.dev/documentation/components/amp-form#security-considerations) for more detail.

**max-age (optional, but required for signed exchanges if `script` is specified)**

Requires the `script` attribute.

The `max-age` attribute specifies the maximum lifetime in seconds the local script is allowed to be served from the time of [signed exchange (SXG)](https://amp.dev/documentation/guides-and-tutorials/optimize-and-measure/signed-exchange/) publishing. [AMP Packager](https://github.com/ampproject/amppackager) uses this value to compute the SXG `expires` time.

The value of `max-age` should be chosen carefully:

- A longer `max-age` increases the potential security impact of a [SXG downgrade](https://wicg.github.io/webpackage/draft-yasskin-http-origin-signed-responses.html#seccons-downgrades).

- A shorter `max-age` may prevent inclusion in AMP Caches that have a minimum SXG lifetime. For instance, the Google AMP Cache requires at least [4 days](https://github.com/ampproject/amppackager/blob/releases/docs/cache_requirements.md#google-amp-cache) (345600 seconds). Note that there's currently no reason to select `max-age` longer than 7 days (604800 seconds), due to the [maximum](https://wicg.github.io/webpackage/draft-yasskin-http-origin-signed-responses.html#name-signature-validity) set by the SXG spec.

If you don't publish signed exchanges, `max-age` does nothing.

**nodom (optional)**
There are situations in which you may wish to use `<amp-script>` as solely a data-layer, rather than using it to manipulate dom. The `nodom` attribute removes the ability for the `<amp-script>` to make dom modifications, in favor of a signficantly smaller bundle size and therefore better performance. It also renders the `<amp-script>` invisible, removing the need for specifying height and width.

**common attributes**

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Errors

There are several types of runtime errors that may be encountered when using `amp-script`.

### "Maximum total script size exceeded (...)"

`amp-script` limits the size of the JS source that may be used. See [Size of JavaScript code](#size-of-javascript-code) above.

### "Script hash not found."

For local scripts and cross-origin scripts, you need to add a [script hash](#script-hash) for security.

### "amp-script... was terminated due to illegal mutation"

To avoid unexpected content jumping, `amp-script` generally requires user gestures for DOM changes. See [User gestures](#user-gestures) above.
