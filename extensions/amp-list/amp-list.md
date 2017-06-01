<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-list"></a> `amp-list`

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Fetches content dynamically from a CORS JSON endpoint and renders it
using a supplied template.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-list" src="https://cdn.ampproject.org/v0/amp-list-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-list/">Annotated code example for amp-list</a></td>
  </tr>
</table>

## Usage

The `amp-list` component fetches dynamic content from a CORS JSON endpoint. The response from the endpoint contains an array, which is rendered in the specified template.  

{% call callout('Important', type='caution') %}
Your endpoint must implement the requirements specified in the [CORS Requests in AMP](../../spec/amp-cors-requests.md) spec.
{% endcall %}

You can specify a template in one of two ways:

- a `template` attribute that references an ID of an existing `template` element.
- a `template` element nested directly inside the `amp-list` element.
  
For more details on templates, see [AMP HTML Templates](../../spec/amp-html-templates.md).

In the following example, we retrieve JSON data that contains image URLs and titles, and render the content in a nested [amp-mustache template](https://www.ampproject.org/docs/reference/components/amp-mustache).

```html
<amp-list src="https://data.com/images.json"
    width="300" height="200" layout="responsive">
  <template type="amp-mustache">
    <div>
      <amp-img src="{{imageUrl}}" width="50" height="50"></amp-img>
      {{title}}
    </div>
  </template>
</amp-list>
```

JSON data:

```json
{
  "items": [
    {
      "title": "Image 01",
      "imageUrl": "https://example.com/images/flowers.jpg"
    },

    {
      "title": "Image 02",
      "imageUrl": "https://example.com/images/sunset.jpg"
    }
  ]
}
```

## Behavior

The request is always made from the client, even if the document was served from the AMP Cache. Loading is triggered using normal AMP rules depending on how far the element is from
the current viewport.

If `amp-list` needs more space after loading, it requests the AMP runtime to update its
height using the normal AMP flow. If the AMP runtime cannot satisfy the request for the new
height, it will display the `overflow` element when available. Notice however, that the typical
placement of `amp-list` elements at the bottom of the document almost always guarantees
that the AMP runtime can resize them.

By default, `amp-list` adds a `list` ARIA role to the list element and a `listitem` role to item
elements rendered via the template.

### Specifying an overflow

Optionally, the `amp-list` element can contain an element with an `overflow` attribute. This element is shown if the AMP Runtime cannot resize the `amp-list` element as requested.

```css
.list-overflow[overflow] {
  position: absolute;
  bottom: 0;
}
```

```html
<amp-list src="https://data.com/articles.json?ref=CANONICAL_URL"
    width=300 height=200 layout=responsive>
  <template type="amp-mustache">
    <div>
      <amp-img src="{{imageUrl}}" width="50" height="50"></amp-img>
      {{title}}
    </div>
  </template>
  <div overflow role=button aria-label="Show more" class="list-overflow">
    Show more
  </div>
</amp-list>
```

## Attributes

**src** (required)

The URL of the remote endpoint that returns the JSON that will be rendered
within this `amp-list`. This must be a CORS HTTP service. The URL's protocol must be HTTPS.

{% call callout('Important', type='caution') %}
Your endpoint must implement the requirements specified in the [CORS Requests in AMP](../../spec/amp-cors-requests.md) spec.
{% endcall %}

**credentials** (optional)

Defines a `credentials` option as specified by the [Fetch API](https://fetch.spec.whatwg.org/).

* Supported values: `omit`, `include`
* Default: `omit`

To send credentials, pass the value of `include`. If this value is set, the response must follow the [AMP CORS security guidelines](../../spec/amp-cors-requests.md).

**items** (optional)

Defines the expression to locate the array to be rendered within the response. This is a dot-notated expression that navigates via fields of the JSON response.

- The default value is `"items"`. The expected response: `{items: [...]}`.
- If the response itself is the desired array, use the value of `"."`. The expected response is: `[...]`.
- Nested navigation is permitted (e.g., `"field1.field2"`). The expected response is: `{field1: {field2: [...]}}`.


When `items="items"` is specified (which, is the default) the response must be a JSON object that contains an array property called `"items"`:
```text
{
  "items": [...]
}
```

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Substitutions

The `amp-list` allows all standard URL variable substitutions.
See the [Substitutions Guide](../../spec/amp-var-substitutions.md) for more info.

For example:
```html
<amp-list src="https://foo.com/list.json?RANDOM"></amp-list>
```
may make a request to something like `https://foo.com/list.json?0.8390278471201` where the RANDOM value is randomly generated upon each impression.


## Validation

See [amp-list rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-list/0.1/validator-amp-list.protoascii) in the AMP validator specification.
