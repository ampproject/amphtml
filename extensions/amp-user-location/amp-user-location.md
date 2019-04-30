---
$category: presentation
formats:
  - ads-analytics
  - websites
  - dynamic-content
teaser:
  text: Request the user's precise location.
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

# `amp-user-location`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Requests the user's location and provides it to AMP components.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Experimental. The `amp-user-location` experiment must be enabled to use this component.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-user-location" src="https://cdn.ampproject.org/v0/amp-user-location-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <!-- TODO(cvializ) -->
  <!-- <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>FILL THIS IN</td>
  </tr> -->
</table>

## Behavior

The `amp-user-location` component can be used in combination with other components to
send the user's location as part of other AMP components' requests. For example, to send the user's
location with a form or an analytics request, the Variable Substitution variables can be used.

## Attributes

The `amp-user-location` component only requires an `id` attribute.

## AMP Actions

`amp-user-location` exposes the `request` action. This action is required to send the user's location
to another AMP component. This will cause the browser to prompt the user to approve location access
for the current domain, if the user has not already.

```html
<button on="tap: location.request()">Use my location</button>
<amp-user-location id="location" on="approve:…" layout="nodisplay">
</amp-user-location>
```

## AMP Events

`amp-user-location` exposes the following events

<table>
<tr>
<th width="30%">Event</th>
<th>Description</th>
</tr>
<tr>
<td><code>approve</code></td>
<td>This event is fired when the user triggers the `request` action and then approves the browser prompt to access their location, or the user has previously approved the prompt.</td>
</tr>
<tr>
<td><code>deny</code></td>
<td>This event is fired when the user triggers the `request` action and then denies the browser prompt to access their location, or the user has previously denied the prompt.</td>
</tr>
<td><code>error</code></td>
<td>This event is fired when the user triggers the `request` action and and error occurs. This can happen if the browser takes too long to retrieve the location information, if the hardware is unavailable, or other errors occur.</td>
</tr>
</table>

## Variable Substitution

The user's location is also available via AMP variable substitution:

`AMP_USER_LOCATION` or `${ampUserLocation}` returns the latitude and longitude separated by a comma.
`AMP_USER_LOCATION(LAT)` or `${ampUserLocation(LAT)}` returns the latitude.
`AMP_USER_LOCATION(LON)` or `${ampUserLocation(LON)}` returns the longitude.


## Validation
See [amp-user-location rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-user-location/validator-amp-user-location.protoascii) in the AMP validator specification.
