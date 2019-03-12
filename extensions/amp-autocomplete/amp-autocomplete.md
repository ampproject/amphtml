---
$category: misc
formats: websites
teaser: 
  text: Suggests completed results corresponding to the user input as they type into the input field.
---
<!--
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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

# `amp-autocomplete`

**This feature is experimental and activated by the `amp-autocomplete` experiment.**

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>An autocomplete-enabled input field suggests completed results corresponding to the user input as they type into the input field.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
     <td><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-autocomplete" src="https://cdn.ampproject.org/v0/amp-autocomplete-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>container</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>AMP By Example coming soon.</td>
  </tr>
</table>

## Behavior

The `amp-autocomplete` extension should be used for suggesting completed items based on user input to help users carry out their task more quickly.

The request is always made from the client, even if the document was served from the AMP Cache. Loading is triggered using normal AMP rules depending on how far the element is from the current viewport.

Filtered results will not be displayed until user focuses on the input field or begins typing into it. Leaving the viewport hides the filtered results.

By default, `<amp-autocomplete>` adds a `list` ARIA role to the filtered results element and a `listitem` role to item elements rendered via the template.

Example:
```html
  <amp-autocomplete filter="substring" id="myAutocomplete">
    <input type="text">
    <script type="application/json">
      { items: ["a", "b", "c"] }
    </script>
  </amp-autocomplete>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>filter [required]</strong></td>
    <td>The filtering mechanism applied to source data to produce filtered results for user input. In all cases the filtered results will be displayed in array order of data retrieved. If filtering is being done (filter != none), it is done client side. The following are supported values:
    <ul>
      <li><strong>substring</strong>: if the user input is a substring of an item, then the item is suggested</li>
      <li><strong>prefix</strong>: if the user input is a prefix of an item, then the item gets suggested</li>
      <li><strong>token-prefix</strong>: if the user input is a prefix of any word in a multi-worded item, then the item gets suggested; example “je” is a token-prefix in “blue jeans”</li>
      <li><strong>fuzzy</strong>: typos in the input field can result in partial match items appearing in the filtered results—need further research</li>
      <li><strong>none</strong>: no client-side rendering; a provided server endpoint will be queried for results</li>
      <li><strong>custom</strong>: a conditional statement involving an item and a user input to be applied to each item such that evaluating to true implies the item gets suggested; using this filter requires including `amp-bind`; if `filter==custom`, an additional attribute `filter-expr` is required to specify a boolean expression by which to perform the custom filter.</li>
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>filter-expr [optional]</strong></td>
    <td>Required if `filter==custom`</td>
  </tr>
  <tr>
    <td width="40%"><strong>min-characters [optional]</strong></td>
    <td>
      The min character length of a user input to provide results, default 1
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>max-entries [optional]</strong></td>
    <td>
      The max specified number of items to suggest at once based on a user input, displays all if unspecified 
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>suggest-first [optional]</strong></td>
    <td>
      Suggest the first entry in the list of results by marking it active; only possible if `filter==prefix` (does nothing otherwise)
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>submit-on-enter [optional]</strong></td>
    <td>
      The enter key is primarily used for selecting suggestions in autocomplete, so it shouldn’t also submit the form unless the developer explicitly sets it to do so (for search fields/one field forms, et cetera). Defaults to false. 
    </td>
  </tr>
</table>
