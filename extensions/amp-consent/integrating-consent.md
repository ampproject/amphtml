# Integrate your Consent Management Platform (CMP) with AMP Consent

## Overview

To enable customers to operate a CMP to manage their user consents in AMPHTML pages, Consent Management Providers should integrate their service in `amp-consent`.

## Before you begin

To add your consent management service to AMP runtime, it is expected that you:

-   Set the remote endpoint to handle requests from AMP. This determines if user consent is required.
-   Make sure the prompted consent collecting page communicates well with the AMP runtime using the provided APIs.
-   [Add your consent configuration](#adding-your-configuration-to-amp) to the AMP code base.
-   Meet the restrictions that the AMP runtime applies to ensure a good user experience. These includes
    -   Enforce the size of the consent prompt. The only two allowed sizes are the initial size (`width: 100vw`, `height: 30vh`), and the full screen size (`width: 100vw`, `height: 100%`) after user interactions.
    -   A default placeholder will be displayed before the consent prompt iframe is ready.
-   Understand that including `<amp-consent type='yourName'></amp-consent>` on the page won't block any components by default. **Please make sure to inform your service users to block AMP components either by the `<meta name="amp-consent-blocking">` metaTag, or the `data-block-on-consent` attribute.**
-   Understand that AMP Consent doesn't attempt to interpret the consent info string from the CMP. Vendors can access the consent info string from CMPs via [provided APIs](https://github.com/ampproject/amphtml/blob/main/ads/README.md#amp-consent-integration). It's up to the CMP and service provider vendors to agree on the format of the consent info string.
-   Create an [Intent-To-Implement issue](../../docs/contributing.md#contributing-features) stating that you'll be adding support to your CMP service to AMP. A great start point is to follow the `_ping_` CMP service implementation that the AMP team creates for testing purpose.

## Add remote endpoint support

A remote endpoint is expected to tell the AMP runtime whether the user consent is required. It can also pass extra information via AMP to third party vendors. More information on the remote endpoint can be found [here](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/amp-consent.md#checkconsenthref).

## Prompt UI Iframe

The AMP runtime will embed the CMP's prompt in an iframe. `amp-consent` will create the iframe when it is necessary. A default placeholder will be displayed, and the prompt iframe will remain hidden until it has finished loading.

In case you need to enable additional sandbox restrictions to be removeed for the generated iframe, specify them in the `sandbox` configuration variable. It takes a string with space-seperated sandbox restrictions. The restrictions `allow-scripts` and `allow-popups` are removed by default. Right now, the only allowed additional sandbox restrictions are `allow-popups-to-escape-sandbox` and `allow-top-navigation-by-user-activation`.

The prompt iframe and the parent AMP page will communicate through `postMessages` and the iframe `name` attribute. In the case of using postMessage, messages from nested iframes will be ignored. The lists of support APIs are:

#### Requesting UI state change

Iframes can send a `consent-ui` message to the parent AMP page to request UI state change.

##### ready

```javascript
window.parent.postMessage(
  {
    type: 'consent-ui',
    action: 'ready',
    initialHeight: (optional string, default `30vh`),
    enableBorder: (optional boolean, default true),
  },
  '*'
);
```

Action `'ready'` informs the AMP runtime to hide the placeholder and show the consent prompt instead.

The `initialHeight` property is used to set the size of consent prompt. Valid values are `30vh` to `80vh`. A valid value below `60vh` (inclusive) will result in amp-consent rendering the consent dialog as a bottom sheet, and a valid value above `60vh` will style the consent prompt as a modal.

The `enableBorder` property determines if the top corners of the consent prompt will be rounded for consent prompts that have an `initialHeight` less than or equal to `60vh`.

##### enter-fullscreen

```javascript
window.parent.postMessage(
  {
    type: 'consent-ui',
    action: 'enter-fullscreen',
  },
  '*'
);
```

Action `'enter-fullscreen'` requests the AMP runtime to expand the iframe to fullscreen. `amp-consent` will only allow the iframe enter fullscreen if it detects user interaction with the iframe (e.g. clicking on the iframe). Once the request is received, `amp-consent` will send a message (via `postMessage()`) to the iframe to inform the success of the request:

```javascript
  {
    type: 'amp-consent-response',
    requestType: 'consent-ui',
    requestAction: 'enter-fullscreen',
    state: 'success',
    info: 'Entering fullscreen.'
  }
```

#### Informing Consent response

Iframes can send a `consent-response` message to the parent AMP page to inform the user [actions](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/amp-consent.md#prompt-actions) along with additional consent information.

-   The user action is always required by AMP runtime. It allows the user to block/unblock any AMP component by user consent, not only components that read the additional consent information string.

*   If the user action value equals to `accept` or `reject`. AMP will strictly respect the incoming `info` value. If the `info` value is undefined, any previously value will be discarded.

##### accept

```javascript
window.parent.postMessage(
  {
    type: 'consent-response',
    action: 'accept',
    info: /string/ /* optional */,
    consentMetadata: /object/ /* optional */,
    tcfPolicyVersion: /number/ /* optional (integer) - if not provided 2 is default */,
  },
  '*'
);
```

The user action `accept` informs AMP runtime to unblock all components that are waiting the user consent.

##### reject

```javascript
window.parent.postMessage(
  {
    type: 'consent-response',
    action: 'reject',
    info: /string/ /* optional */,
    consentMetadata: /object/ /* optional */,
    tcfPolicyVersion: /number/ /* optional (integer) - if not provided 2 is default */,
  },
  '*'
);
```

The user action `reject` informs AMP runtime that the user has declined to give consent. AMP runtime will unblock components based on the consent blocking policy configuration.

##### dismiss

```javascript
window.parent.postMessage(
  {
    type: 'consent-response',
    action: 'dismiss',
  },
  '*'
);
```

The user action `dismiss` informs AMP runtime that no info on user consent has been gathered. The `info` value is not supported. This is because the `info` string is not useful when the user decides to not give any information.

#### Client information passed to iframe

When the iframe is created, the following information will be passed to the iframe via the name attribute.

-   `clientConfig`: The configuration from the publisher
-   `consentStateValue`: The stored consent state if there's any. The value will be `'accepted'/'rejected'/'unknown'`. A friendly reminder is to be aware of the difference between the consent state string value (`'accepted'/'rejected'/'unknown'`) and the user action string value (`'accept'/'reject'/'dismiss'`).
-   `consentString`: The stored consent info string if there's any.

One can get access to the client information via the name attribute inside the iframe.

```javascript
/* Expect info to be an object of format
 * {
 *  'clientConfig': *,
 *  'consentStateValue': 'accepted'/'rejected'/'unknown'/undefined,
 *  'consentString': string/undefined,
 * };
 */
info = JSON.parse(window.name);
```

#### consentMetadata

`<amp-consent>` [caches](./amp-consent.md#Client-caching) and passes consent information to vendors via `consentMetadata` objects as well as a non-empty `consentString`. You can find and example of the `consentMetadata` object and its supported fields below.

```
{
  "consentStringType": {enum} [1: TCF V1, 2: TCF V2, 3: US Privacy String] (optional),
  "gdprApplies": {boolean} (optional),
  "additionalConsent": {string} (optional),
  "purposeOne": {boolean} (optional)
}
```

## Adding your configuration to AMP

Once you have the remote endpoint and prompt UI iframe ready, you are ready to add your configuration to the AMP runtime.

1. Develop a patch that implements the following:
    1. Add a new configuration object to amp-consent component. The current CMP configurations are all placed [here](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/0.1/cmps.js).
    1. Within your configuration, make sure to specify all the required fields that includes:
        1. `consentInstanceId`: The localStorage key to store/retrieve the user consent response.
        1. `checkConsentHref`: Your remote endpoint destination.
        1. `promptUISrc`: Your prompt UI iframe src.
    1. Add an example to the [`cmp-vendors.amp.html`](../../examples/amp-consent/cmp-vendors.amp.html) using your service. Note, the examples and filters should be in alphabetical order, and `_ping_` should be the first example.
    1. Add documentation for your configuration in [`extensions/amp-consent/cmp`](./cmps). See the [`_ping_`](./cmps/_ping_.md) documentation as an example.
    1. Add your platform unde the "Supported Consent Management Platforms" section in [`extensions/amp-consent/amp-consent.md`](./amp-consent.md).
    1. Add your GH user name as the POC for future maintenance issue.
1. Run end to end test on the new example you create.
1. Submit a Pull Request with this patch, referencing the Intent-To-Implement issue. @ampproject/wg-monetization for review.
1. Update your service's documentation and inform your customers.
1. It's highly recommended to maintain [an integration test outside AMP repo](../../3p/README.md#adding-proper-integration-tests).
