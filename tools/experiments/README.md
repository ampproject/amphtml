# AMP Experiments

AMP experiments are features that are released but not yet ready for wide use, so they are protected by an **experimental** status.

Developers and users can opt-in into these features before they are fully released. However, experimental components should be used with caution, as they may contain bugs or have unexpected side effects.

## Enabling an experimental component

Experimental components can be served from [https://cdn.ampproject.org](https://cdn.ampproject.org) or any other domain.

### Served from cdn.ampproject.org

For content served from [https://cdn.ampproject.org](https://cdn.ampproject.org), go to the [AMP experiments page](https://cdn.ampproject.org/experiments.html) and enable (or disable) any experimental component by toggling them on (or off). Opting in will set a cookie on your browser that will enable the experiment on all AMP pages served through the Google AMP Cache.

### Served from other domains

For content served from any other domain, you can toggle experiments in the Chrome DevTools Console when development mode is enabled by using:

```javascript
AMP.toggleExperiment('experiment')
```

## Adding a new experiment

To add a new experiment:

1.  Add the new experiment to this [list](https://github.com/ampproject/amphtml/blob/master/tools/experiments/experiments.js).
2. Use it like this:

```javascript
import {isExperimentOn} from '../../../src/experiments';
...
const expOn = isExperimentOn(this.win, 'new-experiment');
if (expOn) {
  // experiment is on, do stuff
}
```

Or, if you want to turn the experiment on via a URL fragment in the form of `#e-new-experiment=1`, use the following: 
```javascript
import {isExperimentOnAllowUrlOverride} from '../../../src/experiments';
...
const expOn = isExperimentOnAllowUrlOverride(this.win, 'new-experiment');
if (expOn) {
  // experiment is on, do stuff
}
```
For security considerations, see the `isExperimentOnAllowUrlOverride` function's documentation.
