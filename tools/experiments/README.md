# AMP Experiments

AMP experiments are features that are released but not yet ready for wide use, so they are protected by an **experimental** status.

Developers and users can opt-in into these features before they are fully released. However, experimental components should be used with caution, as they may contain bugs or have unexpected side effects.

## Enable an experimental component

#### Served from cdn.ampproject.org

For content served from `https://*.cdn.ampproject.org`,
go to `/experiments.html` on a Google AMP Cache subdomain and enable (or disable) any experimental component by toggling them on (or off).

For example, to enable experiments on cached AMP pages whose source origin is `www.example.com`, go to `www-example-com.cdn.ampproject.org/experiments.html`.

Experiment opt-ins are saved to `localStorage` and only enables the experiment on AMP pages served from the current domain.

#### Served from other domains

For content served from non-CDN domains, experiments can be toggled in the devtools console using:

```javascript
AMP.toggleExperiment('my-experiment');
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

Note: **only some experiments** allow document level opt-in. For a full list of allowed experiments, please see `allow-doc-opt-in` attribute in [the `prod-config.json` file.](../../build-system/global-configs/prod-config.json)

The document opt-in can also be overridden by user opt-out:

```javascript
AMP.toggleExperiment('my-experiment', false);
```

### Enable automatically for invalid documents (demos and automated tests)

Before an experiment is toggled on for production or its flag is completely removed, it's useful to have it turned on by default for manual testing pages or for automated test fixtures (e.g. HTML document fixtures for integration and visual tests).

This enables the experimental runtime features that are required for a specific document and works for **every experiment**, but also **causes the document to become invalid**.

To prevent race conditions caused from loading the runtime and an inline script to toggle the experiment, you'll have to include an `AMP.push` callback in your document's `<head>`:

```html
<script>
  (self.AMP = self.AMP || []).push(function (AMP) {
    AMP.toggleExperiment('my-experiment', true);
  });
</script>
```

## Adding a new experiment

To add a new experiment:

1. Add the new experiment to this [list](https://github.com/ampproject/amphtml/blob/main/tools/experiments/experiments-config.js).
1. (This is rare, most new experiments can skip this step) Decide if the experiment should allow document level opt-in. One top consideration is that switching the experiment on/off should not break any document. For example, experimental custom elements should never be allowed, as any documents start using it will get broken if the we switch it off. Add it to `allow-doc-opt-in` in `prod-config.json` and `canary-config.json` if so.
1. Use it like this:

```javascript
import {isExperimentOn} from '../../../src/experiments';
...
const expOn = isExperimentOn(this.win, 'new-experiment');
if (expOn) {
  // experiment is on, do stuff
}
```

## Removing an experiment

Experiments may be removed by following references to their id. To start off
by finding those references, run:

```bash
amp sweep-experiments --experiment=my-experiment
```

This creates a starter commit history to remove the experiment. [Refer to the guide for this tool](../../build-system/tasks/sweep-experiments/README.md) for details on how to continue removal of the experiment.
