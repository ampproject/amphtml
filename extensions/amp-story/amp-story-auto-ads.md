<!--
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# <a name="`amp-story-auto-ads`"></a> `amp-story-auto-ads`

## THIS IS A WORK-IN-PROGRESS

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Dynamically inserts ads into a Story.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>N/A</td>
  </tr>
</table>

## Behavior
`amp-story-auto-ads` extension dynamically inserts ads (implemented as `amp-ad`)
into the story while content is being consumed by the user.

Each `amp-ad` is inserted as a full screen story page. To prevent showing
blank/unloaded ads, the ad is pre-rendered completely in the background before
making it visible to the user. Based on user interactions, the extension decides when
and where to insert ads.

Ad in story can be skipped the same way as normal story pages by tapping on the
right part of the screen.

## Configuration
In the `<amp-story-auto-ads>` element, you specify a JSON configuration object
that contains the details for how ads should be fetched and displayed, which
looks like the following:

```html
<amp-story>
  <amp-story-auto-ads>
    <script type="application/json">
      {
        "ad-attributes": {
          "type": "custom",
          "data-url": "https://adserver.com/getad?slot=abcd1234"
        }
      }
    </script>
  </amp-story-auto-ads>
  <amp-story-page>
  ...
</amp-story>
```

`ad-attributes` is a map of key-value pairs, which are the attributes of the
 `amp-ad` element to be inserted.

The above example will insert the following `amp-ad` element, which represents
a [custom ad](../../ads/custom.md):

```html
<amp-ad type="custom"
  data-url="https://adserver.com/getad?slot=abcd1234"
</amp-ad>
```

Unlike normal `amp-ad`, no `<fallback>` or `<placeholder>` needs to be specified
here, as ads in story can only be displayed once fully rendered.

## Inlined templates
If [custom ad](../../ads/custom.md) is used, templates can be inlined in the
`<amp-story-auto-ads>` element:

```html
  <amp-story-auto-ads>
    <script type="application/json">
        {
          "ad-attributes": {
            "type": "custom",
            "data-url": "https://adserver.com/getad?slot=abcd1234"
          }
        }
    </script>

    <template type="amp-mustache" id="template-1">
      <amp-img layout="fill" src="{{imgSrc}}"></amp-img>
      <amp-pixel src="{{impressionUrl}}"></amp-pixel>
    </template>

    <template type="amp-mustache" id="template-2">
      <div class="creative-line-1">{{creativeLine1}}</div>
      <div class="creative-line-2">{{creativeLine2}}</div>
      <amp-pixel src="{{impressionUrl}}"></amp-pixel>
    </template>
  </amp-story-auto-ads>
```

## Validation

It has to be a direct child of `amp-story` element.