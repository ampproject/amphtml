# Implementing analytics for AMP components

## APIs

Third-party content providers are encouraged to create their own AMP components. To collect analytics for those components, use the AMP analytics APIs described in this document.

-   To collect custom events that the AMP component triggers programmatically in its own code, use the [CustomEventReporter API](#CustomEventReporter-API).

-   To collect the `visible` or `hidden` analytics events defined by the [amp-analytics spec](amp-analytics.md#Triggers) that are triggered through user interaction, use the [useAnalyticsInSandbox API](#useAnalyticsInSandbox-API).

The two APIs can be used individually or together.

### CustomEventReporter API

Typically, analytics triggers come from user events but you can also perform manual triggering to send analytics pings with customized data.

To trigger custom events, third-party AMP components must first create a **`customEventReporter`** object by using the **`customEventReporterBuilder`** class. For more details on this class, see the [customEventReporterBuilder code](../../src/extension-analytics.js)

Example

In the following example, the component creates a **`customEventReporter`** object that sends pings to example.com on **`layout`** and **`id`** events.

```js
  buildCallback() {
    const builder = new customEventReporterBuilder(this.element);
    builder.track('layout', 'example.come/core/dom/layout');
    builder.track('id', ['example.com/${id}', 'example2.com/${id}']);
    this.reporter_ = builder.build();
  }
```

The **`customEventReporter`** class provides a **`trigger`** method, which you can use to manually trigger created custom events on your third-party component and include optional variables. Call **`trigger`** with the pre-defined **`eventType`** name, and an optional object with more data.

Example

In the following example, the component triggers two custom events: **`layout`** and **`id`**. The **`id`** event is triggered with the value of the id, after the id is ready.

```js
  layoutCallback() {
    this.reporter_.trigger('layout');
    getIdPromise.then(id => {
      this.reporter_.trigger('id', {'id': id});
    }
  }
```

Note: With the use of **`customEventReporter`**, AMP assumes all custom events are sandboxed events that are scoped inside of the third-party AMP component. Thus **`customEventReporter`** can only used to report and collect custom events associated with the third-party AMP component.

### useAnalyticsInSandbox API

Third-party AMP components can contain an amp-analytics [configuration](amp-analytics.md#sending-analytics-to-a-vendor-or-in-house) to collect analytics events. Currently, only the `visible` and `hidden` events are supported. To request other existing analytics [events](amp-analytics.md#triggers) (e.g., `ini-load`, `click`) to support analytics in third-party AMP components, please submit a [feature request](https://github.com/ampproject/amphtml/issues/new?assignees=&labels=Type%3A+Feature+Request&template=feature-request.yml) on GitHub.

To send analytics pings, third-party AMP components must call the `useAnalyticsInSandbox()` API function and provide a promise that resolves with their analytics configuration when it is ready. The analytics configuration should be a JSON object specified in accordance with the amp-analytics [spec](amp-analytics.md#triggers).

Example

```js
useAnalyticsInSandbox(this.element, configPromise);
```

### Behind the scenes

Both APIs will insert an `<amp-analytics>` element into the DOM when the third-party AMP component starts layout. AMP delays the creation of an analytics element because it's rare that a third-party AMP component collects analytics data before the layout process. Also, by default, the created analytics element has a lower priority than the other content.

## Restrictions

An inserted amp-analytics element is sandboxed within its parent third-party AMP component. This means its selector cannot access elements outside of its parent scope, and the [URL variable substitution](../../docs/spec/amp-var-substitutions.md) only works if variable is included in the [allowlist](./0.1/sandbox-vars-allowlist.js).

## Documentation requirements

To use analytics in third-party AMP components, the developer creating the component must provide documentation relating to the privacy and use of data collected through the component. It is suggested that this information be provided as part of the component documentation itself. It can either be fully written out policy and disclosure or link to pages on the component developer’s website.
