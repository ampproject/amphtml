<!---
Copyright 2015 Cxense. All Rights Reserved.

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

# <a name="amp-cxense-player"></a> `amp-cxense-player`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>An <code>amp-cxense-player</code> component displays Cxense widgets/Players</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-cxense-player" src="https://cdn.ampproject.org/v0/amp-cxense-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-cxense-player">amp-cxense-player.html</a></td>
  </tr>
</table>

## Example

Example:

```html
<amp-cxense-player
    data-widget="12345"
    data-api-key="xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    data-item-id="987654"
    data-locale="fr"
    data-color="orange"
    data-ad-tag="https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dskippablelinear&correlator="
    data-poster="http://i.imgur.com/WLLeLjK.jpg"
    layout="responsive"
    width="480" height="480">
</amp-cxense-player>
```

## Attributes

**data-poster**

A poster URL to be used as a placeholder while the widget is loading.
Future work will involve ability to detect each item or playlist thumbnail without the need of the poster attribute

**data-***

All other `data-*` attributes will be will plumbed through to the widgets configs just like any other cxense widget.

### For example

**data-widget**

The cxense widget id.

**data-api-key**

The cxense api key.

**data-item-id**

The cxense media item key.