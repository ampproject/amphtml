# Origin trials
Origin trials enable developers to use an experimental feature in production and provide essential feedback.

The AMP Origin Trial process is inspired by the [Chromium Origin Trial process](https://github.com/GoogleChrome/OriginTrials). 

Traditionally, a feature in experimental mode can be used in development, but cannot be pushed to production. With Origin trials, interested developers can opt-in to a test an experimental feature in production, with the following expectations:
- The test is for a limited time.
- The feature will likely undergo some changes after an Origin Trials.
- Origin trials present an opportunity to implement and benefit from a new feature before it’s fully live. The feature will live on the developer's site, rather than guarded by an experiment, and feedback can directly influence the direction of the feature.

## When to consider an Origin Trial

## Origin Trial - the details
- No Origin Trial can last more than 3 months.
- People generating Origin Trial tokens should be making sure that no more than 0.1% of AMP page loads (the deprecation threshold) starts depending on an Origin Trial
- Extending an Origin Trial requires approval from the TSC. They can delegate this to the Working Group that is responsible for the Origin Trial.

## Enable an origin trial
Include the following <meta> tag within the <head> tag on each page that uses the origin trial experiment:

<meta name="amp-experiment-token" content="{copy your token here}">
"amp-experiment-token" is the literal string, "amp-experiment-token". Not the token itself (which goes into the content attribute), or the name of the experiment.
