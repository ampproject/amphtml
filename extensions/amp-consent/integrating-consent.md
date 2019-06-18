# Integrate your Consent Management Platform (CMP) with AMP Consent

## Overview
The feature is in experimental mode. Please opt-in using the `amp-consent-v2` flag. To opt-in, you can either run `AMP.toggleExperiment('amp-consent-v2')` in console, or turn on the experiment from the [experiments managing page](https://cdn.ampproject.org/experiments.html).

To enable customers to operate a CMP to manage their user consents in AMPHTML pages, Consent Management Providers should integrate their service in `amp-consent`.

## Before you begin

To add your consent management service to AMP runtime, it is expected that you:
* Set the remote endpoint to handle requests from AMP. This determines if user consent is required.
* Make sure the prompted consent collecting page communicates well with the AMP runtime using the provided APIs.
* [Add your consent configuration](#adding-your-configuration-to-amp) to the AMP code base.
* Meet the restrictions that the AMP runtime applies to ensure a good user experience. These includes
    * Enforce the size of the consent prompt. The only two allowed sizes are the initial size (`width: 100vw`, `height: 30vh`), and the full screen size (`width: 100vw`, `height: 100%`) after user interactions.
    * A default placeholder will be displayed before the consent prompt iframe is ready.
    * Enforce the size of the stored consent information. 150 character length is the current limit. Please [file an issue](https://github.com/ampproject/amphtml/issues/new) if you find that not sufficient.
* Understand that including `<amp-consent type='yourName'></amp-consent>` on the page won't block any components by default. **Please make sure to inform your service users to block AMP components either by the `<meta name="amp-consent-blocking">` metaTag, or the `data-block-on-consent` attribute.**
* Understand that AMP Consent doesn't attempt to interpret the consent info string from the CMP. Vendors can access the consent info string from CMPs via [provided APIs](https://github.com/ampproject/amphtml/blob/master/ads/README.md#amp-consent-integration). It's up to the CMP and service provider vendors to agree on the format of the consent info string.
* Create an [Intent-To-Implement issue](../../CONTRIBUTING.md#contributing-features) stating that you'll be adding support to your CMP service to AMP. A great start point is to follow the `_ping_` CMP service implementation that the AMP team creates for testing purpose.

## Add remote endpoint support
A remote endpoint is expected to tell the AMP runtime whether the user consent is required. It can also pass extra information via AMP to third party vendors. More information on the remote endpoint can be found [here](https://github.com/ampproject/amphtml/blob/master/extensions/amp-consent/amp-consent.md#checkconsenthref).

## Prompt UI Iframe
The AMP runtime will embed the CMP's prompt in an iframe. `amp-consent` will create the iframe when it is necessary. A default placeholder will be displayed, and the prompt iframe will remain hidden until it has finished loading.

The prompt iframe and the parent AMP page will communicate through `postMessages` and the iframe `name` attribute. In the case of using postMessage, messages from nested iframes will be ignored. The lists of support APIs are:

#### Requesting UI state change
Iframes can send a `consent-ui` message to the parent AMP page to request UI state change.

##### ready

``` javascript
window.parent.postMessage({
  type: 'consent-ui',
  action: 'ready'
}, '*');
```

Action `'ready'` informs the AMP runtime to hide the placeholder and show the consent prompt instead.

##### enter-fullscreen
``` javascript
window.parent.postMessage({
  type: 'consent-ui',
  action: 'enter-fullscreen'
}, '*');
```

Action `'enter-fullscreen'` requests the AMP runtime to expand the iframe to fullscreen.

#### Informing Consent response
Iframes can send a `consent-response` message to the parent AMP page to inform the user [actions](https://github.com/ampproject/amphtml/blob/master/extensions/amp-consent/amp-consent.md#prompt-actions) along with additional consent information.

* The user action is always required by AMP runtime. It allows the user to block/unblock any AMP component by user consent, not only components that read the additional consent information string.


* If the user action value equals to `accept` or `reject`. AMP will strictly respect the incoming `info` value. If the `info` value is undefined, any previously value will be discarded.


##### accept

``` javascript
window.parent.postMessage({
  type: 'consent-response',
  action: 'accept',
  info: /string/, /* optional */
}, '*');
```

The user action `accept` informs AMP runtime to unblock all components that are waiting the user consent.

##### reject

``` javascript
window.parent.postMessage({
  type: 'consent-response',
  action: 'reject',
  info: /string/,  /* optional */
}, '*');
```

The user action `reject` informs AMP runtime that the user has declined to give consent. AMP runtime will unblock components based on the consent blocking policy configuration.


##### dismiss
``` javascript
window.parent.postMessage({
  type: 'consent-response',
  action: 'dismiss',
}, '*');
```

The user action `dismiss` informs AMP runtime that no info on user consent has been gathered. The `info` value is not supported. This is because the `info` string is not useful when the user decides to not give any information.


#### Client information passed to iframe
When the iframe is created, the following information will be passed to the iframe via the name attribute.
* `clientConfig`: The configuration from the publisher
* `consentStateValue`: The stored consent state if there's any. The value will be `'accepted'/'rejected'/'unknown'`. A friendly reminder is to be aware of the difference between the consent state string value (`'accepted'/'rejected'/'unknown'`) and the user action string value (`'accept'/'reject'/'dismiss'`).
* `consentString`: The stored consent info string if there's any.

One can get access to the client information via the name attribute inside the iframe.
``` javascript
  /* Expect info to be an object of format
   * {
   *  'clientConfig': *,
   *  'consentStateValue': 'accepted'/'rejected'/'unknown'/undefined,
   *  'consentString': string/undefined,
   * };
   */
   info = JSON.parse(window.name);
```

## Adding your configuration to AMP
Once you have the remote endpoint and prompt UI iframe ready, you are ready to add your configuration to the AMP runtime.
1. Develop a patch that implements the following:
    1. Add a new configuration object to amp-consent component. The current CMP configurations are all placed [here](https://github.com/ampproject/amphtml/blob/master/extensions/amp-consent/0.1/cmps.js).
    1. Within your configuration, make sure to specify all the required fields that includes:
        1. `consentInstanceId`: The localStorage key to store/retrieve the user consent response.
        1. `checkConsentHref`: Your remote endpoint destination.
        1. `promptUISrc`: Your prompt UI iframe src.
    1. Add an example to the [`cmp-vendors.amp.html`](../../examples/cmp-vendors.amp.html) using your service. Note, the examples and filters should be in alphabetical order, and `_ping_` should be the first example.
    1. Add documentation for your configuration in [`extensions/amp-consent/cmp`](./cmps). See the [`_ping_`](./cmps/_ping_.md) documentation as an example.
    1. Add your platform unde the "Supported Consent Management Platforms" section in [`extensions/amp-consent/amp-consent.md`](./amp-consent.md).
    1. Add your GH user name as the POC for future maintenance issue.
1. Run end to end test on the new example you create.
1. Submit a Pull Request with this patch, referencing the Intent-To-Implement issue. @ampproject/wg-monetization for review.
1. Update your service's documentation and inform your customers.
1. It's highly recommended to maintain [an integration test outside AMP repo](../../3p/README.md#adding-proper-integration-tests).
