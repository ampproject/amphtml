<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-graphiq"></a> `amp-graphiq`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a [Graphiq embed](https://www.graphiq.com/).</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-graphiq" src="https://cdn.ampproject.org/v0/amp-graphiq-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <!-- <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-graphiq/">Annotated code example for amp-graphiq</a></td>
  </tr> -->
</table>

## Behavior

The `width` and `height` attributes are passed to the Graphiq embed in order to set its initial render dimension, however the component will resize itself as necessary once rendered.

Example:
```html
<amp-graphiq
    data-widget-id="dUuriXJo2qx"
    width="600"
    height="512"
    layout="responsive">
</amp-graphiq>
```

## Attributes

**data-widget-id** (required)

The Graphiq widget id.

**data-href** (optional)

The `data-href` attribute can optionally be defined to override the default href used for the "See more details" link which appears in the widget. The default behavior is to link to an expanded view of the widget on Graphiq's site.

**data-frozen** (optional)

The existence of the `data-frozen` attribute will set the subdomain of the widget to `sw.graphiq.com`, indicating that the widget was frozen. A frozen widget's data does not update - it reflects whatever the data was at the time of freezing. `data-frozen` only changes the subdomain, **it does not freeze the visualization**. Thus, it can only be set for an already frozen widget, usually provided directly from Graphiq (which executes the freezing).

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-graphiq rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-graphiq/0.1/validator-amp-graphiq.protoascii) in the AMP validator specification.
