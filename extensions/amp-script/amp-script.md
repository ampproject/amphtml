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
    <td><strong>Availability</strong></td>
    <td>
      <a href="https://amp.dev/documentation/guides-and-tutorials/learn/experimental#origin-trials">Origin Trial</a><br/>
      This component is available under Origin Trial. To sign up for an Origin Trial please sign up at bit.ly/amp-script-trial.
    </td>
  </tr>
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

{% call callout('Important', type='caution') %}
`amp-script` is in active development and under [experimental availability](https://amp.dev/documentation/guides-and-tutorials/learn/experimental). It's subject to breaking API changes and should not yet be used in production.
{% endcall %}

### A simple example

An `amp-script` element can load a JavaScript file from a URL:

```html
<!-- Use an remote script via the "src" attribute. -->
<amp-script layout="container" src="https://example.com/hello-world.js">
  <button>Hello amp-script!</button>
</amp-script>
```

...or reference a local `script` element by `id`:

```html
<!-- Reference a local script by id via the "script" attribute. -->
<amp-script layout="container" script="hello-world">
  <button>Hello amp-script!</button>
</amp-script>

<script id="hello-world" type="text/plain" target="amp-script">
  const btn = document.querySelector('button');
  btn.addEventListener('click', () => {
    document.body.textContent += 'Hello World!';
  });
</script>
```

{% call callout('Tip', type='success') %}
Enable the experiment via `AMP.toggleExperiment('amp-script')` in dev console.
{% endcall %}

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
<amp-script src="http://example.com/my-script.js" width=300 height=100>
  <p>I am added to the body!</p>
</amp-script>
```

Under the hood, `amp-script` uses [@ampproject/worker-dom](https://github.com/ampproject/worker-dom/). For design details, see the ["Intent to Implement" issue](https://github.com/ampproject/amphtml/issues/13471).

### Restrictions

#### Size of JavaScript code

`amp-script` has the following restrictions on JavaScript file size:

- Maximum of 10,000 bytes per `amp-script` element that uses a local script via `script[type=text/plain][target=amp-script]`.
- Maximum total of 150,000 bytes for all `amp-script` elements on the page.

#### User gestures

`amp-script` generally requires a user gesture to apply changes triggered by your JavaScript code to the page (we call these "mutations"). This requirement helps avoid poor user experience from unexpected content jumping.

The rules for mutations are as follows:

1. Mutations are always accepted for five seconds after a user gesture.
2. The five second interval is extended if the author script performs a `fetch()` as a result of the user gesture.
3. Mutations are always accepted for `amp-script` elements with `[layout!="container"]` and `height < 300px`.

## Attributes

**src**

The URL of a JS file that will be executed in the context of this `<amp-script>`.

**script**

The `id` of a `script[type=text/plain][target=amp-script]` element whose text content contains JS that will be executed in the context of this `<amp-script>`.

**sandbox (optional)**

Applies extra restrictions to DOM that may be mutated by this `<amp-script>`. Similar to the `iframe[sandbox]` attribute, the value of the attribute can either be empty to apply all restrictions, or space-separated tokens to lift particular restrictions:

- `allow-forms`: Allows [form elements](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements) to be created and modified. AMP requires special handling to prevent unauthorized state changing requests from user input. See amp-form's [security considerations](https://amp.dev/documentation/components/amp-form#security-considerations) for more detail.

**common attributes**

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Interested in using amp-script?

We recommend developing against a local build of `amp-script`. This enables dev-only debugging hooks e.g. human-readable `postMessage` events.

See our [Quick Start](https://github.com/ampproject/amphtml/blob/master/contributing/getting-started-quick.md#one-time-setup) guide for setting up your local environment.

## FAQ

#### Which JavaScript APIs can I use?

Currently, most DOM elements and their properties are supported. DOM query APIs like `querySelector` have partial support. Browser APIs like `History` are not implemented yet.

See the [API compatibility table](https://github.com/ampproject/worker-dom/blob/master/web_compat_table.md) for details.

#### Can you support ____ API?

Our feature timelines are informed by your real-world use cases! Please [file an issue](https://github.com/ampproject/amphtml/issues/new) and mention `@choumx` and `@kristoferbaxter`.

#### I'm getting a "size exceeded" error.

See [Size of JavaScript code](#size-of-javascript-code) above.
