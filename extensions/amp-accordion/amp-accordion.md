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
    <td width="40%"><strong>Description</strong></td>
    <td>An accordion provides a way for viewers to glance at the content outline and jump to any section. This is helpful for handheld mobile devices where even a couple of sentences into a section requires scrolling.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a>; no validations yet.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-accordion" src="https://cdn.ampproject.org/v0/amp-accordion-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>None</td>
  </tr>
</table>

## Behavior

Each of the `amp-accordion` component’s immediate children is considered a section in the accordion. Each of these nodes must be a `<section>` tag.

- An `amp-accordion` can contain one or more `<section>`s as its direct children.
- Each `<section>` must contain only two direct children.
- The first child (of the section) will be considered as the heading of the section. Clicking/tapping on this section will trigger the expand/collapse behaviour.
- The second child (of the section) will be the content or the section
- There is no restriction on the type of tags that could be used for the `<section>`’s children.
- Any additional children of the `<section>` would be ignored not be displayed. (This should just be a safety backup and should be enforced in the validator)
- Clicking/tapping on the heading of a section expands/ or collapses the section.

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
