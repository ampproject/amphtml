# Integrate your analytics tools in AMP HTML

## Overview

If you operate a software-as-a-service tool for publishers to better understand their traffic and visitors, you may want to integrate your service into `amp-analytics`. This will enable your customers to view traffic patterns for their AMP HTML pages.

## Before you begin

Before you can add your analytics service to AMP HTML runtime, you may need to:
* Identify the kinds of [variables](analytics-vars.md) and [requests](amp-analytics.md#requests) you'll need in an AMP HTML document for your analytics service.
* Determine if the batching plugin function is required to construct the final url if using requests with batching behavior.
* Identify the triggers that result in analytics requests being sent from a page that would be relevant for your service.
* Consider if and how you will [track users across](https://github.com/ampproject/amphtml/blob/master/spec/amp-managing-user-state.md) first-party and third-party AMP contexts.
* Determine how your analytics dashboard handles AMP traffic.
* Identify any missing functionality in `amp-analytics`, and [file requests](https://github.com/ampproject/amphtml/issues/new) for needed features.
* AMP Analytics sends its variables to a preconfigured endpoint.  If you do not already have an existing endpoint, review [this sample](https://github.com/ampproject/amp-publisher-sample#amp-analytics-sample) for an overview on how to build one.
  * For all transport types except `iframe`, variables are sent as query string parameters in a HTTPS request.
  * For the `iframe` transport type, an iframe is created and variables are sent to it via `window.postMessage`. In this case, the message need not be a URL. This option is available only to MRC-accredited vendors.
* Consider how integration with `amp-analytics` may impact any policies (particularly your privacy policy) or agreements you may have.

## Adding your configuration to the AMP HTML runtime

1. Create an [Intent-To-Implement issue](../../CONTRIBUTING.md#contributing-features) stating that you'll be adding your analytics service's configuration to AMP HTML's runtime.
1. Develop a patch that implements the following:
    1. A new block in [vendors.js](0.1/vendors.js) including any options above and beyond the default, such as:
        1. "vars": {} for additional default variables.
        1. "requests": {} for requests that your service will use.
        1. "transport": { "iframe": *url* } if you are using iframe transport.
        1. "optout": if needed.  We currently don't have a great opt-out system, so please reach out to help us design one that works well for you.
    1. An example in the [examples/analytics-vendors.amp.html](../../examples/analytics-vendors.amp.html)
reference.
    1. A new batch plugin if required. Please refer to [Add Batch Plugin](#add-batch-plugin) for instructions.
1. Test the new example you put in [examples/analytics-vendors.amp.html](../../examples/analytics-vendors.amp.html) to ensure the hits from the example are working as expected. For example, the data needed is being collected and displayed in your analytics dashboard.
1. Submit a Pull Request with this patch, referencing the Intent-To-Implement issue.
1. Add your analytics service to the [list of supported Analytics Vendors](https://github.com/ampproject/docs/blob/master/content/docs/ads_analytics/analytics-vendors.md) by submitting a Pull Request to the [ampproject/docs](https://github.com/ampproject/docs) repo. Include the type, description, and link to your usage documentation.
1. Update your service's usage documentation and inform your customers.



## Tag Managers

Tag management services have two options for integrating with AMP Analytics:

* **Endpoint approach:** Acting as the an additional endpoint for `amp-analytics`, and conducting marketing management in the backend.
* **Config approach:** Conducting tag management via a dynamically generated JSON config file unique to each publisher.

The endpoint approach is the same as the standard approach detailed in the previous section.  The config approach consists of creating a unique configuration for amp-analytics that is specific to each publisher and includes all of their compatible analytics packages.  A publisher would include the configuration using a syntax similar to this:

```html
  <amp-analytics config="https://my-awesome-tag-manager.example.com/user-id.json">
```

To take this approach, review the documentation for publishers' integration with AMP Analytics.

## Add Batch Plugin
Batch plugin provides an easy way to construct batched requests on client side. Follow the instructions below to add a batch plugin.
1. Create an [Intent-To-Implement issue](../../CONTRIBUTING.md#contributing-features) stating that you'll be adding the batch plugin to your analytics service AMP HTML's runtime.
1. Develop a patch that implements the following:
    1. Add new plugin function in [batching-plugins.js](0.1/batching-plugins.js)
    1. Add test coverage to your plugin function
    1. Test your example in the [examples/analytics-vendors.amp.html](../../examples/analytics-vendors.amp.html)
1. Submit a Pull Request with this patch, referencing the Intent-To-Implement issue.

Please note that every new plugin will be reviewed by AMP team on a case by case basis. The idea is to avoid a plugin as much as possible if there is a more generic approach.

## Further Resources
* Deep Dive: [Why not just use an iframe?](why-not-iframe.md)
* Deep Dive: [Managing non-authenticated user state with AMP](https://github.com/ampproject/amphtml/blob/master/spec/amp-managing-user-state.md)
* Review pull requests from other AMP Analytics providers:
 * [AT Internet](https://github.com/ampproject/amphtml/pull/1672)
 * [Piano](https://github.com/ampproject/amphtml/pull/1652)
 * [comScore](https://github.com/ampproject/amphtml/pull/1608)
 * [Parsely](https://github.com/ampproject/amphtml/pull/1595)
* [amp-analytics sample](https://github.com/ampproject/amp-publisher-sample#amp-analytics-sample)
* [amp-analytics](https://www.ampproject.org/docs/reference/components/amp-analytics) reference documentation
* [amp-analytics variables](analytics-vars.md) reference documentation
