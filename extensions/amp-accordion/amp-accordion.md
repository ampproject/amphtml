---
$category@: layout
formats:
  - websites
teaser:
  text: A stacked list of headers that collapse or expand content sections with user interaction.
experimental: true
bento: true
---

<!---
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

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

# amp-accordion

Provides a way for viewers to glance at the content outline and jump to any section. This is helpful for mobile devices where even a couple of sentences into a section requires scrolling.

## Usage

The `amp-accordion` component allows you to display collapsible and expandable
content sections. This component provides a way for viewers to glance at the
content outline and jump to any section. Effective use reduces scrolling needs
on mobile devices.

[filter formats="websites, ads"]

-   An `amp-accordion` accepts one or more `<section>` elements as its direct
    children.
-   Each `<section>` must contain exactly two direct children.
-   The first child in a `<section>` is the heading for that section of the
    `amp-accordion`. It must be a heading element such as `<h1>-<h6>` or
    `<header>`.
-   The second child in a `<section>` is the expandable/collapsible content. It
    can be any tag allowed in [AMP HTML](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md).
-   A click or tap on a `<section>` heading expands or collapses the section.
-   An `amp-accordion` with a defined `id` preserves the collapsed or expanded
    state of each section while the user remains on your domain.

[/filter] <!-- formats="websites, ads" -->

[filter formats="email"]

-   An `amp-accordion` accepts one or more `<section>` elements as its direct
    children.
-   Each `<section>` must contain exactly two direct children.
-   The first child in a `<section>` is the heading for that section of the
    `amp-accordion`. It must be a heading element such as `<h1>-<h6>` or
    `<header>`.
-   The second child in a `<section>` is the expandable/collapsible content. It
    can be any tag allowed in [AMP for Email](https://github.com/ampproject/amphtml/blob/master/spec/email/amp-email-html.md).
-   A click or tap on a `<section>` heading expands or collapses the section.

[/filter]

## Example

The example below contains an `amp-accordion` with three sections. The
`expanded` attribute on the third section expands it on page load.

[example preview="top-frame" playground="true" imports="amp-accordion:1.0"]

```html
<amp-accordion id="my-accordion"{% if not format=='email'%} disable-session-states{% endif %}>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section expanded>
    <h2>Section 3</h2>
    <amp-img src="{{server_for_email}}/static/inline-examples/images/squirrel.jpg"
      width="320"
      height="256"></amp-img>
  </section>
</amp-accordion>
```

[/example]

### Standalone use outside valid AMP documents

Bento AMP allows you to use AMP components in non-AMP pages without needing to commit to fully valid AMP. You can take these components and place them in implementations with frameworks and CMSs that don't support AMP. Read more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

#### Example

The example below demonstrates `amp-accordion` component in standalone use.

[example preview="top-frame" playground="false"]

```html
<head>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-accordion-1.0.css">
  <script async custom-element="amp-accordion" src="https://cdn.ampproject.org/v0/amp-accordion-1.0.js"></script>
</head>
<amp-accordion id="myAccordion" animate='true'>
  <section id="section1">
    <h2>Section 1</h2>
    <div>Puppies are cute.</div>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Kittens are furry.</div>
  </section>
  <section id="section3">
    <h2>Section 3</h2>
    <div>Elephants have great memory.</div>
  </section>
</amp-accordion>
<div class="buttons" style="margin-top: 8px;">
  <button id='button1'>Toggle All Sections</button>
  <button id='button2'>Expand Section 2</button>
  <button id='button3'>Collapse Section 3</button>
</div>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('amp-accordion');
    const api = await accordion.getApi();

    // programatically toggle (expands) all sections
    api.toggle();

    // set up button actions
    document.querySelector('#button1').onclick = () => api.toggle();
    document.querySelector('#button2').onclick = () => api.expand('section2');
    document.querySelector('#button3').onclick = () => api.collapse('section3');
  })();
</script>
```

[/example]

#### Interactivity and API usage

Bento enabled components in standalone use are highly interactive through their API. In Bento standalone use, the element's API replaces AMP Actions and Events and [`amp-bind`](https://amp.dev/documentation/components/amp-bind/?format=websites).

The `amp-accordion` component API is accessible by including the following script tag in your document:

```html
await customElements.whenDefined('amp-accordion');
const api = await accordion.getApi();
```

##### Actions

**toggle()**
The `toggle` action switches the `expanded` and `collapsed` states of
`amp-accordion` sections. When called with no arguments, it toggles all sections
of the accordion. To specify a specific section, add the `section` argument and
use its corresponding `id` as the value.

```html
<amp-accordion id="myAccordion">
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Bunch of awesome content</div>
  </section>
</amp-accordion>
<button id="button1">Toggle All Sections</button>
<button id="button2">Toggle Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('amp-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => api.toggle();
    document.querySelector('#button2').onclick = () => api.toggle('section1');
  })();
</script>
```

**expand()**
The `expand` action expands the sections of the `amp-accordion`. If a section
is already expanded, it stays expanded. When called with no arguments, it
expands all sections of the accordion. To specify a section, add the `section` argument, and use its corresponding `id` as the value.

```html
<button id="button1">Expand All Sections</button>
<button id="button2">Expand Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('amp-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => api.expand();
    document.querySelector('#button2').onclick = () => api.expand('section1');
  })();
</script>
```

**collapse()**
The `collapse` action collapses the sections of the `amp-accordion`. If a
section is already collapsed, it stays collapsed. When called with no arguments,
it collapses all sections of the accordion. To specify a section, add the
`section` argument, and use its corresponding `id` as the value.

```html
<button id="button1">Collapse All Sections</button>
<button id="button2">Collapse Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('amp-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => api.collapse();
    document.querySelector('#button2').onclick = () => api.collapse('section1');
  })();
</script>
```

##### Events

The `amp-accordion` API allows you to register and respond to the following events:

**expand**
This event is triggered when an accordion section is expanded and is dispatched from the expanded section.

**collapse**
This event is triggered when an accordion section is collapsed and is dispatched from the collapsed section.

In the example below, `section 1` listens for the `expand` event and expands `section 2` when it is expanded. `section 2` listens for the `collapse` event and collapses `section 1` when it is collapsed.

```html
<amp-accordion id="eventsAccordion" animate='true'>
  <section id="section1">
    <h2>Section 1</h2>
    <div>Puppies are cute.</div>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Kittens are furry.</div>
  </section>
</amp-accordion>

<script>
  (async () => {
    const accordion = document.querySelector('#eventsAccordion');
    await customElements.whenDefined('amp-accordion');
    const api = await accordion.getApi();

    // when section 1 expands, section 2 also expands
    // when section 2 collapses, section 1 also collapses
    const section1 = document.querySelector('#section1');
    const section2 = document.querySelector('#section2');
    section1.addEventListener('expand', () => api.expand('section2'));
    section2.addEventListener('collapse', () => api.collapse('section1'));
  })();
</script>
```

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-accordion-1.0.css">
```

Fully valid AMP pages use the AMP layout system to infer sizing of elements to create a page structure before downloading any remote resources. However, Bento use imports components into less controlled environments and AMP's layout system is inaccessible.

## Attributes

### animate

Include the `animate` attribute in `<amp-accordion>` to add a "roll down"
animation when the content is expanded and "roll up" animation when collapsed.

This attribute can be configured to based on a [media query](./../../spec/amp-html-responsive-attributes.md).

[example preview="top-frame" playground="true" imports="amp-accordion:1.0"]

```html
<amp-accordion animate>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <amp-img
      src="{{server_for_email}}/static/inline-examples/images/squirrel.jpg"
      width="320"
      height="256"
    ></amp-img>
  </section>
</amp-accordion>
```

[/example]

### expanded

Apply the `expanded` attribute to a nested `<section>` to expand that section when the page loads.

Use `amp-bind` to bind the `[expanded]` attribute to programmatically expand or collapse a `<section>` element. An expanded section collapses when the expression evaluates as `false`. A collapsed section expands if the expression evaluates to anything other than `false`.

[example preview="top-frame" playground="true" imports="amp-accordion:1.0"]

```html
<amp-accordion>
  <section
    [expanded]="sectionOne"
    on="expand:AMP.setState({sectionOne: true});collapse:AMP.setState({sectionOne: false})"
  >
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section expanded>
    <h2>Section 3</h2>
    <div>Bunch of awesome content</div>
  </section>
</amp-accordion>
<button on="tap:AMP.setState({sectionOne: true})">Expand section 1</button>
<button on="tap:AMP.setState({sectionOne: false})">Collapse section 1</button>
```

[/example]

### expand-single-section

Allow only one section to expand at a time by applying the `expand-single-section` attribute to the `<amp-accordion>` element. This means if a user taps on a collapsed `<section>`, it will expand and collapse other expanded `<section>`'s.

[example preview="top-frame" playground="true" imports="amp-accordion:1.0"]

```html
<amp-accordion expand-single-section>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <amp-img
      src="{{server_for_email}}/static/inline-examples/images/squirrel.jpg"
      width="320"
      height="256"
    ></amp-img>
  </section>
</amp-accordion>
```

[/example]

## Styling

The `amp-accordion` element selector styles an `amp-accordion` according to your
specifications. The following example changes the background color to green:

```css
amp-accordion {
  background-color: green;
}
```

Keep the following points in mind when you style an amp-accordion:

-   `amp-accordion` elements are always `display: block`.
-   `float` cannot style a `<section>`, heading, nor content elements.
-   An expanded section applies the `expanded` attribute to the `<section>`
    element.
-   The content element is clear-fixed with `overflow: hidden` and hence cannot
    have scrollbars.
-   Margins of the `<amp-accordion>`, `<section>`, heading, and content elements
    are set to `0`, but can be overridden in custom styles.
-   Both the header and content elements are `position: relative`.

## Accessibility

`amp-accordion` automatically adds the following [ARIA attributes](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA):

-   `aria-controls`: Applied to the header element of each `amp-accordion` section.
-   `aria-expanded (state)`: Applied to the header element of each `amp-accordion` section.
-   `aria-labelledby`: Applied to the content element of each `amp-accordion` section.

`amp-accordion` also automatically adds the following accessibility attributes:

-   `tabindex`: Applied to the header element of each `amp-accordion` section.
-   `role=button`: Applied to the header element of each `amp-accordion` section.
-   `role=region`: Applied to the content element of each `amp-accordion` section.

## Version notes

The experimental `1.0` version of `amp-accordion` does not support session states. It behaves as if the `disable-session-states` attribute is always applied.

Version `0.1` and `1.0` are compatible with `amp-bind`, but some binding syntax is different. You may bind directly with the `expanded` attribute in version `1.0`. The `[data-expanded]` is not supported in version `1.0`. See the `expanded` attribute below for further information.
