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

### <a name="amp-list"></a> `amp-list`

The `amp-list` fetches the dynamic content from a CORS JSON endpoint and renders it
using a supplied template.

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays an iframe.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-iframe" src="https://cdn.ampproject.org/v0/amp-iframe-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/everything.amp.html">everything.amp.html</a></td>
  </tr>
</table>

The following lists validation errors specific to the `amp-iframe` tag
(see also `amp-iframe` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/validator/validator.protoascii):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#tag-required-by-another-tag-is-missing">TAG_REQUIRED_BY_MISSING</a></td>
    <td>Error thrown when required <code>amp-list</code> extension <code>.js</code> script tag is missing or incorrect.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#mandatory-attribute-missing">MANDATORY_ATTR_MISSING</a></td>
    <td>Error thrown when <code>src</code> attribute is missing.</td>
  </tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">IMPLIED_LAYOUT_INVALID</a></td>
    <td>Error thrown when implied layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">SPECIFIED_LAYOUT_INVALID</a></td>
    <td>Error thrown when specified layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#invalid-property-value">INVALID_PROPERTY_VALUE_IN_ATTR_VALUE</a></td>
    <td>Error thrown when invalid value is given for attributes <code>height</code> or <code>width</code>. For example, <code>height=auto</code> triggers this error for all supported layout types, with the exception of <code>NODISPLAY</code>.</td>
  </tr>
</table>

#### Usage

The `amp-list` defines data source using the following attributes:

- `src` defines a CORS URL. The URL's protocol must be HTTPS.
- `credentials` defines a `credentials` option as specified by the
[Fetch API](https://fetch.spec.whatwg.org/). To send credentials, pass the
value of "include". If this is set, the response must follow the [AMP CORS security guidelines](../../spec/amp-cors-requests.md).

The response must be a JSON object that contains an array property "items":
```json
{
  "items": []
}
```

The template can be specified using either of the following two ways:

- `template` attribute that references an ID of an existing `template` element.
- `template` element nested directly inside of this `amp-list` element.

For more details on templates see [AMP HTML Templates](../../spec/amp-html-templates.md).

Optionally, `amp-list` element can contain an element with `overflow` attribute. This
element will be shown if AMP Runtime cannot resize the `amp-list` element as requested.

An example:
```html
<amp-list src="https://data.com/articles.json?ref=CANONICAL_URL"
    width=300 height=200 layout=responsive>
  <template type="amp-mustache">
    <div>
      <amp-img src="{{imageUrl}}" width=50 height=50></amp-img>
      {{title}}
    </div>
  </template>
  <div overflow role=button aria-label="Show more" class="list-overflow">
    Show more
  </div>
</amp-list>
```

```css
.list-overflow {
  position: absolute;
  bottom: 0;
}
```

The `amp-list` supports the following layouts: `fixed`, `fixed-height`,
`responsive`, `fill`. See [AMP HTML Layout System](../../spec/amp-html-layout.md)
for details.

#### Substitutions

The `amp-list` allows all standard URL variable substitutions.
See [Substitutions Guide](../../spec/amp-var-substitutions.md) for more info.

For instance:
```html
<amp-list src="https://foo.com/list.json?RANDOM"></amp-list>
```
may make a request to something like `https://foo.com/list.json?0.8390278471201` where the RANDOM value is randomly generated upon each impression.

#### Behavior

The loading is triggered using normal AMP rules depending on how far the element is from
the current viewport.

If `amp-list` needs more space after loading it requests the AMP runtime to update its
height using the normal AMP flow. If AMP Runtime cannot satisfy the request for new
height, it will display `overflow` element when available. Notice however, the typical
placement of `amp-list` elements at the bottom of the document almost always guarantees
that AMP Runtime can resize it.

By default, `amp-list` adds `list` ARIA role to the list element and `listitem` role to item
elements rendered via the template.
