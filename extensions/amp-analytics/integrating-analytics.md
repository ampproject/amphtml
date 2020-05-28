# Integrate your analytics tools in AMP HTML

## Overview

If you operate a software-as-a-service tool for publishers to better understand their traffic and visitors, you may want to integrate your service into `amp-analytics`. This will enable your customers to view traffic patterns for their AMP HTML pages.

## Before you begin

Before you can add your analytics service to AMP HTML runtime, you may need to:

- Identify the kinds of [variables](analytics-vars.md) and [requests](amp-analytics.md#requests) you'll need in an AMP HTML document for your analytics service.
- Determine if the batching plugin function is required to construct the final url if using requests with batching behavior.
- Identify the triggers that result in analytics requests being sent from a page that would be relevant for your service.
- Consider if and how you will [track users across](https://github.com/ampproject/amphtml/blob/master/spec/amp-managing-user-state.md) first-party and third-party AMP contexts.
- Determine how your analytics dashboard handles AMP traffic.
- Identify any missing functionality in `amp-analytics`, and [file requests](https://github.com/ampproject/amphtml/issues/new) for needed features.
- AMP Analytics sends its variables to a preconfigured endpoint. If you do not already have an existing endpoint, review [this sample](https://github.com/ampproject/amp-publisher-sample#amp-analytics-sample) for an overview on how to build one.
  - For all transport types except `iframe`, variables are sent as query string parameters in a HTTPS request.
  - For the `iframe` transport type, an iframe is created and variables are sent to it via `window.postMessage`. In this case, the message need not be a URL. This option is available only to MRC-accredited vendors.
- Consider how integration with `amp-analytics` may impact any policies (particularly your privacy policy) or agreements you may have.

## Adding your configuration to the AMP HTML runtime

1. Create an [Intent-To-Implement issue](../../CONTRIBUTING.md#contributing-features) stating that you'll be adding your analytics service's configuration to AMP HTML's runtime. Be sure to include **cc @ampproject/wg-analytics** in your description.
1. Develop a patch that implements the following:
   1. A new configuration json file `${vendorName}.json` in the vendors [folder](https://github.com/ampproject/amphtml/tree/master/extensions/amp-analytics/0.1/vendors) including any options above and beyond the default, such as:
      1. `"vars": {}` for additional default variables.
      1. `"requests": {}` for requests that your service will use.
      1. `"optout":` if needed. We currently don't have a great opt-out system, so please reach out to help us design one that works well for you.
      1. `"warningMessage":` if needed. Displays warning information from the vendor (such as deprecation or migration) in the console.
   1. If you are using iframe transport, also add a new line to ANALYTICS_IFRAME_TRANSPORT_CONFIG in iframe-transport-vendors.js containing `"*vendor-name*": "*url*"`
   1. An example in the [examples/analytics-vendors.amp.html](../../examples/analytics-vendors.amp.html).
      reference.
   1. A test in the [extensions/amp-analytics/0.1/test/vendor-requests.json
      ](../../extensions/amp-analytics/0.1/test/vendor-requests.json) file.
   1. Add your analytics service to the supported vendors list in the [extensions/amp-analytics/0.1/analytics-vendors-list.md](./analytics-vendors-list.md) file. Include the type, description, and link to your usage documentation.
1. If a new batch plugin if required. Please refer to [Add Batch Plugin](#add-batch-plugin) for instructions.
1. Test the new example you put in [examples/analytics-vendors.amp.html](../../examples/analytics-vendors.amp.html) to ensure the hits from the example are working as expected. For example, the data needed is being collected and displayed in your analytics dashboard.
1. Submit a Pull Request with this patch, referencing the Intent-To-Implement issue.
1. Update your service's usage documentation and inform your customers.
1. It's highly recommended to maintain [an integration test outside AMP repo](../../3p/README.md#adding-proper-integration-tests).

## Tag Managers

Tag management services have two options for integrating with AMP Analytics:

- **Endpoint approach:** Acting as the an additional endpoint for `amp-analytics`, and conducting marketing management in the backend.
- **Config approach:** Conducting tag management via a dynamically generated JSON config file unique to each publisher.

The endpoint approach is the same as the standard approach detailed in the previous section. The config approach consists of creating a unique configuration for amp-analytics that is specific to each publisher and includes all of their compatible analytics packages. A publisher would include the configuration using a syntax similar to this:

```html
<amp-analytics
  config="https://my-awesome-tag-manager.example.com/user-id.json"
></amp-analytics>
```

To take this approach, review the documentation for publishers' integration with AMP Analytics.

## Further Resources

- Deep Dive: [Why not just use an iframe?](why-not-iframe.md)
- Deep Dive: [Managing non-authenticated user state with AMP](https://github.com/ampproject/amphtml/blob/master/spec/amp-managing-user-state.md)
- [amp-analytics sample](https://github.com/ampproject/amp-publisher-sample#amp-analytics-sample)
- [amp-analytics](https://amp.dev/documentation/components/amp-analytics) reference documentation
- [amp-analytics variables](analytics-vars.md) reference documentation
