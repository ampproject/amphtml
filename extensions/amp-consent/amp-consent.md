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
    <td>Collects and stores a user's consent. It can also block other components based on the user's decision.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><div><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td>
      <div>
        <code>&lt;script async custom-element="amp-consent" src="https://cdn.ampproject.org/v0/amp-consent-0.1.js">&lt;/script></code>
      </div>
      <small>Note: The"amp-consent" script is required.</small>
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>
      <a href="https://ampbyexample.com">TODO Replace with example link</a>
    </td>
  </tr>
</table>

## Overview

You can use the <amp-consent> component to implement user controls. The component allows you to:

* Determine if the user should be asked to interact with the control.
* Capture the user’s consent decision.
* Makes the user’s setting available to elements on the AMP page to modify the page’s behavior.

## Usage

Only one single `<amp-consent>` element is allowed on the page, and that element must specify a unique `id`.

If you also include `<amp-user-notification>` elements in the page, the UI associated with the `<amp-consent>` and `<amp-user-notification>` will not be deterministic. Avoid using `<amp-consent>` with `<amp-user-notification>` if this would be problematic.


## Consent configuration

The `<amp-consent>` element requires a JSON configuration object that specifies the extension’s behavior. A `consents` object is required within the JSON object.

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


Currently, the `consents` object only supports a single consent instance. A consent instance must have an ID specified within the `consents` object (in the example above, “my-consent” is the id). The consent instance ID is used to generate a key when storing the user consent state.

#### checkConsentHref
`checkConsentHref` (required): Instructs AMP to make a CORS POST request with credentials to the specified URL to remotely configure the consent. The purpose is to determine if a prompt UI should be shown if the consent state is unknown.

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

Currently, AMP will not show consent prompt with a known consent state (i.e. the user has already accepted or rejected the consent), and will only show a prompt if `promptIfUnknown = true` with a unknown consent state, or upon user action. Below it is detailed how to enable showing a prompt.

#### promptUI

`promptUI`: Specifies the prompt element that is shown to collect the user's consent. The prompt element should be child element of `<amp-consent>` with an `id` that is referenced by the `promptUI`. How a user interacts with the prompt UI will be covered in the following. (TODO add link)


## Consent Management

`<amp-consent>` element supports customizing consent prompt UI and post-prompt UI, that can be used to manage consent.

### Styling

The `<amp-consent>` element is set to `position: fixed` after layout occurs (default is bottom: 0, which can be overridden).

By default, all UI elements contained within `amp-consent` have `display:none` and have `display` set to `display:block` when it is shown. No two UI elements are shown at the same time. When displayed, the UI element is fixed to the bottom of the page by default.

### Prompt UI (optional)

Prompt UI is defined within the consent instance config. The `promptUI` refers to an child element of `<amp-consent>` by its `id`.
```
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
AMP displays prompt UI on page load or by user interaction. The prompt UI is hidden with any of the three user actions described below.

#### Prompt Actions

There are three types of user actions that are associated with the consent prompt: `accept`, `reject` and `dismiss`.

To enable the user to choose a consent state and hide the prompt UI, add an `on` attribute to a button with the
following value scheme `on="event:idOfAmpConsentElement.accept/reject/dismiss"`

* `accept`: instructs AMP to store the accept decision to the consent, unblocks components waiting for the consent, and hides the prompt UI.

* `reject`: instructs AMP to store the reject decision to the consent, cancels `buildCallback` of components waiting for the consent, and hides the prompt UI.

* `dismiss`: instruct AMP to cancel `buildCallback` of components waiting for the consent, and hides the prompt UI.


### Post-prompt UI (optional)

Post-prompt UI is defined with the `<amp-consent>` JSON configuration object. The `postPromptUI` refers to a child element of `<amp-consent>` by id.

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
     <button on="tap:consent-element.dismiss" role="button">Dismiss</button>
  </div>

</amp-consent>
```

When defined, the post-prompt UI is shown when all prompt UIs have been hidden, or initially on page load if no prompt UI was triggered.

#### Post-prompt action

The post-prompt UI provides one user action type that can be used to allow the user to manage a previously set consent. Use `prompt` to display a prompt for a given consent instance. Add an `on` attribute to a button with the following value scheme `on="event:idOfAmpConsentElement.prompt"`.

## Blocking behaviors

The `<amp-consent>` element can be used to block any other AMP components on the page (except `<amp-consent>` itself).

To block components, add the `data-block-on-consent` attribute to the AMP component. This ensures that `buildCallback` of the component isn't called until consent has been accepted, or if the consent prompt has been skipped by the `checkConsentHref` response when consent is unknown.

AMP may support customizing blocking behaviors in the future. Because of this, the value of `data-block-on-consent` is reserved for now, please don't specify a value to the attribute.

Individual components may override this behavior to provide more specialized handling. Please refer to each component's documentation for details.
