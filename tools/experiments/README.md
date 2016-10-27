# AMP Experiments

The features that are released but not yet ready for the wide use are protected
by the experiment. The developers and users can opt-in into these features
before they are fully released.

The Experiments UI to enable or disable experiments for the content served from https://cdn.ampproject.org is available at:

[https://cdn.ampproject.org/experiments.html](https://cdn.ampproject.org/experiments.html)

For content served from any other domain, experiments can be toggled in the devtools
console when development mode is enabled using:
```
AMP.toggleExperiment('experiment')
```

## Add a new experiment
- Add new experiment to this [list](https://github.com/ampproject/amphtml/blob/master/tools/experiments/experiments.js)
- Use it like this:

```javascript
import {isExperimentOn} from '../../../src/experiments';
...
const expOn = isExperimentOn(this.win, 'new-experiment');
if (expOn) {
  // experiment is on, do stuff
}
```

or, if you want to turn on experiment via URL fragment `#e-new-experiment=1`. See function documentation for security considerations.
```javascript
import {isExperimentOnAllowUrlOverride} from '../../../src/experiments';
...
const expOn = isExperimentOnAllowUrlOverride(this.win, 'new-experiment');
if (expOn) {
  // experiment is on, do stuff
}
```
