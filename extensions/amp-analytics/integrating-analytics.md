# Integrate your analytics tools in AMP HTML

## Overview

If you operate a software-as-a-service tool for publishers to better understand their traffic and visitors, you may want to integrate your service into `amp-analytics`. This will enable your customers to view traffic patterns for their AMP HTML pages.

## Before you begin

Before you can add your analytics service to AMP HTML runtime, you may need to:
* Identify the kinds of [variables](analytics-vars.md) and [requests](amp-analytics.md#requests) you'll need in an AMP HTML document for your analytics service.
* Identify the triggers that result in analytics requests being sent from a page that would be relevant for your service.
* Consider if and how you will [track users across](cross-origin-tracking.md) first-party and third-party AMP contexts.
* Determine how your analytics dashboard handles AMP traffic.
* Identify any missing functionality in `amp-analytics`, and [file requests](https://github.com/ampproject/amphtml/issues/new) for needed features.
* AMP Analytics sends its variables as query string parameters in a HTTPS request to a preconfigured endpoint.  If you do not already have an existing endpoint, review [this sample](https://github.com/ampproject/amp-publisher-sample#amp-analytics-sample) for an overview on how to build one.  
* Consider how integration with `amp-analytics` may impact any policies (particularly your privacy policy) or agreements you may have.

## Adding your configuration to the AMP HTML runtime

1. Create an [Intent-To-Implement issue](../../CONTRIBUTING.md#contributing-features) stating that you'll be adding your analytics service's configuration to AMP HTML's runtime.
2. Develop a patch that implements the following:
 * A new block in [vendors.js](0.1/vendors.js) including any options above and beyond the default, such as:
  * "vars": {} for additional default variables.
  * "requests": {} for requests that your service will use.
  * "optout": if needed.  We currently don't have a great opt-out system, so please reach out to help us design one that works well for you.
 * An example in the [examples/analytics-vendors.amp.html](../examples/analytics-vendors.amp.html)
3. A line for your analytics service in the 'type' attribute section of the [amp-analytics](amp-analytics.md) usage reference.
Test the patch to ensure the hits from the example are working as expected.  For example, the data needed is being collected and displayed in your analytics dashboard.
4. Submit a Pull Request with this patch, referencing the Intent-To-Implement issue.
5. Update your service's usage documentation and inform your customers.


## Tag Managers

Tag management services have two options for integrating with AMP Analytics:

* **Endpoint approach:** Acting as the an additional endpoint for `amp-analytics`, and conducting marketing management in the backend.
* **Config approach:** Conducting tag management via a dynamically generated JSON config file unique to each publisher.

The endpoint approach is the same as the standard approach detailed in the previous section.  The config approach consists of creating a unique configuration for amp-analytics that is specific to each publisher and includes all of their compatible analytics packages.  A publisher would include the configuration using a syntax similar to this: 

```html
  <amp-analytics config="https://my-awesome-tag-manager.example.com/user-id.json">
```

To take this approach, review the documentation for publishers' integration with AMP Analytics.

## Further Resources
* Deep Dive: [Why not just use an iframe?](why-not-iframe.md)
* Deep Dive: [Tracking users across origins](cross-origin-tracking.md)
* Review pull requests from other AMP Analytics providers:
 * [AT Internet](https://github.com/ampproject/amphtml/pull/1672)
 * [Piano](https://github.com/ampproject/amphtml/pull/1652)
 * [comScore](https://github.com/ampproject/amphtml/pull/1608)
 * [Parsely](https://github.com/ampproject/amphtml/pull/1595)
* [amp-analytics sample](https://github.com/ampproject/amp-publisher-sample#amp-analytics-sample)
* [amp-analytics](amp-analytics.md) reference documentation
* [amp-analytics variables](analytics-vars.md) reference documentation
