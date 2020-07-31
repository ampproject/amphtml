---
$category: dynamic-content
formats:

- websites
- email
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

# amp-autocomplete

## Usage

The `amp-autocomplete` extension should be used for suggesting completed items based on user input to help users carry out their task more quickly.

[filter formats="email"]

Warning: This component is currently experimental in the AMP for Email format as email clients add support for the feature. Until the component is publicly available in the format, you will notice the component is in some cases valid and sendable in emails but may be only functioning in its fallback behavior capacity across email clients as well as in their respective playgrounds. The fallback for the component does not display autocomplete suggestions, and will behave as the unenhanced `input` or `textarea` field it is given.

[/filter] <!-- formats="email" -->

This can be used to power search experiences, in cases where the user may not know the full range of potential inputs, or in forms to help ensure inputs where there may be multiple ways to express the same intent (using a state abbreviation instead of its full name, for example) yield more predictable results.

Example:

[filter formats="websites"]

```html
<amp-autocomplete filter="substring" id="myAutocomplete">
  <input />
  <script type="application/json">
    {"items": ["a", "b", "c"]}
  </script>
</amp-autocomplete>
```

[/filter] <!-- formats="websites" -->

[filter formats="email"]

```html
<amp-autocomplete
  id="myAutocomplete"
  src="{{server_for_email}}/static/samples/json/amp-autocomplete-cities.json"
>
  <input />
  <template type="amp-mustache">
    <div data-value="{{.}}">{{.}}</div>
  </template>
</amp-autocomplete>
```

[/filter] <!-- formats="email" -->

When using the `src` attribute with `amp-autocomplete`, the response from the endpoint contains data to be rendered in the specified template.

You can specify a template in one of two ways:

- a `template` attribute that references an ID of an existing templating element.
- a templating element nested directly inside the `amp-autocomplete` element.

For more details on templates, see [AMP HTML Templates](../../spec/amp-html-templates.md).

[tip type="note"]
Note also that a good practice is to provide templates a single top-level element to prevent unintended side effects. This also guarantees control of the [`data-value` or `data-disabled`](https://amp.dev/documentation/examples/components/amp-autocomplete/#suggesting-rich-content) attribute on the delimiting element. As an example, the following input:

```html
<template type="amp-mustache">
  {% raw %}
  <!-- NOT RECOMMENDED -->
  <div class="item">{{item}}</div>
  <div class="price">{{price}}</div>
  {% endraw %}
</template>
```

Would most predictably be applied and rendered if instead provided as follows:

```html
<template type="amp-mustache">
  {% raw %}
  <!-- RECOMMENDED -->
  <div data-value="{{items}}">
    <div class="item">{{item}}</div>
    <div class="price">{{price}}</div>
  </div>
  {% endraw %}
</template>
```

[/tip]

## Attributes

[filter formats="websites"]

### `filter` (required)

The filtering mechanism applied to source data to produce filtered results for user input. In all cases the filtered results will be displayed in array order of data retrieved. If filtering is being done (<code>filter != none</code>), it is done client side. The following are supported values:

- `substring`: if the user input is a substring of an item, then the item is suggested
- `prefix`: if the user input is a prefix of an item, then the item gets suggested
- `token-prefix`: if the user input is a prefix of any word in a multi-worded item, then the item gets suggested; example “je” is a token-prefix in “blue jeans”
- `fuzzy`: typos in the input field can result in partial match items appearing in the filtered results—need further research
- `none`: no client-side filter; renders retrieved data based on bound <code>[src]</code> attribute; truncates to <code>max-items</code> attribute if provided
- `custom`: a conditional statement involving an item and a user input to be applied to each item such that evaluating to true implies the item gets suggested; using this filter requires including <code>amp-bind</code> if <code>filter==custom</code>, an additional attribute <code>filter-expr</code> is required to specify a boolean expression by which to perform the custom filter

### `filter-expr`

Required if <code>filter==custom</code>

### `filter-value`

If data is an array of JsonObjects, the filter-value is the property name that will be accessed for client side filtering. This attribute is unnecessary if filter is none. Defaults to "value".

[/filter] <!-- formats="websites" -->

### `src`

The URL of the remote endpoint that returns the JSON that will be filtered and rendered within this <code>amp-autocomplete</code>. This must be a CORS HTTP service and the URL's protocol must be HTTPS. The endpoint must implement the requirements specified in the <a href="https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests?referrer=ampproject.org">CORS Requests in AMP</a> spec. If fetching the data at the src URL fails, the <code>amp-autocomplete</code> triggers a fallback. The src attribute may be omitted if the <code>[src]</code> attribute exists.

### `query`

The query parameter to generate a static remote endpoint that returns the JSON that will be filtered and rendered within this <code>amp-autocomplete</code>. This requires the presence of the <code>src</code> attribute. For example, if <code>src="http://www.example.com"</code> and <code>query="q"</code>, then when a user types in <code>abc</code>, the component will retrieve data from <code>http://www.example.com?q=abc</code>.

### `min-characters`

The min character length of a user input to provide results, default 1

### `max-items`

The max specified number of items to suggest at once based on a user input, displays all if unspecified

### `suggest-first`

Suggest the first entry in the list of results by marking it active; only possible if <code>filter==prefix</code> (does nothing otherwise)

### `submit-on-enter`

The enter key is primarily used for selecting suggestions in autocomplete, so it shouldn’t also submit the form unless the developer explicitly sets it to do so (for search fields/one field forms, et cetera).

The user flow is as follows: If <code>submit-on-enter</code> is <code>true</code>, pressing <code>Enter</code> will select any currently active item and engage in default behavior, including submitting the form if applicable. If <code>submit-on-enter</code> is <code>false</code>, pressing <code>Enter</code> <em>while suggestions are displaying</em> will select any currently active item only and prevent any other default behavior. If suggestions are not displaying, autocomplete allows default behavior. <strong>Defaults to false.</strong>

### `highlight-user-entry`

If present, exposes the <code>autocomplete-partial</code> class on the substring within the suggested item that resulted in its match with the user input. This can be used to stylize the corresponding match to stand out to the user. <strong>Defaults to false.</strong>

### `items`

Specifies the key to the data array within the JSON response. Nested keys can be expressed with a dot-notated value such as <code>field1.field2.</code> The default value is <code>"items"</code>. The following are examples with and without usage:

  <pre lang="html">

      <amp-autocomplete filter="prefix">
          <input type="text">
          <script type=application/json>
            { "items" : ["apples", "bananas", "pears"] }
           </script>

      </amp-autocomplete>

  </pre>
  <pre lang="html">

      <amp-autocomplete filter="prefix" items="fruit">
        <input type="text">
        <script type=application/json>
          { "fruit" : ["apples", "bananas", "pears"] }
          </script>
      </amp-autocomplete>

  </pre>
      In the first example, the JSON payload is queued by the "items" key, and thus no component attribute is needed because the default value corresponds. In the second example, the JSON payload is queued by the "fruit" key, so the <code>items</code> attribute is given the value <code>"fruit"</code> so as to accurately etrieve the intended datasource. In both examples, the end user interaction is the same.

### `inline`

Whether the <code>amp-autocomplete</code> should autosuggest on the full user input or only a triggered substring of the user input. By default when the attribute is absent, suggestions will be based on the full user input. The attribute cannot have an empty value but must take a single character token, i.e. <code>@</code> which activates the autocomplete behavior. For example, if <code>inline="@"</code> then user input of <code>hello</code> will not retrieve suggestions but a user input of <code>hello @abc</code> might trigger options filtered on the substring <code>abc</code>. Currently triggered substrings are delimited on whitespace characters, however this is subject to change in the future.

## Events

### `select`

`amp-autocomplete` triggers the `select` event when the user selects an option
via click, tap, keyboard navigation or accepting typeahead. It also fires the
`select` event if a user keyboard navigates to an item and Tabs away from the
input field. `event` contains the `value` attribute value of the selected
element.

## Validation

See [amp-autocomplete rules](validator-amp-autocomplete.protoascii) in the AMP validator specification.
