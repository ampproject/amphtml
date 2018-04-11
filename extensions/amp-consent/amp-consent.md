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
    <td>The component collects and stores user consents. It can also block other components based on the user decision.</td>
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
      <small>Notice that  "amp-consent" script is required.</small>
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>
      <a href="https://ampbyexample.com/components/amp-user-notification/">TODO Replace with example link</a>
    </td>
  </tr>
</table>

## Usage
Only one single `<amp-consent>` element is allowed on the page. An `id` is required to specify the component with user actions like accept or reject consent.

The component works with the `<amp-user-notification>` elements, that only one prompted notification or consent UI is shown at a single time. The order of the prompted UIs being shown is currently not deterministic.


## Consent Configuration

`<amp-consent>` element requires a JSON configuration object, that is used to specify the extension behaviors. And `consents` objects is required within the JSON object.

Example:

```html
<amp-consent layout="nodisplay" id="amp-consent">
<script type="application/json">
{
  "consents": {
    "${consentInstanceId}": {
      "checkConsentHref": "https://foo.com/api/show-consent",
      "promptUI": "consent-ui"
    }
  }
}
</script>
</amp-consent>
```


### Consent Instance

#### ConsentInstanceId
`consents` object only supports a single consent instance currently. A consent instance must have a `consentInstanceId`. The `consentInstanceId` will be used to generate a key when storing user consent state.

#### checkConsentHref
`checkConsentHref` is required to instruct AMP to make a CORS POST request with credentials to the specified URL to determine whether notification should be shown in individual cases.

##### Request
AMP sends the `consentInstanceId` with the POST request.
```html
{
  "consentInstanceId": ${consentInstanceId}
}
```

##### Response
AMP expects the response to be a JSON object with a `promptIfUnknown` value. That tells AMP if prompt is required when the user consent state is unknown.
```html
{
  "promptIfUnknown": true/false
}
```
If the response doesn't have `promptIfUnknown` set, or have `promptIfUnknown` set to false, `<amp-consent>` will take it as consent prompt is not required. And instruct other components that the consent is not required if its state is unknown as well.

Currently, AMP will not show consent prompt with a known consent state (If the user has accepted or rejected the consent), and will only show show consent prompt with `promptIfUnknown = true` with a unknown consent state. However it is possible trigger consent prompt regardless with user action.


#### promptUI
`promptUI` if defined, is used to specify the prompt element that is shown to collect user consent. the prompt element should be child element of `<amp-consent>` with an `id` that is referenced by the `promptUI`. How user can interact with the prompt UI will be covered in the following. (TODO add link)


## Consent Collection and Management

`<amp-consent>` element supports customizing consent prompt UI and post prompt UI, that can be used to collect consent and manage consent.

### Styling

The `<amp-consent>` will have `position: fixed` after layout (default is bottom: 0, which can be overridden).

All UI elements will have `display:none` by default. And have `display` set to `display:block` when it is shown. No two UI elements will be shown at the same time. When displayed, the UI element will be fixed to the bottom of the page by default.

### Prompt UI (optional)
Prompt UI is defined within the consent instance config. The `promptUI` will refer to an child element of `<amp-consent>` by id.
```
<amp-consent layout="nodisplay" id="amp-consent">
  <script type="application/json">
  {
    "consents": {
      "foo-consent": {
        "checkConsentHref": "https://foo.com/api/show-consent",
        "promptUI": "ui"
      }
    }
  }
  </script>
  <div id="ui">
    <button on="tap:amp-consent.accept" role="button">Accept</button>
    <button on="tap:amp-consent.reject" role="button">Reject</button>
    <button on="tap:amp-consent.dismiss" role="button">Dismiss</button>
  </div>
</amp-consent>
```
Prompt UI can be triggered by AMP on page load, or by user interaction. It will be hid with any of the three user actions.

#### Prompt Actions
There are three types of user actions that are associated with consent prompt: `accept`, `reject` and `dismiss`.

To enable user to act to consent and hide prompt UI, add an `on` attribute to a button with the
following value scheme `on="event:idOfAmpConsentElement.accept/reject/dismiss"`

`accept` will instruct AMP to store the the accept decision to the consent, unblock components that wait for the consent and hide prompt UI.

`reject` will instruct AMP to store the the reject decision to the consent, cancel `buildCallback` of components that wait for the consent and hide prompt UI.

`dismiss` will instruct AMP to cancel `buildCallback` of components that wait for the consent and hide prompt UI.


### Post prompt UI (optional)
Post prompt UI is defined with the `<amp-consent>` JSON configuration object. The `postPromptUI` will refer to an child element of `<amp-consent>` by id.
```
<amp-consent layout="nodisplay" id="amp-consent">
  <script type="application/json">
  {
    "consents": {
      "consent-foo": {
        ...
        "promptUI": "ui"
      }
    },
    "postPromptUI": "post-ui"
  }
  </script>
  <div id="post-ui">
     <button on="tap:amp-consent.dismiss" role="button">Dismiss</button>
  </div>
  <div id="ui">
     ...
  </div>
</amp-consent>
```
When defined, post prompt UI will be shown when all prompt UIs have been hidden or with known consent state on page load.

#### Post prompt Action
Post prompt UI provides one user action type `prompt`, that can be used to re-trigger consent prompt for a given consent instance. To enable user to manage consent by re-triggering consent prompt UI,  add an `on` attribute to a button with the
following value scheme `on="event:idOfAmpConsentElement.prompt(consent=idOfConsentInstance)"`.

## Blocking Behaviors

`<amp-consent>` can be used to block any other AMP components on the page (except `<amp-consent>` it self). If opted in, the `buildCallback` of the component will not be called until consent has been accepted, or consent prompt has been skipped by the `checkConsentHref` response when consent is unknown.

Individual component may override this behavior, please refer to each component's documentation for details.

To opt-in, and block an AMP component. Add `data-block-on-consent` attribute to the AMP component. AMP may support customizing blocking behaviors in the future. Because of this the value of `data-block-on-consent` is reserved for now, please don't specify a value to the attribute.
