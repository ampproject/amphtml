---
$category@: layout
formats:
  - websites
  - ads
  - email
teaser:
  text: A stacked list of headers that collapse or expand content sections with user interaction.
---

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
    can be any tag allowed in [AMP HTML](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md).
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
    can be any tag allowed in [AMP for Email](https://github.com/ampproject/amphtml/blob/main/docs/spec/email/amp-email-html.md).
-   A click or tap on a `<section>` heading expands or collapses the section.

[/filter]

## Example

The example below contains an `amp-accordion` with three sections. The
`expanded` attribute on the third section expands it on page load.
[filter formats="websites, ads"]Include the `disable-session-state` attribute
to preserve the collapsed/expanded state.[/filter]

[example preview="top-frame" playground="true"]

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

### animate

Include the `animate` attribute in `<amp-accordion>` to add a "roll down"
animation when the content is expanded and "roll up" animation when collapsed.

[example preview="top-frame" playground="true"]

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

[filter formats="websites"]

### disable-session-states

Include the `disable-session-states` attribute on `<amp-accordion>` to disable
collapsed/expanded state preservation.

[/filter] <!-- formats="websites" -->

### expanded

Apply the `expanded` attribute to a nested `<section>` to expand that section when the page loads.

### expand-single-section

Apply the `expand-single-section` attribute to `amp-accordion` to specify that
only one `<section>` can expand at a time. If the user clicks or taps on a
collapsed `<section>`, any currently expanded `<section>` collapses.

[example preview="top-frame" playground="true"]

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

### [data-expand]

Bind the `[data-expand]` attribute to a `<section>` to expand or collapse that
section. An expanded section collapses if the expression evaluates as false. A
collapsed section expands if the expression evaluates as anything other than
false.

[example preview="top-frame" playground="true"]

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

[filter formats="websites"]

## Actions

### toggle

The `toggle` action switches the `expanded` and `collapsed` states of
`amp-accordion` sections. When called with no arguments, it toggles all sections
of the accordion. To specify a specific section, add the `section` argument and
use its corresponding `id` as the value.

[example preview="top-frame" playground="true"]

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

### expand

The `expand` action expands the sections of the `amp-accordion`. If a section
is already expanded, it stays expanded. When called with no arguments, it
expands all sections of the accordion. To specify a section, add the `section` argument, and use its corresponding `id` as the value.

```html
<button on="tap:myAccordion.expand">Expand All Sections</button>
<button on="tap:myAccordion.expand(section='section1')">
  Expand Section 1
</button>
```

### collapse

The `collapse` action collapses the sections of the `amp-accordion`. If a
section is already collapsed, it stays collapsed. When called with no arguments,
it collapses all sections of the accordion. To specify a section, add the
`section` argument, and use its corresponding `id` as the value.

```html
<button on="tap:myAccordion.collapse">Collapse All Sections</button>
<button on="tap:myAccordion.collapse(section='section1')">
  Collapse Section 1
</button>
```

[/filter] <!-- formats="websites" -->

## Events

The following `amp-accordion` events trigger on accordion sections when they're
clicked or tapped.

### expand

The `expand` event triggers the targeted `amp-accordion` section to change from
the collapsed state to the expanded state. Call `expand` on an already expanded
section to trigger the `expand` event.

[example preview="top-frame" playground="true"]

```html
<amp-accordion id="myAccordion">
  <section id="section1" on="expand:myAccordion.expand(section='section2')">
    <h2>Section 1</h2>
    <p>Opening me will open Section 2</p>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Bunch of awesome content</div>
  </section>
</amp-accordion>
```

[/example]

### collapse

The `collapse` event triggers the targeted `amp-accordion` section to change
from the expanded state to the collapsed state. Call `collapse` on an already
collapsed section to trigger the event.

[example preview="top-frame" playground="true"]

```html
<amp-accordion id="myAccordion">
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

## Validation

See [amp-accordion rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-accordion/validator-amp-accordion.protoascii)
in the AMP validator specification.
