# Origin Trials

Origin Trials enable developers to use an experimental feature in production and provide essential feedback.

The AMP Origin Trial process is inspired by the [Chromium Origin Trial process](https://github.com/GoogleChrome/OriginTrials).

Traditionally, a feature in experimental mode can only be used in development and cannot be pushed to production. Origin Trials allow interested developers to opt-in to a test an experimental feature in production. Origin Trial users should be mindful of the following:

-   The test is for a limited time.
-   The feature will likely undergo some changes after an Origin Trials.
-   Origin Trials present an opportunity to implement and benefit from a new feature before it’s fully live. The feature will live on the developer's site, rather than guarded by an experiment, and feedback can directly influence the direction of the feature.

## When to consider an Origin Trial

-   Not every experiment needs an Origin Trial.
-   The experiment should be feature complete with a stable API at the point of the Origin Trial.
-   Data from opt-in experiments is going to be insufficient and you need data from real-world users.
-   The potential versioning pain is much greater than the pain of dealing with the logistics of an Origin Trial.
-   Good questions to answer with an Origin Trial:
    -   Is this API the "right" one?

## Origin Trial - the details

-   No Origin Trial can last more than 3 months.
-   An Origin Trial duration can be prematurely shortened by us (with 7 days of notice) if usage exceeds 0.1% of AMP page loads.
-   Extending an Origin Trial requires approval from the Approvers Working Group (@ampproject/wg-approvers).

## Enable an Origin Trial

Include the following <meta> tag within the <head> tag on each page that uses the Origin Trial experiment:

<meta name="amp-experiment-token" content="{copy your token here}">
"amp-experiment-token" is the literal string, "amp-experiment-token". Not the token itself (which goes into the content attribute), or the name of the experiment.
