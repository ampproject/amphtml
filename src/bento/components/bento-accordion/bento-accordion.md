---
$category@: layout
formats:
  - websites
teaser:
  text: A stacked list of headers that collapse or expand content sections with user interaction.
experimental: true
bento: true
---

# bento-accordion

Provides a way for viewers to glance at the content outline and jump to any section. This is helpful for mobile devices where even a couple of sentences into a section requires scrolling.

## Usage

The `bento-accordion` component allows you to display collapsible and expandable
content sections. This component provides a way for viewers to glance at the
content outline and jump to any section. Effective use reduces scrolling needs
on mobile devices.

[filter formats="websites, ads"]

-   An `bento-accordion` accepts one or more `<section>` elements as its direct
    children.
-   Each `<section>` must contain exactly two direct children.
-   The first child in a `<section>` is the heading for that section of the
    `bento-accordion`. It must be a heading element such as `<h1>-<h6>` or
    `<header>`.
-   The second child in a `<section>` is the expandable/collapsible content. It
    can be any tag allowed in [AMP HTML](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md).
-   A click or tap on a `<section>` heading expands or collapses the section.
-   An `bento-accordion` with a defined `id` preserves the collapsed or expanded
    state of each section while the user remains on your domain.

[/filter] <!-- formats="websites, ads" -->

[filter formats="email"]

-   An `bento-accordion` accepts one or more `<section>` elements as its direct
    children.
-   Each `<section>` must contain exactly two direct children.
-   The first child in a `<section>` is the heading for that section of the
    `bento-accordion`. It must be a heading element such as `<h1>-<h6>` or
    `<header>`.
-   The second child in a `<section>` is the expandable/collapsible content. It
    can be any tag allowed in [AMP for Email](https://github.com/ampproject/amphtml/blob/main/docs/spec/email/amp-email-html.md).
-   A click or tap on a `<section>` heading expands or collapses the section.

[/filter]

## Example

The example below contains an `bento-accordion` with three sections. The
`expanded` attribute on the third section expands it on page load.

[example preview="top-frame" playground="true" imports="bento-accordion:1.0"]

```html
<bento-accordion id="my-accordion"{% if not format=='email'%} disable-session-states{% endif %}>
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
</bento-accordion>
```

[/example]

### Standalone use outside valid AMP documents

Bento allows you to use AMP components in non-AMP pages without needing
to commit to fully valid AMP. You can take these components and place them
in implementations with frameworks and CMSs that don't support AMP. Read
more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

To find the standalone version of `bento-accordion`, see [**`bento-accordion`**](./1.0/README.md).

## Attributes

### animate

Include the `animate` attribute in `<bento-accordion>` to add a "roll down"
animation when the content is expanded and "roll up" animation when collapsed.

This attribute can be configured to based on a [media query](./../../../../docs/spec/amp-html-responsive-attributes.md).

[example preview="top-frame" playground="true" imports="bento-accordion:1.0"]

```html
<bento-accordion animate>
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
</bento-accordion>
```

[/example]

### expanded

Apply the `expanded` attribute to a nested `<section>` to expand that section when the page loads.

Use `amp-bind` to bind the `[expanded]` attribute to programmatically expand or collapse a `<section>` element. An expanded section collapses when the expression evaluates as `false`. A collapsed section expands if the expression evaluates to anything other than `false`.

[example preview="top-frame" playground="true" imports="bento-accordion:1.0"]

```html
<bento-accordion>
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
</bento-accordion>
<button on="tap:AMP.setState({sectionOne: true})">Expand section 1</button>
<button on="tap:AMP.setState({sectionOne: false})">Collapse section 1</button>
```

[/example]

### expand-single-section

Allow only one section to expand at a time by applying the `expand-single-section` attribute to the `<bento-accordion>` element. This means if a user taps on a collapsed `<section>`, it will expand and collapse other expanded `<section>`'s.

[example preview="top-frame" playground="true" imports="bento-accordion:1.0"]

```html
<bento-accordion expand-single-section>
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
</bento-accordion>
```

[/example]

## Styling

The `bento-accordion` element selector styles an `bento-accordion` according to your
specifications. The following example changes the background color to green:

```css
bento-accordion {
  background-color: green;
}
```

Keep the following points in mind when you style an bento-accordion:

-   `bento-accordion` elements are always `display: block`.
-   `float` cannot style a `<section>`, heading, nor content elements.
-   An expanded section applies the `expanded` attribute to the `<section>`
    element.
-   The content element is clear-fixed with `overflow: hidden` and hence cannot
    have scrollbars.
-   Margins of the `<bento-accordion>`, `<section>`, heading, and content elements
    are set to `0`, but can be overridden in custom styles.
-   Both the header and content elements are `position: relative`.

## Accessibility

`bento-accordion` automatically adds the following [ARIA attributes](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA):

-   `aria-controls`: Applied to the header element of each `bento-accordion` section.
-   `aria-expanded (state)`: Applied to the header element of each `bento-accordion` section.
-   `aria-labelledby`: Applied to the content element of each `bento-accordion` section.

`bento-accordion` also automatically adds the following accessibility attributes:

-   `tabindex`: Applied to the header element of each `bento-accordion` section.
-   `role=button`: Applied to the header element of each `bento-accordion` section.
-   `role=region`: Applied to the content element of each `bento-accordion` section.

## Version notes

The experimental `1.0` version of `bento-accordion` does not support session states. It behaves as if the `disable-session-states` attribute is always applied.

Version `0.1` and `1.0` are compatible with `amp-bind`, but some binding syntax is different. You may bind directly with the `expanded` attribute in version `1.0`. The `data-expand` binding is not supported in version `1.0`. See the [`expanded` attribute](#expanded) for further information.
