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
