---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Allows rendering of custom UI components running on third-party JavaScript.
---
# amp-script

# <a name="amp-script"></a> `amp-script`

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

Allows rendering of custom UI components running on third-party JavaScript.

<table>
  <tr>
    <td><strong>Availability</strong></td>
    <td><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td>
      <div>
        <code>&lt;script async custom-element="amp-script" src="https://cdn.ampproject.org/v0/amp-script-0.1.js">&lt;/script&gt;</code>
      </div>
    </td>
  </tr>
</table>

## Overview

The `amp-script` component allows you to render widgets and other UI using custom third-party JavaScript, e.g. a React component.

{% call callout('Important', type='caution') %}
`amp-script` is in active development and under [experimental availability](https://www.ampproject.org/docs/reference/experimental.html). It's subject to breaking API changes and should not yet be used in production.
{% endcall %}

### A simple example

```html
<!-- hello-world.html -->
<amp-script layout="container" src="https://example.com/hello-world.js">
  <button id="hello">Insert Hello World!</button>
</amp-script>
```

```js
// hello-world.js
const button = document.getElementById('hello');
button.addEventListener('click', () => {
  const el = document.createElement('h1');
  el.textContent = 'Hello World!';
  // `document.body` is effectively the <amp-script> element.
  document.body.appendChild(el);
});
```

{% call callout('Tip', type='success') %}
Enable the experiment via `AMP.toggleExperiment('amp-script')` in dev console.
{% endcall %}

For additional code samples, see [`examples/amp-script/`](https://github.com/ampproject/amphtml/tree/master/examples/amp-script).

### How does it work?

`amp-script` is an AMP component wrapper for [`worker-dom`](https://github.com/ampproject/worker-dom/).

`worker-dom` runs third-party JavaScript in a web worker containing a virtual DOM. The virtual DOM listens for mutations and forwards them to the main page which reflects the changes on the real DOM.

For design details, see the ["Intent to Implement" issue](https://github.com/ampproject/amphtml/issues/13471).
For more information on `worker-dom`, see the [@ampproject/worker-dom](https://github.com/ampproject/worker-dom/) repository.

### Mutations and user actions

`amp-script` generally requires a user action to perform mutates to avoid unexpected UI jumps without user's input, but there are some exception to this rule.

Overall mutation rules are:

1. Mutations are always accepted after a user action for a user action interval of 5 seconds.
2. The 5 seconds interval is extended if the user script performs a `fetch()` operation.
3. Smaller `amp-script` elements with height under `300px` and non-`container` layout are allowed unlimitted mutations.

## Interested in using `<amp-script>`?

We recommend developing against a local build of `amp-script`. This enables dev-only debugging hooks e.g. human-readable `postMessage` events.

See our [Quick Start](https://github.com/ampproject/amphtml/blob/master/contributing/getting-started-quick.md#one-time-setup) guide for setting up your local environment.

## FAQ

1. Which JavaScript APIs can I use?

   * Currently, most DOM elements and their properties are supported. DOM query APIs like `querySelector` have partial support. Browser APIs like `History` are not implemented yet. We'll publish an API support matrix soon.

2. Can you support ____ API?

    * Our feature timelines are informed by your real-world use cases! Please [file an issue](https://github.com/ampproject/amphtml/issues/new) and mention `@choumx` and `@kristoferbaxter`.
