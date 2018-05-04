<!--
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# <a name="amp-consent"></a> `amp-consent`

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Provides the ability to collect and store a user's consent through a UI control. Also provides the ability to block other AMP components based on the user's consent.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td>
      <div>
        <code>&lt;script async custom-element="amp-consent" src="https://cdn.ampproject.org/v0/amp-consent-0.1.js">&lt;/script></code>
      </div>
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>
      <li><a href="https://ampbyexample.com/user_consent/basic_user_consent_flow/">Basic user consent flow</a></li>
      <li><a href="https://ampbyexample.com/user_consent/advanced_user_consent_flow/">Advanced user consent flow</a></li>
    </td>
  </tr>
</table>

## Overview

As a publisher, you can use the `<amp-consent>` component to implement user controls. The component allows you to:

* Determine if the user should be asked to interact with the control.
* Capture the user’s consent decision.
* Makes the user’s setting available to elements on the AMP page to modify the page’s behavior.

If you are a vendor that wants to customize your component's behavior based on amp-consent, you can read more [here](https://github.com/ampproject/amphtml/blob/master/extensions/amp-consent/customizing-extension-behaviors-on-consent.md).

## Usage

Only a single `<amp-consent>` element is allowed on the page, and that element must specify a unique `id`.

If you also include an `<amp-user-notification>` element on the page, the UI associated with the `<amp-consent>` and `<amp-user-notification>` will not be deterministic. Avoid using `<amp-consent>` with `<amp-user-notification>` if this would be problematic.


## Consent configuration

The `<amp-consent>` element requires a JSON configuration object that specifies the extension's behavior. A `consents` object is required within the JSON object.

Example:

```html
<amp-consent layout="nodisplay" id="consent-element">
<script type="application/json">
{
  "consents": {
    "my-consent": {
      "checkConsentHref": "https://example.com/api/show-consent",
      "promptUI": "consent-ui"
    }
  }
}
</script>
</amp-consent>
```


### Consent Instance

#### Consent instance ID


Currently, the `consents` object only supports a single consent instance. A consent instance must have an ID specified within the `consents` object (in the example above, "my-consent" is the id). The consent instance ID is used to generate a key when storing the user consent state.

#### checkConsentHref
`checkConsentHref`: Instructs AMP to make a CORS POST request with credentials to the specified URL to remotely configure the consent. The purpose is to determine if a prompt UI should be shown if the consent state is unknown.

`checkConsentHref` is required if [`promptIfUnknownForGeoGroup`](#promptifunknownforgeogroup) is not defined.

##### Request
AMP sends the consent instance ID in the `consentInstanceId` field with the POST request.

```html
{
  "consentInstanceId": "my-consent"
}
```

##### Response

AMP expects the response to be a JSON object with a `promptIfUnknown` value that tells AMP if a prompt should be displayed when the user consent state is unknown.

```html
{
  "promptIfUnknown": true/false
}
```

If the response doesn't have `promptIfUnknown` set or has `promptIfUnknown` set to false, no prompt UI will be displayed on page load.

Currently, AMP will not show consent prompt with a known consent state (i.e. the user has already accepted or rejected the consent), and will only show a prompt if `promptIfUnknown = true` with a unknown consent state, or upon user action.  See below for details on how to display a prompt.

Optionally, additional key-value pairs can be returned in the response as the `sharedData` field.


```html
{
  "promptIfUnknown": true/false,
  "sharedData": {
    "a-key": "some-string-value",
    "key-with-bool-value": true,
    "key-with-numeric-value": 123
  }
}
```

The `sharedData` is made available to other AMP extensions just like the consent
state. It's up to the 3rd party vendor extensions and the `checkConsentHref`
remote endpoint to agree on particular meaning of those key-value pairs. One
example use case is for the remote endpoint to convey extra consent related info of the
current user to the 3rd party vendor extensions.

Unlike consent state, this `shareData` is not persisted in client side storage.

#### promptIfUnknownForGeoGroup
`promptIfUnknownForGeoGroup` Provides an alternative way to instruct AMP to display consent prompt or not when consent state is unknown.

To use `promptIfUnknownForGeoGroup`, a `<amp-geo>` component must be included and properly configured. The `promptIfUnknownForGeoGroup` then accepts a key of a geo group of country codes. More details on how `<amp-geo>` works can be found [here](https://github.com/ampproject/amphtml/blob/master/extensions/amp-geo/amp-geo.md).

In the case that `checkConsentHref` and `promptIfUnknownForGeoGroup` are both defined. `promptIfUnknown`'s value from response will be respected.

#### promptUI

`promptUI`: Specifies the prompt element that is shown to collect the user's consent. The prompt element should be child element of `<amp-consent>` with an `id` that is referenced by the `promptUI`. See the [Prompt UI](#prompt-ui) section for details on how a user interacts with the prompt UI.

## Consent Management

The `<amp-consent>` element supports customizing the consent prompt UI and post-prompt UI, which can be used to manage consent.

### Styling

The `<amp-consent>` element is set to `position: fixed` after layout occurs (default is bottom: 0, which can be overridden).

By default, all UI elements contained within `amp-consent` have `display:none` and have `display` set to `display:block` when it is shown. No two UI elements are shown at the same time. When displayed, the UI element is fixed to the bottom of the page by default.

### Prompt UI

The prompt UI is defined within the consent instance config. The `promptUI` attribute refers to a child element of `<amp-consent>` by its `id`.

*Example*: Displays a prompt user interface

```html
<amp-consent layout="nodisplay" id="consent-element">
  <script type="application/json">
  {
    "consents": {
      "my-consent": {
        "checkConsentHref": "https://foo.com/api/show-consent",
        "promptUI": "consent-ui"
      }
    }
  }
  </script>
  <div id="consent-ui">
    <button on="tap:consent-element.accept" role="button">Accept</button>
    <button on="tap:consent-element.reject" role="button">Reject</button>
    <button on="tap:consent-element.dismiss" role="button">Dismiss</button>
  </div>
</amp-consent>
```

AMP displays prompt UI on page load or by user interaction. The prompt UI is hidden based on the three user actions described below.

#### Prompt Actions

There are three types of user actions that are associated with the consent prompt: `accept`, `reject` and `dismiss`.

To enable the user to choose a consent state and hide the prompt UI, add an `on` attribute to a button with the
following value scheme `on="event:idOfAmpConsentElement.accept/reject/dismiss"`

* `accept`: publisher instructs AMP to remember the accept decision to the consent, unblocks components waiting for the consent, and hides the prompt UI.

* `reject`: publisher instructs AMP to remember the reject decision to the consent, cancels `buildCallback` (AMP lifecycle callback to [build AMP components](https://github.com/ampproject/amphtml/blob/master/contributing/building-an-amp-extension.md#buildcallback)) of components waiting for the consent, and hides the prompt UI.

* `dismiss`: instruct AMP to cancel `buildCallback` of components waiting for the consent, and hides the prompt UI.


### Post-prompt UI (optional)

You can provide a UI after collecting the initial consent. For example, you can provide a UI for the user to manage their consent (e.g., change their "reject" to "accept"). The post-prompt UI is defined with the `<amp-consent>` JSON configuration object. The `postPromptUI` refers to a child element of `<amp-consent>` by id.

When defined, the post-prompt UI is shown when all prompt UIs have been hidden, or initially on page load if no prompt UI was triggered.

```html
<amp-consent layout="nodisplay" id="consent-element">
  <script type="application/json">
  {
    "consents": {
      "consent-foo": {
        ...
        "promptUI": "consent-ui"
      }
    },
    "postPromptUI": "post-consent-ui"
  }
  </script>
  <div id="consent-ui">
     ...
  </div>
  <div id="post-consent-ui">
     <button on="tap:consent-element.dismiss" role="button">Settings</button>
  </div>

</amp-consent>
```

#### Post-prompt action

The post-prompt UI provides one user action type that can be used to allow the user to manage a previously set consent. Use `prompt` to display a prompt for a given consent instance. Add an `on` attribute to a button with the following value scheme `on="event:idOfAmpConsentElement.prompt"`.

## Blocking behaviors

The `<amp-consent>` element can be used to block any other AMP components on the page from loading (except `<amp-consent>` itself).

To block components, add the `data-block-on-consent` attribute to the AMP component. This ensures that `buildCallback` of the component isn't called until consent has been accepted, or if the consent prompt has been skipped by the `checkConsentHref` response when consent is unknown. In effect, this means that all behaviors of the element (e.g. sending analytics pings for `<amp-analytics>` or the loading of an `<amp-ad>`) are delayed until the relevant consent instance is accepted.

AMP may support more advanced customizing blocking behaviors in the future. Because of this, the value of `data-block-on-consent` is reserved for now, please don't specify a value to the attribute.

Individual components may override this behavior to provide more specialized handling. Please refer to each component's documentation for details.


*Example: Blocking the analytics until user accepts consent*

```html
<amp-analytics data-block-on-consent
  type="googleanalytics">
</amp-analytics>
```

### Advanced Consent Blocking Behaviors
An optional `policy` object can be added to the `<amp-consent>` element's JSON configuration object to customize consent blocking behaviors.

```html
<amp-consent layout="nodisplay" id="consent-element">
  <script type="application/json">
  {
    "consents": {
      "my-consent": {
        "checkConsentHref": "https://example.com/api/show-consent"
      }
    }
    "policy": {
      "default": {
        "waitFor": {
          "my-consent": []
        }
        "timeout": {
          "seconds": 5,
          "fallbackAction": "reject"
        }
      }
    }
  }
  </script>
</amp-consent>
```
Right now only customizing the `default` policy instance is supported. The "default" behavior policy applies to every component that is blocked by consent with `data-block-on-consent` attribute.

### Policy Instance (optional)

#### waitFor
`waitFor` object specifies the consent instance that needs to wait. Each consent instance requires an array value. AMP may support sub item lists under an consent instance, but right now only empty array is expected, and the value will be ignored.

#### timeout (optional)
`timeout` can be used to inform components the current consent state status after specified time.

When used as a single value, `timeout` equals the timeout value in second.

```html
  "default": {
    "waitFor": {
      "my-consent": []
    }
    "timeout": 2
  }
```

When used as an object. `timeout` object supports two attributes
* `seconds`: timeout value in second
* `fallbackAction` (optional): the fallback action at timeout if no user action is taken and no state has been stored. The fallback actions supported are `reject` and `dismiss`. Default action is `dismiss` if not configured. Note the consent state changed due to fallback action at timeout will not be stored on client side.

```html
  "default": {
    "waitFor": {
      "my-consent": []
    }
    "timeout": {
      "seconds": 2,
      "fallbackAction": "reject"
    }
  }
```






## Integrations and availablity
The table below lists the vendors and components that are integrated with amp-consent

| Integration   | Prod Availability| Documentation|Ready For Testing
| ------------- |------------------| -----| -----|
| DoubleClick & AdSense Integration      | 05/10/18 | [Link](https://support.google.com/dfp_premium/answer/7678538) |Yes|
| AMP IMA Video Integration   |  05/15/18  |   ||
| AMP Geo |  05/10/18      |  [Link](https://ampbyexample.com/user_consent/geolocation-based_consent_flow/) |Yes|
| AMP Stories |   05/15/18     |    ||



