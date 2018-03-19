<!---
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

# AMP Ad Refresh
AMP Ad Refresh permits amp-ad tags using Fast Fetch to undergo periodic refresh events. Each such event re-issues a new ad request and attempts to display the returned creative.

### Network-level Configuration

For a network to make use of Refresh, its corresponding implementation must create an instance of RefreshManager and call
`initiateRefreshCycle`. The simplest way to do so is to use the exported `getRefreshManager` function from refresh-manager.js:

```javascript
import {getRefreshManager} from '../../amp-a4a/0.1/refresh-manager';

// ...

const refreshManager = getRefreshManager(this);
refreshManager.initiateRefreshCycle();
```

While `getRefreshManager` is convenient, it does not allow for customization. It returns a RefreshManager with default configurations (specified in the table below). To customize the RefreshManager, you must invoke its constructor directly:

```javascript
import {
  getRefreshManager,
  getPublisherSpecifiedRefreshInterval,
} from '../../amp-a4a/0.1/refresh-manager';

// ...

const refreshConfig = { /* see table below for configuration parameters */ };
const refreshInterval = getPublisherSpecifiedRefreshInterval(this.element, this.win);
const refreshManager = new RefreshManager(this, refreshConfig, refreshInterval);
refreshManager.initiateRefreshCycle();
```

Optionally, a network may override AmpA4a's `refresh` method, which would allow it to insert custom logic in between refresh events. Note: RefreshManager passes a callback to `refresh` which must be invoked in order to reset the cycle; if it is not invoked, the RefreshManager will become idle until either the callback or `initiateRefreshCycle` is called. If `refresh` is not overridden, this is handled automatically by AmpA4a.

<table>
  <tr>
    <td>Parameter</td>
    <td>Description</td>
    <td>Permitted Values</td>
    <td>Default Value</td>
  <tr>
    <td>visiblePercentageMin</td>
    <td>The minimum ratio of creative pixels that must be on screen before the refresh timer is started.</td>
    <td>Must be an integer between 0 and 100, inclusive.</td>
    <td>50%</td>
  </tr>
  <tr>
    <td>continuousTimeMin</td>
    <td>The amount of continuous time, in seconds, that the creative must be on screen before the refresh timer is started.</td>
    <td>Any positive numerical value.</td>
    <td>1 s</td>
  </tr>
</table>

### Page-level Configuration

Refresh may be enabled across all eligible slots for a set of opted-in network on a page by adding the following metadata tag:

`<meta name="amp-ad-refresh" content="network1=refresh_interval1,network2=refresh_interval2,...">`

Where `refresh_interval` is the time, in seconds, in between refresh cycles. This value must be numeric and no less than 30. Individual slots may be opted-out of refresh by adding `data-enable-refresh=false` to the slot.

### Slot-level Configuration

An individual slot is eligible to be refreshed if it is configured as:

```
<amp-ad
 ...
 data-enable-refresh=refresh_interval>
```
If `refresh_interval` is set to false, then this slot will not be refresh-enabled, even if page-level configurations are set.

#### SRA Compatibility

Refresh is currently not supported for SRA enabled slots. If a slot is enabled for both, refresh will be disabled, and an error will be logged to the user's console.

#### AMP Ad Container Compatibility

The only AMP ad containers in which refresh is currently supported are amp-sticky-ad and amp-carousel container types.

#### <a href="amp-ad-network-doubleclick-impl-internal.md">Back to DoubleClick</a>
