---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Allows running custom JavaScript to render UI.
experimental: true
---

# amp-script

Allows running custom JavaScript to render UI.

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

[TOC]

<table>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td>
      <div>
        <code>&lt;script async custom-element="amp-script" src="https://cdn.ampproject.org/v0/amp-script-0.1.js">&lt;/script&gt;</code>
      </div>
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td>
      <ul>
        <li><a href="https://github.com/ampproject/amphtml/tree/master/examples/amp-script">Unannotated code samples</a></li>
      </ul>
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>container, fill, fixed, fixed-height, flex-item, intrinsic, responsive</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Tutorials</strong></td>
    <td>
      <ul>
        <li><a href="https://amp.dev/documentation/guides-and-tutorials/develop/custom-javascript">Getting started with amp-script</a></li>
        <li><a href="https://amp.dev/documentation/guides-and-tutorials/develop/custom-javascript-tutorial?format=websites">Custom password requirements with amp-script</a></li>
      </ul>
    </td>
  </tr>
</table>

## Overview

The `amp-script` component allows you run custom JavaScript to render UI elements, such as a React component.

### A simple example

An `amp-script` element can load JavaScript in two ways:

- Remotely, from a URL to a JavaScript file.
- Locally, from a `script[type=text/plain][target=amp-script]` element on the page.

#### Load JavaScript from a remote URL

Use the `src` attribute to load remote JavaScript.

```html
<amp-script layout="container" src="https://example.com/hello-world.js">
  <button>Hello amp-script!</button>
</amp-script>
```

If `src` points to a cross-origin URL, then a ["script hash"](#security-features) must also be added to the document head.

#### Load JavaScript from a local element

Use the `script` attribute to reference a local `script` element by `id`.

```html
<!-- Using the "script" attribute also requires adding a "script hash" to the document head. -->
<head>
  <meta
    name="amp-script-src"
    content="sha384-YCFs8k-ouELcBTgzKzNAujZFxygwiqimSqKK7JqeKaGNflwDxaC3g2toj7s_kxWG"
  />
</head>

...

<amp-script width="200" height="50" script="hello-world">
  <button>Hello amp-script!</button>
</amp-script>

<!-- Also add [target="amp-script"] to the <script> element. -->
<script id="hello-world" type="text/plain" target="amp-script">
  const btn = document.querySelector('button');
  btn.addEventListener('click', () => {
    document.body.textContent = 'Hello World!';
  });
</script>
```

[tip type="default"]
`amp-script` elements that have a `script` or cross-origin `src` attribute require a ["script hash"](#security-features). Script hashes are specified in a `<meta name="amp-script-src" content="...">` element in the document head.

A console error will be thrown with the expected `content` value -- you can copy/paste from the error to create the appropriate `<meta>` tag.
[/tip]

### How does it work?

`amp-script` runs your custom JavaScript in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) that contains a virtual DOM. When your JavaScript code modifies this virtual DOM, `amp-script` forwards these changes to the main thread and applies them to the `amp-script` element subtree.

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

### State manipulation

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

##### Example with WebSocket and AMP.setState()

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

### Restrictions

#### Allowed APIs

Currently, most DOM elements and their properties are supported. DOM query APIs like `querySelector` have partial support. Browser APIs like `History` are not implemented yet. See the [API compatibility table](https://github.com/ampproject/worker-dom/blob/master/web_compat_table.md) for details.

If there's an API you'd like to see supported, please [file an issue](https://github.com/ampproject/amphtml/issues/new) and mention `@choumx` and `@kristoferbaxter`.

#### Size of JavaScript code

`amp-script` has the following restrictions on JavaScript file size:

- Maximum of 10,000 bytes per `amp-script` element that uses a local script via `script[type=text/plain][target=amp-script]`.
- Maximum total of 150,000 bytes for all `amp-script` elements on the page.

#### User gestures

In some cases, `amp-script` requires a user gesture to apply changes triggered by your JavaScript code (we call these "mutations") to the `amp-script`'s DOM children. This helps avoid poor user experience from unexpected content jumping.

The rules for mutations are as follows:

1. For `amp-script` elements with [non-container layout](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout#supported-values-for-the-layout-attribute), mutations are always allowed.
2. For `amp-script` elements with container layout, mutations are allowed for five seconds following a user gesture. This five second window is extended once if a `fetch()` is triggered.

#### Creating AMP elements

With regard to dynamic creation of AMP elements (e.g. via `document.createElement()`), only `amp-img` and `amp-layout` are currently allowed. Please upvote or comment on [#25344](https://github.com/ampproject/amphtml/issues/25344) with your use case.

#### Security features

Since custom JS run in `amp-script` is not subject to normal [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), we've included some additional measures that are checked at runtime:

1. Same-origin `src` must have [`Content-Type: application/javascript`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type).
2. Cross-origin `src` and `script` must have matching script hashes in a `meta[name=amp-script-src]` element in the document head. A console error will be emitted with the expected hash string.

Example of script hashes:

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
The JavaScript size and script hash requirements can be disabled during development by adding a `data-ampdevmode` attribute to both the top-level `html` element and the `amp-script` element (or any of its parent nodes).
[/tip]

## Attributes

**src**

For executing remote scripts.

The URL of a JS file that will be executed in the context of this `<amp-script>`. The URL's protocol must be HTTPS and the HTTP response's `Content-Type` must be `application/javascript`.

**script**

For executing local scripts.

The `id` of a `script[type=text/plain][target=amp-script]` element whose text content contains JS that will be executed in the context of this `<amp-script>`.

**sandbox (optional)**

Applies extra restrictions to DOM that may be mutated by this `<amp-script>`. Similar to the `iframe[sandbox]` attribute, the value of the attribute can either be empty to apply all restrictions, or space-separated tokens to lift particular restrictions:

- `allow-forms`: Allows [form elements](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements) to be created and modified. AMP requires special handling to prevent unauthorized state changing requests from user input. See amp-form's [security considerations](https://amp.dev/documentation/components/amp-form#security-considerations) for more detail.

**max-age (optional)**

Requires the `script` attribute.

The `max-age` attribute specifies the maximum lifetime in seconds the local script is allowed to be served from the time of [signed exchange (SXG)](https://amp.dev/documentation/guides-and-tutorials/optimize-and-measure/signed-exchange/) publishing.

The value of `max-age` should be chosen carefully:

- A longer `max-age` increases the potential security impact of a [SXG downgrade](https://wicg.github.io/webpackage/draft-yasskin-http-origin-signed-responses.html#seccons-downgrades).

- A shorter `max-age` may prevent inclusion in AMP Caches that have a [minimum SXG lifetime](https://github.com/ampproject/amppackager/blob/releases/docs/cache_requirements.md#google-amp-cache).

If you don't publish signed exchanges, `max-age` does nothing.

**common attributes**

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Errors

There are several types of runtime errors that may be encountered when using `amp-script`.

#### "Maximum total script size exceeded (...)"

`amp-script` limits the size of the JS source that may be used. See [Size of JavaScript code](#size-of-javascript-code) above.

#### "Script hash not found."

Local scripts and cross-origin `src` require adding a special `<meta>` tag to be used. See [Security features](#security-features) above.

#### "amp-script... was terminated due to illegal mutation"

To avoid unexpected content jumping, `amp-script` generally requires user gestures for DOM changes. See [User gestures](#user-gestures) above.
