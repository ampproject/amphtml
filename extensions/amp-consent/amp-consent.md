---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Provides the ability to collect and store a user's consent through a UI control.
---
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

# amp-consent

Provides the ability to collect and store a user's consent through a UI control. Also provides the ability to block other AMP components based on the user's consent.

<table>
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

#### onUpdateHref
`onUpdateHref`: Instructs AMP to make a CORS HTTPS POST request with credentials to the specified URL whenever the stored consent state changes.

AMP sends the consent instance ID, a generated user id only for this usage and the consent state along with the POST request.

```html
{
  "consentInstanceId": "my-consent",
  "ampUserId": "xxx",
  "consentState": true/false,
}
```

#### promptIfUnknownForGeoGroup
`promptIfUnknownForGeoGroup` Provides an alternative way to instruct AMP to display consent prompt or not when consent state is unknown.

To use `promptIfUnknownForGeoGroup`, a `<amp-geo>` component must be included and properly configured. The `promptIfUnknownForGeoGroup` then accepts a key of a geo group of country codes. More details on how `<amp-geo>` works can be found [here](https://github.com/ampproject/amphtml/blob/master/extensions/amp-geo/amp-geo.md).

In the case that `checkConsentHref` and `promptIfUnknownForGeoGroup` are both defined. The value from `<amp-geo>` will be respected.

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

AMP also supports external consent UI flow with the usage of `<amp-iframe>`. More information about the communication of user actions can be found [below](#prompt-actions-from-external-consent-ui).
#### Prompt UI for Stories

The `amp-story` extension provides a [default prompt UI](https://user-images.githubusercontent.com/1492044/40135514-8ab56d10-5913-11e8-95a2-72ac01ff31e0.png), that requires using a `<amp-story-consent>` component as the prompt UI. This component content requires a `title`, a `message`, and a list of `vendors`, and has to be specified in its own component configuration.
The decline button can be hidden by adding an optional `onlyAccept` boolean parameter.
Additionally, an optional templated external link to the privacy policy or settings can be configured, by adding `"externalLink": {"title": "Privacy Settings", "href": "https://example.com"}` to the consent configuration.

*Example*: Displays a prompt user interface on an AMP Story

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
  <amp-story-consent id="consent-ui" layout="nodisplay">
    <script type="application/json">
    {
      “title”: "My title",
      “message”: "My example message.",
      “vendors”: ["Item 1", "Item 2", "Item 3", "Item 4"]
    }
    </script>
  </amp-story-consent>
</amp-consent>
```

#### Prompt Actions

There are three types of user actions that are associated with the consent prompt: `accept`, `reject` and `dismiss`.

To enable the user to choose a consent state and hide the prompt UI, add an `on` attribute to a button with the
following value scheme `on="event:idOfAmpConsentElement.accept/reject/dismiss"`

* `accept`: publisher instructs AMP to remember the accept decision to the consent, unblocks components waiting for the consent, and hides the prompt UI.

* `reject`: publisher instructs AMP to remember the reject decision to the consent, cancels `buildCallback` (AMP lifecycle callback to [build AMP components](https://github.com/ampproject/amphtml/blob/master/contributing/building-an-amp-extension.md#buildcallback)) of components waiting for the consent, and hides the prompt UI.

* `dismiss`: instruct AMP to cancel `buildCallback` of components waiting for the consent, and hides the prompt UI.

##### Prompt Actions from External Consent UI

When using iframes as consent prompt UI. Iframes can send a `consent-response` message to the parent AMP page to inform [prompt actions](#prompt-actions) on the current consent. Note the message must come from the `<amp-iframe>` created iframe. Messages from nested iframes will be ignored.

*Example: iframe `consent-response` request*

```javascript
window.parent.postMessage({
  type: 'consent-response',
  action: 'accept/reject/dismiss'
}, '*');
```


<a name="post-prompt"></a>
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

### Basic blocking behaviors
To block components, add the `data-block-on-consent` attribute to the AMP component. This ensures that `buildCallback` of the component isn't called until consent has been accepted, or if the consent prompt has been skipped by the `checkConsentHref` response or `promptIfUnknownForGeoGroup` when consent is unknown. In effect, this means that all behaviors of the element (e.g. sending analytics pings for `<amp-analytics>` or the loading of an `<amp-ad>`) are delayed until the relevant consent instance is accepted.

Individual components may override this behavior to provide more specialized handling. Please refer to each component's documentation for details.


*Example: Blocking the analytics until user accepts consent*

```html
<amp-analytics data-block-on-consent
  type="googleanalytics">
</amp-analytics>
```

### Advanced predefined consent blocking behaviors
AMP provides a list of pre-defined [consent policy instances](#policy-instance-optional) for publishers to easily define consent blocking behaviors to individual components.

Set the value to the `data-block-on-consent` attribute to use the pre-defined consent blocking behavior policy.

*Example: Blocking the analytics until user respond to consent*

```html
<amp-analytics data-block-on-consent="_till_responded"
  type="googleanalytics">
</amp-analytics>
```

AMP may support more advanced pre-defined blocking behaviors in the future. Because of this, the value of `data-block-on-consent` is reserved only for the following supported pre-defined attributes:

* `_till_responded` : Unblock the component until the user has responded to the consent prompt, or the consent prompt has been skipped.
* `_till_accepted` : [Default basic blocking behavior](#basic-blocking-behaviors), expect that when `_till_accepted` is explicitly added, individual components cannot override the blocking behavior.
* `_auto_reject` : Always reject the consent automatically if consent is required but unknown. The reject consent decision will not be stored. It is recommended not to specify a consent prompt UI when auto rejecting consent for every components.

When one of the pre-defined attributes is used, AMP assumes that the publisher takes final control on the consent blocking behaviors. Individual components cannot override the blocking behaviors brought by pre-defined consent policy, they can however still customize components' behaviors after having been unblocked.

### Customize Consent Blocking Behaviors
An optional `policy` object can be added to the `<amp-consent>` element's JSON configuration object to customize consent blocking behaviors.

```html
<amp-consent layout="nodisplay" id="consent-element">
  <script type="application/json">
  {
    "checkConsentHref"
    "consentInstanceId": "ping2"
    "geo": abc,
    "extraConfig" : {
      'id': xxx
      'config': asdsdfasd,
    },
    "postPromptUI": 'test'
  }

  {
    "consentInstanceId": xxx
    "checkConsentHref": "https://example.com/api/show-consent"
    "policy": {
      "default": {
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
    },
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
    },
    "timeout": {
      "seconds": 2,
      "fallbackAction": "reject"
    }
  }
```

## Integrations and availability
The table below lists the vendors and components that are integrated with amp-consent

| Integration   | Prod Availability | Documentation|Ready For Testing
| ------------- |------------------| -----| -----|
| DoubleClick & AdSense Integration      | 05/10/18 | [Link](https://support.google.com/dfp_premium/answer/7678538) |Yes|
| AMP IMA Video Integration   |  05/15/18  |   [Link](https://github.com/ampproject/amphtml/blob/master/extensions/amp-ima-video/consent-blocking.md) |Yes|
| AMP Geo |  05/10/18      |  [Link](https://ampbyexample.com/user_consent/geolocation-based_consent_flow/) |Yes|
| AMP Stories |   05/15/18     |[Link](#prompt-ui-for-stories)|Yes|


## FAQs

##### Will AMP change any behavior by default on May 25th?

No. All desired behavior on AMP pages is managed by publishers and this is no different.

##### How can I stop making ad and analytics calls on all my AMP pages?

Use the [`data-block-on-consent`](#blocking-behaviors) attribute on the [`<amp-ad>`](https://amp.dev/documentation/components/amp-ad) or [`<amp-analytics>`](https://amp.dev/documentation/components/amp-analytics) component.

Example:

```html
<amp-ad data-block-on-consent
    width=320 height=50
    type="doubleclick"
    data-slot="/4119129/mobile_ad_banner">
</amp-ad>
```

**Note**: For some vendors, the `data-block-on-consent` attribute only works in conjunction with `<amp-consent>`. Consult with your ad or analytics vendor for implementation details.

##### How can I gather consent from all users on AMP pages?

Use the `<amp-consent>` component which allows configuring a custom UI with `Accept`, `Reject` and `Dismiss` states. It is up to each amp-component vendor how they interpret these states, so please read your vendor's documentation carefully.

Note that you must configure either the [`promptIfUnknownForGeoGroup`](#promptifunknownforgeogroup) attribute or the checkConsentHref request.

##### How can I stop showing all of my content to users from the EEA?

You could consider hiding all your content for EEA users by implementing [`<amp-geo>`](https://amp.dev/documentation/components/amp-geo). See [this blog post](https://www.ampproject.org/latest/blog/dynamic-geo-personalization/) for more details.

##### How can I target consent for only EEA users?

Use [`<amp-geo>`](https://amp.dev/documentation/components/amp-geo) to configure a country group and hook up the country group to `promptIfUnknownForGeoGroup` attribute in `<amp-consent>`. If the user accesses the AMP page from a country that's configured in the list, the appropriate consent UI will be invoked.

##### Can I make the consent UI blocking?

Yes. The UI is not prescriptive. If you do end up providing a non-blocking version of the UI, dismissing the UI will lead to a `dismiss` state. It is up to each vendor (ads & analytics) how they would process `accept`, `reject` and `dismiss`.

##### What is `checkConsentHref`? And why is it mandatory?

Note that [`checkConsentHref`](#checkconsenthref) is not mandatory if you configure the [`promptIfUnknownForGeoGroup`](#promptifunknownforgeogroup) attribute.

`checkConsentHref` gives you, the publisher, the ability to know if a consent must be shown to the user.  For example, by using this call, you may determine the user's geo-location on the server-side, allowing you to suppress the consent. You can also instead use `<amp-geo>` and `promptIfUnknownForGeoGroup` to achieve the same result without any server-side setup.

You may also choose to suppress the consent if you detect that the user doesn't need consent because they accepted consent on a different property or for alternate reasons.

##### What is `promptIfUnknown`?

`promptIfUnknown` is a response key set on the `checkConsentHref` request, which is made on every pageview.

Responses to `promptIfUnknown` can have a boolean value. A value of `true` shows the consent; a value of `false` does not show the consent.

##### I also manage consent on non-AMP pages, how can I reconcile the two?

You can configure `checkConsentHref` to call your own server-side endpoint to detect consent state for the user and reconcile how you want AMP to behave with a response on `promptIfUnknown`.

##### How can I send additional information to an ad network/analytics provider?

The response on `checkConsentHref` also accepts values for the key [`sharedData`](#response) on the response which will be made available to all vendor components being blocked by the consent logic. It is up to the vendor how they process this sharedData. DoubleClick/AdSense expect specific key-values, refer to their [documentation](https://support.google.com/dfp_premium/answer/7678538#amp-pages) for details.

##### I have a complicated consent UI, will it work?

You should try out the [advanced consent flows](https://ampbyexample.com/user_consent/advanced_user_consent_flow/) to see how it's implemented. You could also consider using the [`<amp-selector>`](https://amp.dev/documentation/components/amp-selector) component.

##### How can I show a persistent UX element for users to update their consent preferences?

You can use the optional [post-prompt UI](#post-prompt) to accomplish this. View this [sample on AMP By Example](https://ampbyexample.com/user_consent/basic_user_consent_flow/) for a similar implementation.

##### Can I keep the non-EU experience unchanged and just deliver an "opt-out" experience to all EU users?

You can configure `<amp-consent>` and [`<amp-geo>`](https://amp.dev/documentation/components/amp-geo) to show consent to users in specific countries (e.g., via a list of EEA countries that you configure). The `<amp-consent>` component can also be configured to automatically "reject" consent on behalf of the user, if the publisher so desires. The way to do this is by setting the [`timeout`](#timeout-optional) seconds to `0` and `fallbackAction` to `reject`. Note that the `fallbackAction` state won't be stored across sessions. Note also that each ad network will have its own implementation for how it interprets a "reject" action from a user.  There is no way to automatically 'accept' consent on behalf of the user.

You can [learn more](https://support.google.com/dfp_premium/answer/7678538) about how Google AdSense and DoubleClick plan to handle a 'reject', and any configuration available to serve non-personalized ads.

##### Can the consent be set via amp-geo, either directly or through amp-bind? If not, can it be set in the response from checkConsentHref?

You can use the response of `checkConsentHref` to show a consent to the user if there is no previous consent state, which allows the user to go through the consent flow. For details on how to reject consent by default, see the opt-out question above.  It isn't possible to "accept" consent by default.

##### Is "checkConsentHref" called on every page view or during every user action?

`checkConsentHref` is called on every page view before the consent UI is displayed to the user.

##### Can amp-geo work with amp-consent so that it only shows consent for a user that's accessing my content from a certain country?

Yes. See example [here](https://ampbyexample.com/user_consent/geolocation-based_consent_flow/).

##### I can't see feature X being supported, what can I do?

Join in on the discussion where we are discussing [upcoming potential features](https://github.com/ampproject/amphtml/issues/13716#issuecomment-382474345). Please chime in on the thread if something isn't supported yet.

## Related resources

*   Blog post: [New functionality to help manage user choice in AMP pages](https://www.ampproject.org/latest/blog/new-functionality-to-help-manage-user-choice-in-amp-pages/)
*   Blog post: [Dynamic geo-personalization](https://www.ampproject.org/latest/blog/dynamic-geo-personalization/)
*   [`<amp-geo>` documentation](https://amp.dev/documentation/components/amp-geo)
*   [DoubleClick/ AdSense documentation ](https://support.google.com/dfp_premium/answer/7678538#amp-pages)
*   [New feature discussion for amp-consent](https://github.com/ampproject/amphtml/issues/13716#issuecomment-382474345)
