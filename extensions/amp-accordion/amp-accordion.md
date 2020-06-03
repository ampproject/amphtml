---
$category@: layout
formats:
  - websites
  - ads
  - email
teaser:
  text: A stacked list of headers that collapse or expand content sections with user interaction.
---

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

# amp-accordion

Provides a way for viewers to glance at the content outline and jump to any section. This is helpful for mobile devices where even a couple of sentences into a section requires scrolling.

## Usage

The `amp-accordion` component allows you to display collapsible and expandable content sections. This component provides a way for viewers to glance at the content outline and jump to any section. Effective use reduces scrolling needs on mobile devices.

[filter formats="websites, ads"]

- An `amp-accordion` accepts one or more `<section>` elements as its direct children.
- Each `<section>` must contain exactly two direct children.
  - The first child in a `<section>` is the heading for that section of the `amp-accordion`. It must be a heading element: [`<h1>-<h6>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/heading_elements) or [`<header>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/header).
  - The second child in a `<section>` is the expandable/collapsable content. It can be any tag allowed in [AMP HTML](../../spec/amp-html-format.md).
- Clicking/tapping on a `<section>` heading expands or collapses the section.
- An `amp-accordion` with a defined `id` preserves the collapsed/expanded state of each section while the user remains on your domain.

[/filter] <!-- formats="websites, ads" -->
[filter formats="email"]

- An `amp-accordion` accepts one or more `<section>` elements as its direct children.
- Each `<section>` must contain exactly two direct children.
  - The first child in a `<section>` is the heading for that section of the `amp-accordion`. It must be a heading element: [`<h1>-<h6>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/heading_elements) or [`<header>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/header).
  - The second child in a `<section>` is the expandable/collapsable content. It can be any tag allowed in [AMP for Email](../../spec/email/amp-email-html.md).
- Clicking/tapping on a `<section>` heading expands or collapses the section.

[/filter] <!-- formats="email" -->

### Example

The example below contains an `amp-accordion` with three sections. The `expanded` attribute on the third section expands it on page load. [filter formats="websites, ads"]Including the `disable-session-state` attribute preserves the collapsed/expanded state.[/filter] <!-- formats="websites, ads" -->

[example preview="inline" playground="true" imports="amp-accordion"]

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

## Attributes

### `animate`

Include the `animate` attribute on `<amp-accordion>` to add a slight "roll down" animation on expansion, and "roll up" animation on collapse.

[example preview="inline" playground="true" imports="amp-accordion"]

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

[filter formats="websites, stories"]

### `disable-session-states`

Include the `disable-session-states` attribute on `<amp-accordion>` to disable collapsed/expanded state preservation.

[/filter]<!-- formats="websites, stories" -->

### `expanded`

Include the `expanded` attribute on one or more nested `<section>` to display those section as expanded on page load.

### `expand-single-section`

Include the `expand-single-section` attribute to enforce one `<section>` expansion at a time. If the user clicks/taps on an unopened `<section>`, any currently expanded `<section>` will collapse.

[example preview="inline" playground="true" imports="amp-accordion"]

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

### `[data-expand]`

Bind the `[data-expand]` attribute on a `<section>` to expand or collapse the section. An expanded section will collapse if the expression evaluates to false. A collapsed section will expand if the expression evaluates to anything that is not false.

[example preview="inline" playground="true" imports="amp-accordion, amp-bind"]

```html
<amp-accordion>
  <section
    [data-expand]="sectionOne"
    on="expand:AMP.setState({sectionOne: true});collapse:AMP.setState({sectionOne: false})"
  >
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
<button on="tap:AMP.setState({sectionOne: true})">Expand section 1</button>
<button on="tap:AMP.setState({sectionOne: false})">Collapse section 1</button>
```

[/example]

[filter formats="websites, stories"]

## Actions

### `toggle`

The `toggle` action switches the `expanded` and `collapsed` states of the `amp-accordion` sections. When called with no arguments, it will toggle all sections of the accordion. Specify a specific section by adding the `section` argument and the corresponding `id` as the value.

[example preview="inline" playground="true" imports="amp-accordion"]

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
<button on="tap:myAccordion.toggle">Toggle All Sections</button>
<button on="tap:myAccordion.toggle(section='section1')">
  Toggle Section 1
</button>
```

[/example]

### `expand`

The `expand` action expands the sections of the `amp-accordion`. If a section is already expanded, it will stay expanded. When called with no arguments, it will expand all sections of the accordion. Specify a section by adding the `section` argument and the corresponding `id` as the value.

```html
<button on="tap:myAccordion.expand">Expand All Sections</button>
<button on="tap:myAccordion.expand(section='section1')">
  Expand Section 1
</button>
```

### `collapse`

The `collapse` action collapses the sections of the `amp-accordion`. If a section is already collapsed, it will stay collapsed. When called with no argument, it will collapse all section of the accordion. Specify a section by adding the `section` argument and the corresponding `id` as the value.

```html
<button on="tap:myAccordion.collapse">Collapse All Sections</button>
<button on="tap:myAccordion.collapse(section='section1')">
  Collapse Section 1
</button>
```

[/filter]<!-- formats="websites, stories" -->

## Events

The `amp-accordion` events below trigger on accordion sections when clicked.

[example preview="inline" playground="true" imports="amp-accordion"]

```html
<amp-accordion id="myAccordion">
  <section id="section1" on="expand:myAccordion.expand(section='section2')">
    <h2>Section 1</h2>
    <p>Opening me will open Section 2</p>
  </section>
  <section id="section2" on="collapse:myAccordion.collapse(section='section1')">
    <h2>Section 2</h2>
    <div>Closing me will close Section 1</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Bunch of awesome content</div>
  </section>
</amp-accordion>
```

[/example]

### `expand`

The `expand` event triggers on the target `amp-accordion` section that changes from the collapsed state to the expanded state. Calling `expand` on an already expanded section will not trigger the `expand` event.

### `collapse`

The `collapse` event triggers on the target `amp-accordion` section that changes from the expanded state to the collapsed state. Calling `collapse` on an already collapsed section will not trigger the event.

## Styling

Use the `amp-accordion` element selector to style an `amp-accordion`.

```css
amp-accordion {
  background-color: green;
}
```

- `amp-accordion` elements are always `display: block`.
- [`float`](https://www.w3schools.com/cssref/pr_class_float.asp) cannot style the `<section>`, heading, and content elements.
- An expanded section applies the `expanded` attribute to the `<section>` element.
- The content element is clear-fixed with `overflow: hidden` and hence cannot have scrollbars.
- Margins of the `<amp-accordion>`, `<section>`, heading, and content elements are set to 0 and can be overridden in custom styles.
- Both the header and content elements are `position: relative`.

## Accessibility

`amp-accordion` automatically adds the following [ARIA attributes](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA):

- [`aria-controls`](https://www.w3.org/TR/wai-aria-1.1/#aria-controls): applied to the header element of each `amp-accordion` section.
- [`aria-expanded` (state)](https://www.w3.org/TR/wai-aria-1.1/#aria-expanded): applied to the header element of each `amp-accordion` section.

## Validation

See [amp-accordion rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-accordion/validator-amp-accordion.protoascii) in the AMP validator specification.
