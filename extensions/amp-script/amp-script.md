---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Allows rendering of custom UI components running on third-party JavaScript.
experimental: true
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
</table>

## Overview

The `amp-script` component allows you to render widgets and other UI using custom third-party JavaScript, e.g. a React component.

{% call callout('Important', type='caution') %}
`amp-script` is in active development and under [experimental availability](https://amp.dev/documentation/guides-and-tutorials/learn/experimental). It's subject to breaking API changes and should not yet be used in production.
{% endcall %}

### A simple example

```html
<!-- Using a local script ("script" attribute). -->
<amp-script layout="container" script="hello-world">
  <button id="hello">Insert Hello World!</button>
</amp-script>

<!-- Local scripts are referenced by id. -->
<script type="text/plain" target="amp-script" id="hello-world">
  const button = document.getElementById('hello');
  button.addEventListener('click', () => {
    const h1 = document.createElement('h1');
    h1.textContent = 'Hello World!';
    // `document.body` is effectively the <amp-script> element.
    document.body.appendChild(h1);
  });
</script>
```

```html
<!-- Using an remote script ("src" attribute). -->
<amp-script layout="container" src="https://example.com/hello-world.js">
  <button id="hello">Insert Hello World!</button>
</amp-script>
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

### Mutations and user gestures

`amp-script` generally requires a user gesture to perform mutations. This avoids content jumps that are not triggered by user gesture, but there are some exceptions:

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

## Interested in using `<amp-script>`?

We recommend developing against a local build of `amp-script`. This enables dev-only debugging hooks e.g. human-readable `postMessage` events.

See our [Quick Start](https://github.com/ampproject/amphtml/blob/master/contributing/getting-started-quick.md#one-time-setup) guide for setting up your local environment.

## FAQ

#### I'm getting a "size exceeded" error.

`amp-script` has restrictions on the size of the JS.

- Maximum of 10,000 bytes per `amp-script` element that uses a local script via `script[type=text/plain][target=amp-script]`.
- Maximum total of 150,000 bytes for all `amp-script` elements on the page.

#### Which JavaScript APIs can I use?

Currently, most DOM elements and their properties are supported. DOM query APIs like `querySelector` have partial support. Browser APIs like `History` are not implemented yet. We'll publish an API support matrix soon.

#### Can you support ____ API?

Our feature timelines are informed by your real-world use cases! Please [file an issue](https://github.com/ampproject/amphtml/issues/new) and mention `@choumx` and `@kristoferbaxter`.
