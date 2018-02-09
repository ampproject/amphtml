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
    <td>Provides a way for viewers to glance at the content outline and jump to any section. This is helpful for mobile devices where even a couple of sentences into a section requires scrolling.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-accordion" src="https://cdn.ampproject.org/v0/amp-accordion-0.1.js">&lt;/script></code></td>
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

[TOC]

## Behavior

The `amp-accordion` component allows you to display collapsible and expandable content sections. Each of the `amp-accordion` component’s immediate children is considered a section in the accordion. Each of these nodes must be a `<section>` tag.

- An `amp-accordion` can contain one or more `<section>` elements as its direct children.
- Each `<section>` must contain exactly two direct children.
- The first child (of the section) represents the heading for the section and must be a heading element (one of `h1`, `h2`, ..., `h6`, `header`).
- The second child (of the section) can be any tag allowed in AMP HTML and represents the content of the section.
- Clicking/tapping on the heading of a section expands or collapses the section.
- The collapsed/expanded state of each section in the `amp-accordion` element will be preserved for the session level. To opt out of preserving this state, add the `disable-session-states` attribute to the `amp-accordion` element.

#### Example: Displaying an accordion

In this example, we display three sections, where the third section is expanded on page load.  Also, we opted out of preserving the collapsed/expanded state by setting `disable-session-states`.

<!--embedded example - displays in ampproject.org -->
<div>
<amp-iframe height="395"
    layout="fixed-height"
    sandbox="allow-scripts allow-forms allow-same-origin"
    resizable
    src="https://ampproject-b5f4c.firebaseapp.com/examples/ampaccordion.basic.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div> 
</amp-iframe>
</div>

{% call callout('Tip', type='success') %}
To see more demos of the `amp-accordion`, visit [AMP By Example](https://ampbyexample.com/components/amp-accordion/).
{% endcall %}

### Actions

#### `toggle`
This action toggles between the `expanded` and `collapsed` states of the `amp-accordion`. When called with no arguements, it will toggle all sections of the accordion. A single section may be specified with the `section` arguement and the corresponding `id` as the value.

#### `expand`
This action expands an `amp-accordion`. If it is already `expanded`, it will stay so. When called with no arguements, it will expand all sections of the accordion. A single section may be spefified with the `section` arguement and the corresponding `id` as the value.

#### `collapse`
This action collapses an `amp-accordion`. If it is already collapsed, it will stay so. When called with no arguements, it will collapse all sections of the accordion. A single section may be spefified with the `section` arguement and the corresponding `id` as the value.

#### Attributes

##### disable-session-states

Set this attribute on the `<amp-accordion>` to opt out of preserving the collapsed/expanded state of the accordion.

#####  expanded

Set this attribute on a `<section>` to display the section as expanded on page load.

#####  expand-single-section

Set this attribute on the `<amp-accordion>` to only allow one `<section>` to be expanded at a time. If the user focuses on one `<section>` any other previously expanded `<section>` will be collapsed.

## Styling

- You may use the `amp-accordion` element selector to style it freely.
- `amp-accordion` elements are always `display: block`.
- The `<section>`, heading, and content elements cannot be float-able.
- When the section is expanded, the `<section>` element has an `expanded` attribute.
- The content element is clear-fixed with `overflow: hidden` and hence cannot have scrollbars.
- Margins of the `<amp-accordion>`, `<section>`, heading, and content elements are set to 0 and can be overridden in custom styles.
- Both the header and content elements are `position: relative`.

## Validation

See [amp-accordion rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-accordion/validator-amp-accordion.protoascii) in the AMP validator specification.
