# AMP Experiments

AMP experiments are features that are released but not yet ready for wide use, so they are protected by an **experimental** status.

Developers and users can opt-in into these features before they are fully released. However, experimental components should be used with caution, as they may contain bugs or have unexpected side effects.

## Enable an experiment for yourself

Experimental components can be served from `https://cdn.ampproject.org` or any other domain.

### Served from cdn.ampproject.org

For content served from `https://cdn.ampproject.org`, go to the [AMP experiments page](https://cdn.ampproject.org/experiments.html) and enable (or disable) any experimental component by toggling them on (or off). Opting in will set a cookie on your browser that will enable the experiment on all AMP pages served through the Google AMP Cache.

### Served from other domains

For content served from any other domain, you can toggle experiments in the Chrome DevTools Console when development mode is enabled by using:

```javascript
AMP.toggleExperiment('experiment')
```

## Enable an experiment for a particular document
Document can choose to opt in a certain experiments. To do that, simply put a meta tag of name `amp-experiments-opt-in` in the head of the HTML document before your AMP script (`https://cdn.ampproject.org/v0.js`). Its `content` value is a comma separated string of experiment IDs to opt in.
```HTML
<head>
  ...
  <meta name="amp-experiments-opt-in" content="experiment-a,experiment-b">
  ... <!-- The meta tag needs to be placed before AMP runtime script. ->
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  ...
</head>
```
By doing so, the specified experiments will be enabled for all visitors of the document.
Note not all experiments allow document level opt-in. For a full list of whitelisted experiments, please see `allow-doc-opt-in` attribute in the project's `prod-config.json` file.
Note that document opt-in can be overridden by user opt-out.
```javascript
AMP.toggleExperiment('experiment', false);
```

## Adding a new experiment

To add a new experiment:

1. Add the new experiment to this [list](https://github.com/ampproject/amphtml/blob/master/tools/experiments/experiments.js).
1. (This is rare, most new experiments can skip this step) Decide if the experiment should allow document level opt-in. One top consideration is that switching the experiment on/off should not break any document. For example, experimental custom elements should never be whitelisted, as any documents start using it will get broken if the we switch it off. Add it to `allow-doc-opt-in` in `prod-config.json` and `canary-config.json` if so.
1. Use it like this:

```javascript
import {isExperimentOn} from '../../../src/experiments';
...
const expOn = isExperimentOn(this.win, 'new-experiment');
if (expOn) {
  // experiment is on, do stuff
}
```
