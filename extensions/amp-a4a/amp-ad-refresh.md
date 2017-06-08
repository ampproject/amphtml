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
# AMP Ad Refresh

AMP Ad Refresh permits amp-ad tags using Fast Fetch to undergo periodic refresh events. Each such event re-issues a new ad request and attempts to display the returned creative.

## Network-level Configuration

Networks wishing to opt-in to this feature must add a refresh configuration object to `refreshConfigs` in ads/_a4a-config.js. The configuration must specify the following parameters:

<table>
  <tr>
    <td>Parameter</td>
    <td>Description</td>
    <td>Permitted Values</td>
  <tr>
    <td>visiblePercentageMin</td>
    <td>The minimum ratio of creative pixels that must be on screen before the refresh timer is started.</td>
    <td>Must be an integer between 0 and 100, inclusive.</td>
  </tr>
  <tr>
    <td>totalTimeMin</td>
    <td>The total amount of time, in seconds, that the creative must be on screen before the refresh timer is started.</td>
    <td>Any positive numerical value.</td>
  </tr>
   <tr>
    <td>continuousTimeMin</td>
    <td>The amount of continuous time, in seconds, that the creative must be on screen before the refresh timer is started.</td>
    <td>Any positive numerical value.</td>
  </tr>
</table>

For convenience, ada/_a4a-config.js contains a default configuration object.

## Page-level Configuration

Refresh may be enabled across all eligible slots for a set of opted-in network on a page by adding the following metadata tag:

`<meta name="amp-ad-refresh" content=”network1=refresh_interval1,network2=refresh_interval2,...">`

Where `refresh_interval` is the time, in seconds, in between refresh cycles. This value must be numeric and no less than 30. Individual slots may be opted-out of refresh by adding `data-enable-refresh=false` to the slot.

## Slot-level Configuration

An individual slot is eligible to be refreshed if it is configured as:

```
<amp-ad 
 ...
 data-enable-refresh=refresh_interval>
```
If `refresh_interval` is set to false, then this slot will not be refresh-enabled, even if page-level configurations are set.
