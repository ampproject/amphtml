# AMP Ad Refresh

AMP Ad Refresh permits amp-ad tags using Fast Fetch to undergo periodic refresh events. Each such event issues a new ad request and attempts to display the returned creative.

### Network Configuration

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

const refreshConfig = {
  /* see table below for configuration parameters */
};
const refreshInterval = getPublisherSpecifiedRefreshInterval(
  this.element,
  this.win
);
const refreshManager = new RefreshManager(this, refreshConfig, refreshInterval);
refreshManager.initiateRefreshCycle();
```

Optionally, a network may override AmpA4A's `refresh` method, which would allow it to insert custom logic in between refresh events. Note: RefreshManager passes a callback to `refresh` which must be invoked in order to reset the cycle; if it is not invoked, the RefreshManager will become idle until either the callback or `initiateRefreshCycle` is called. If `refresh` is not overridden, this is handled automatically by AmpA4A.

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
