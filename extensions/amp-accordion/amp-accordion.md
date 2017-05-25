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

# <a name="amp-accordion"></a> `amp-accordion`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>An accordion provides a way for viewers to glance at the content outline and jump to any section. This is helpful for handheld mobile devices where even a couple of sentences into a section requires scrolling.</td>
  </tr>
  <tr>
    <td class="col-fourty" width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code><script async custom-element="amp-accordion" src="https://cdn.ampproject.org/v0/amp-accordion-0.1.js"></script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>container</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-accordion/">Annotated code example for amp-accordion</a></td>
  </tr>
</table>

## Behavior

Each of the `amp-accordion` component’s immediate children is considered a section in the accordion. Each of these nodes must be a `<section>` tag.

- An `amp-accordion` can contain one or more `<section>`s as its direct children.
- Each `<section>` must contain exactly two direct children.
- The first child (of the section) must be one of `h1`, `h2`, ..., `h6`, `header`, and is the heading of the section.
- The second child (of the section) can be any tag allowed in AMP HTML and is the content of the section.
- Clicking/tapping on the heading of a section expands/ or collapses the section.
- The collapsed/expanded state of each section in the `amp-accordion` element will be preserved for the session level. The user has the option to opt out of this by adding the `disable-session-states` attribute to the `amp-accordion` tag.

Example:

```html
<amp-accordion>
  <section expanded>
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <amp-img src="/awesome.png" width="300" height="300"></amp-img>
  </section>
</amp-accordion>
```

## Attributes

**disable-session-states**

The `disable-session-states` attribute can be set on `<amp-accordion>` to opt out of preserving the collapsed/expanded state of the `amp-accordion` element.

**expanded**

The `expanded` attribute can be set on any `<section>` that needs to be expanded on page load.

## Styling

- You may use the `amp-accordion` element selector to style it freely.
- `amp-accordion` elements are always `display: block`.
- `<section>` and the heading and content element are not float-able.
- `<section>`s will have an `expanded` attribute when they are expanded.
- The content element is clear-fixed with `overflow: hidden` and hence cannot have scrollbars.
- margins of the `amp-accordion`, `<section>` and the heading and content elements are set to 0 and can be overridden in custom styles.
- Both the header and content elements are `position: relative`.

## Validation

See [amp-accordion rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-accordion/0.1/validator-amp-accordion.protoascii) in the AMP validator specification.
