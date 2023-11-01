---
$category@: dynamic-content
formats:
  - websites
  - stories
teaser:
  text: Provides the ability to collect and store a user's consent through a UI control. Also provides the ability to block other AMP components based on the user's consent.
---

# amp-consent

## Overview

As a publisher, you can use the `<amp-consent>` component to implement user controls. The component allows you to:

-   Determine if the user should be asked to interact with the control.
-   Capture the user’s consent decision.
-   Makes the user’s setting available to elements on the AMP page to modify the page’s behavior.

If you are a vendor that wants to customize your component's behavior based on amp-consent, or need to collect more advanced consent information you can read more [here](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/customizing-extension-behaviors-on-consent.md).

## Usage

Only a single `<amp-consent>` element is allowed on the page, and that element must specify a unique `id`.

If you also include an `<amp-user-notification>` element on the page, the UI associated with the `<amp-consent>` and `<amp-user-notification>` will not be deterministic. Avoid using `<amp-consent>` with `<amp-user-notification>` if this would be problematic.

## Granular and global consent

`<amp-consent>` supports **global consent**, in which users can make a single consent choice for a website. It also supports **granular consent**, allowing users to make a set of choices.

To implement granular consent, define a set of **consent purposes**. Choose a name for each purpose. Create a UI that allows the user to make choices for each, and use the `setPurpose()` action to save each choice.

The other actions that `<amp-consent>` supports apply to both granular and global consent. Thus, a webpage can implement both types simultaneously.

## Consent configuration

The `<amp-consent>` element requires a JSON configuration object that specifies the extension's behavior.

Example:

```html
<amp-consent layout="nodisplay" id="consent-element">
  <script type="application/json">
    {
      "consentInstanceId": "my-consent",
      "consentRequired": "remote",
      "checkConsentHref": "https://example.com/api/check-consent",
      "promptUI": "consent-ui",
      "onUpdateHref": "https://example.com/update-consent"
    }
  </script>
  <div id="consent-ui">
    <button on="tap:consent-element.accept">Accept</button>
    <button on="tap:consent-element.reject">Reject</button>
    <button on="tap:consent-element.dismiss">Dismiss</button>
  </div>
</amp-consent>
```

### Consent Instance

#### Consent instance ID

`consentInstanceId`: The identifier of a consent configuration.

#### checkConsentHref

`checkConsentHref`: Instructs AMP to make a CORS POST request with credentials to the specified URL to remotely configure the consent. The purpose can be any of 1) determine if consent is required for the user, 2) get the consent state from server, 3) get extra `sharedData` from server to share with AMP components.

##### Request

AMP sends the consent instance ID in the `consentInstanceId` field with the POST request.

```
{
  "consentInstanceId": {string},
  "consentStateValue": {enum}, // the stored consent state in client cache
                               // takes value of ["accepted", "rejected", "unknown"]
  "consentString": {string},   // the stored consent string in client cache
  "matchedGeoGroup": {string}, // (new) the user's geoGroup detected by AMP.
}
```

##### Response

AMP expects the response to be a JSON object like the following:

```
{
  "consentRequired": {boolean}                  // Whether consent is required from the user.
                                                // The value is required it is used to
                                                // determine if consent is required. If not
                                                // found, AMP will unblock content as consent is not required.
  "consentStateValue": {?enum} [default: null], // The latest consent state known
                                                // by the server
                                                // Takes value of ["accepted", "rejected",
                                                // "unknown"].
                                                // The value will be ignored if
                                                // "consentRequired: false".
                                                // If the value is non-null, it will be cached at client.
  "consentString": {?string} [default: null],   // The latest consent string known by the server.
                                                // If the value is non-null,
                                                // and if the consentStateValue is "accepted" or "rejected",
                                                // the value will be cached at client.
  "expireCache": {boolean} [default: false]     // Indicate that the cache needs to be cleared
                                                // Set to `true` in conjunction with
                                                // consentStateValue='accepted'/'rejected'
                                                // to enforce server side consent state
}
```

For granular consent, this response can also contain a map of `purposeConsent` choices.

**Note: The legacy `promptIfUnknown` is migrating to `consentRequired` as prompt is no longer strictly required to manage consents.**

The `consentStateValue` can be thought of as a signal for the runtime to block and unblock components. The value `accepted` instructs AMP that the user has given consent (or doesn't revoke consent in the opt-out case). This can be used to serve personalized ads in some scenarios. The value `rejected` means the user doesn't give consent (or has revoked consent in the opt-out case) and vendors may decide to not serve personalized ads.

Optionally, additional key-value pairs can be returned in the response as the `sharedData` field.

```json
{
  "consentRequire": true,
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

#### consentRequired

`consentRequired`: It accepts a boolean value indicating if a consent is required. `<amp-consent>` will unblock components with an `UNKNOWN_NOT_REQUIRED` state if `consentRequired: false` and there's no previous consent decision stored in client cache. It makes sense mostly with a combination of [geoOverride](#geooverride) config so that only a certain regions require consent.

It can also be set to `consentRequired: "remote"` to fetch the value remotely from the `checkConsentHref` endpoint. This is
useful when publishers want to use their own server to decide if consent is required. For example, they want to have their own geo detection, or use the existing consent state for a known user. When used without `geoOverride`(#geooverride), the `consentRequired` value is set to `remote` by default if not specified.

Note that this value will be ignored if there is previous consent state stored in client cache (see [Client caching](#client-caching) section for examples).

#### purposeConsentRequired

For [granular consent](#granular-and-global-consent), `purposeConsentRequired` lets you specify an array of consent purposes. Until the user has made a choice for each, the [consent UI](#prompt-ui) will appear each time they visit your webpage.

For example, if you want to make sure the user makes a choice for consent purposes you've called `purpose-analytics` and `purpose-marketing`, your JSON would include:

```json
"purposeConsentRequired": ["purpose-analytics", "purpose-marketing"]
```

#### onUpdateHref

`onUpdateHref`: Instructs AMP to make a CORS HTTPS POST request with credentials to the specified URL whenever the stored consent state changes.

AMP sends the consent instance ID, a generated user id only for this usage and the consent state along with the POST request.

```
{
  "consentInstanceId": "my-consent",
  "ampUserId": "xxx",
  "consentStateValue": "accepted"/"rejected"/"unknown"
}
```

#### promptUI

`promptUI`: Specifies the prompt element that is shown to collect the user's consent. The prompt element should be child element of `<amp-consent>` with an `id` that is referenced by the `promptUI`. See the [Prompt UI](#prompt-ui) section for details on how a user interacts with the prompt UI.

The consent decisions collected from user via this prompt UI will be stored in `localStorage` as client cache. See the [Client caching](#client-caching) section for how the cache is used.

#### geoOverride

`geoOverride` provides a way to utilize the `<amp-geo>` component to detect user's geo location to assist client side decisions.

`geoOverride` is a JSON object keyed by geo group codes which are defined in `<amp-geo>` (details [here](https://github.com/ampproject/amphtml/blob/main/extensions/amp-geo/amp-geo.md)). Each geo override should be a valid `<amp-consent>` config object. AMP will take all the values in the corresponding `geoOverride` to override the existing config. The only exception here is that the `consentInstanceId` cannot be overwritten by `geoOverride` config, because AMP only manage and store consent information in a single instance.

Two important tips when configuring `amp-geo`:

-   All geo groups should be mutually exclusive. The behavior is undetermined if a user falls into multiple geo override.
-   Provide an `geoGroupUnknown` override for users that are failed be be identified by `<amp-geo>`.

Take the following config as an example:

```json
{
  "onUpdateHref": "https://example.com/update-consent",
  "promptUI": "consent-ui",
  "consentRequired": false,

  "geoOverride": {
    "geoGroup1": {
      "consentRequired": true
    },
    "geoGroup2": {
      "checkConsentHref": "https://example.com/check-consent",
      "consentRequired": "remote"
    },
    "geoGroupUnknown": {
      "checkConsentHref": "https://example.com/check-consent",
      "consentRequired": true
    }
  }
}
```

For users outside `geoGroup1`, `geoGroup2` & `geoGroupUknown`, the merged config is

```json
{
  "onUpdateHref": "https://example.com/update-consent",
  "promptUI": "consent-ui",
  "consentRequired": false
}
```

`<amp-consent>` does nothing because `"consentRequired": false`.

For users in `geoGroup1`, the merged config is

```json
{
  "onUpdateHref": "https://example.com/update-consent",
  "promptUI": "consent-ui",
  "consentRequired": true
}
```

Because `checkConsentHref` is not specified, both consent collection and storage are completely handled at client side. AMP will prompt the consent UI if and only if the client cache is empty.

For users in `geoGroup2`, the merged config is

```json
{
  "onUpdateHref": "https://example.com/update-consent",
  "promptUI": "consent-ui",
  "checkConsentHref": "https://example.com/check-consent",
  "consentRequired": "remote"
}
```

If client cache is empty, AMP will wait for `checkConsentHref` response to decide whether a consent is required from the user. If the response contains `consentRequired: true` and `consentStateValue: unknown`, then AMP will collect consent via the specified prompt UI. If `consentStateValue` is 'accepted' or 'rejected', then it will use this value and also sync to cache.

For users in `geoGroupUnknown`, the merged config is

```json
{
  "onUpdateHref": "https://example.com/update-consent",
  "promptUI": "consent-ui",
  "checkConsentHref": "https://example.com/check-consent",
  "consentRequired": true
}
```

AMP will check client cache and server in parallel to find the previous consent state. Because `"consentRequired": true` it will collect consent via the specified prompt UI if cache is empty w/o waiting for the server response. The server response is mainly for cache refresh or fetching `shareData`.

#### xssiPrefix

`xssiPrefix`: Causes `<amp-consent>` to strip a prefix from the `checkConsentHref` endpoint's response. If the prefix is not present in the response, then this option will have no effect. `xssiPrefix` can be useful for APIs that include [security prefixes](http://patorjk.com/blog/2013/02/05/crafty-tricks-for-avoiding-xssi/) like `)]}` to help prevent cross site scripting attacks.

#### uiConfig

`uiConfig` provides extra UI and behaviors to `<amp-consent>`. `uiConfig` is an optional JSON object that can contain the key `overlay` which is a boolean. `overlay: true` will add a light black overlay behind the consent prompt to help users focus on the prompt. Additionally, this will stop user interaction with the contents beneath the consent prompt (such as scrolling). `overlay: false` is the default.

#### captions

`captions` provides accessibility features for screen reader users for `<amp-consent>`. `captions` is an optional JSON an object that can contain the `consentPromptCaption` and `buttonActionCaption` strings. The default values for these fields are 'User Consent Prompt' and 'Focus Prompt' respectivly, but they can be overriden and customized for your use case (such as localization). When a consent prompt in an iframe is loaded, the screen reader will read the `consentPromptCaption` and then the `buttonActionCaption`. The `consentPromptCaption` should act as a title for the consent prompt, while the `buttonActionCaption` should inform the user that they can interact with the iframe.

```json
{
  "captions": {
    "consentPromptCaption": "This is an example user consent prompt",
    "buttonActionCaption": "Click to interact with the prompt"
  }
}
```

## Consent Management

The `<amp-consent>` element supports customizing the consent prompt UI and post-prompt UI, which can be used to manage consent.

### Styling

The `<amp-consent>` element is set to `position: fixed` after layout occurs (default is bottom: 0, which can be overridden).

By default, all UI elements contained within `amp-consent` have `display:none` and have `display` set to `display:block` when it is shown. No two UI elements are shown at the same time. When displayed, the UI element is fixed to the bottom of the page by default.

### Prompt UI

The prompt UI is defined within the consent instance config. The `promptUI` attribute refers to a child element of `<amp-consent>` by its `id`.

_Example_: Displays a prompt user interface

```html
<amp-consent layout="nodisplay" id="consent-element">
  <script type="application/json">
    {
      "consentInstanceId": "my-consent",
      "checkConsentHref": "https://foo.com/api/show-consent",
      "promptUI": "consent-ui"
    }
  </script>
  <div id="consent-ui">
    <button on="tap:consent-element.accept">Accept</button>
    <button on="tap:consent-element.reject">Reject</button>
    <button on="tap:consent-element.dismiss">Dismiss</button>
  </div>
</amp-consent>
```

AMP displays prompt UI on page load or by user interaction. The prompt UI is hidden based on the three user actions described below.

AMP also supports external consent UI flow via `promptUiSrc` which will load your custom iframe. More information about the communication of user actions can be found [here](./integrating-consent.md#Informing-Consent-response).

#### Prompt UI for Stories

The `amp-story` extension provides a [default prompt UI](https://user-images.githubusercontent.com/1492044/40135514-8ab56d10-5913-11e8-95a2-72ac01ff31e0.png), that requires using a `<amp-story-consent>` component as the prompt UI. This component content requires a `title`, a `message`, and a list of `vendors`, and has to be specified in its own component configuration.
The decline button can be hidden by adding an optional `onlyAccept` boolean parameter.
Additionally, an optional templated external link to the privacy policy or settings can be configured, by adding `"externalLink": {"title": "Privacy Settings", "href": "https://example.com"}` to the consent configuration.

_Example_: Displays a prompt user interface on an AMP Story

```html
<amp-consent layout="nodisplay" id="consent-element">
  <script type="application/json">
    {
      "checkConsentHref": "https://foo.com/api/show-consent",
      "promptUI": "consent-ui"
    }
  </script>
  <amp-story-consent id="consent-ui" layout="nodisplay">
    <script type="application/json">
      {
        "title": "My title",
        "message": "My example message.",
        "vendors": ["Item 1", "Item 2", "Item 3", "Item 4"]
      }
    </script>
  </amp-story-consent>
</amp-consent>
```

#### Prompt Actions

Three user actions apply to both granular and global consent: `accept`, `reject` and `dismiss`.

To enable the user to choose a consent state and hide the prompt UI, add an `on` attribute to a button with the
following value scheme `on="event:idOfAmpConsentElement.accept/reject/dismiss"`

-   `accept`: publisher instructs AMP to remember the accept decision to the consent, unblocks components waiting for the consent, and hides the prompt UI.

-   `reject`: publisher instructs AMP to remember the reject decision to the consent, cancels `buildCallback` (AMP lifecycle callback to [build AMP components](https://github.com/ampproject/amphtml/blob/main/docs/building-an-amp-extension.md#buildcallback)) of components waiting for the consent, and hides the prompt UI.

-   `dismiss`: instruct AMP to cancel `buildCallback` of components waiting for the consent, and hides the prompt UI.

The `setPurpose` action is used in [granular consent](#granular-and-global-consent). You can use it to temporarily store the user's choice for an individual consent purpose. This action takes the form `setPurpose({purpose name}={boolean value})`. Setting a purpose to `true` marks it as accepted; setting it to `false` marks it as rejected.

For example, to mark a consent purpose called `performanceCookies` as `true`, you would use

```js
myConsent.setPurpose(performanceCookies=true)
```

The `accept` and `reject` actions, which accept or deny global consent, both save granular consent choices as well. If you pass either of these the argument `(purposeConsentDefault={boolean value})`, any consent purposes for which the user has not made a choice will be assigned that boolean value.

For example, the action

```js
myConsent.accept(purposeConsentDefault=false)
```

will reject any consent purposes for which the user has not made a choice.

If you don't use `purposeConsentDefault`, any purposes for which the user has not made a choice will remain unset. For this reason, especially when the prompt UI is a form with checkboxes, it's generally recommended that you include this argument.

### Post-prompt UI (optional)

You can provide a UI after collecting the initial consent. For example, you can provide a UI for the user to manage their consent (e.g., change their "reject" to "accept"). The post-prompt UI is defined with the `<amp-consent>` JSON configuration object. The `postPromptUI` refers to an element by id. If the element is a child element of the `<amp-consent>`, it will be fixed to the bottom of the page same as prompt UIs. You can also inline the `postPromptUI` in the document, but please be aware of the potential layout shift caused by toggling the display of this element.

When defined, the post-prompt UI is shown when all prompt UIs have been hidden, or initially on page load if no prompt UI was triggered.

```html
<amp-consent layout="nodisplay" id="consent-element">
  <script type="application/json">
    {
      "consentInstanceId": "consent-foo",
      "promptUI": "consent-ui",
      "postPromptUI": "post-consent-ui"
    }
  </script>
  <div id="consent-ui">
    ...
  </div>
  <div id="post-consent-ui">
    <button on="tap:consent-element.dismiss">Settings</button>
  </div>
</amp-consent>
```

#### Post-prompt action

The post-prompt UI provides one user action type that can be used to allow the user to manage a previously set consent. Use `prompt` to display a prompt for a given consent instance. Add an `on` attribute to a button with the following value scheme `on="event:idOfAmpConsentElement.prompt"`.

## Blocking behaviors

The `<amp-consent>` element can be used to block any other AMP components on the page from loading (except `<amp-consent>` itself).

### Client caching

The consent information (from the response or from user action on client side) will be cached on client side in localStorage. The cached value if exist will always be used by `<amp-consent>` to unblock content for performance optimization. Server endpoint can instruct `<amp-consent>` to erase the stored value so that it won't be used to unblock content the next visit using the `expireCache: true`.

A couple of implications with this behavior:

-   When stored user consent no longer applies, the change will be synced through `checkConsentHref` response. But the change will be applied one-time off due to the client cache.
-   When a user travels, `<amp-consent>` will use the stored consent. It's up to the `checkConsentHref` response to erase stored value using `expireCache: true` and `consentRequired: false`.
-   If a promptUI is used to collect user consent. Using `expireCache: true` will prompt consent dialog and block users from content on their following visits.

`<amp-consent>` stores consent choices in a key called `amp-store:{xxx}`, where `{xxx}` is your domain. The value is base64-encoded JSON.

### Basic blocking behaviors

In global consent, to block components, either add the `data-block-on-consent` attribute to the AMP component or add the `amp-consent-blocking` meta tag with the list of extensions to be blocked. Note, that if you're using the `type` attribute for CMP integration, you must also include the `amp-consent-blocking` meta tag. This ensures that `buildCallback` of the component isn't called until consent has been accepted, or if consent is not required for the user based on the `consentRequired` value. In effect, this means that all behaviors of the element (e.g. sending analytics pings for `<amp-analytics>` or the loading of an `<amp-ad>`) are delayed until the relevant consent instance is accepted.

Individual components may override this behavior to provide more specialized handling. Please refer to each component's documentation for details.

_Example: Blocking the analytics until user accepts consent_

```html
<amp-analytics data-block-on-consent type="googleanalytics"> </amp-analytics>
```

or

```html
<meta name="amp-consent-blocking" content="amp-analytics,amp-ad" />
```

For granular consent, use the `data-block-on-consent-purposes` attribute with a comma-separated list of consent purposes. For example, the following will block an `amp-pixel` component until the user accepts purposes named `performance` and `marketing`:

```html
<amp-pixel data-block-on-consent-purposes="performance, marketing"></amp-pixel>
```

### Advanced predefined consent blocking behaviors

AMP provides a list of pre-defined [consent policy instances](#policy-instance-optional) for publishers to easily define consent blocking behaviors to individual components.

Set the value to the `data-block-on-consent` attribute to use the pre-defined consent blocking behavior policy.

_Example: Blocking the analytics until user respond to consent_

```html
<amp-analytics data-block-on-consent="_till_responded" type="googleanalytics">
</amp-analytics>
```

AMP may support more advanced pre-defined blocking behaviors in the future. Because of this, the value of `data-block-on-consent` is reserved only for the following supported pre-defined attributes:

-   `_till_responded` : Unblock the component until the user has responded to the consent prompt, or the consent prompt has been skipped.
-   `_till_accepted` : [Default basic blocking behavior](#basic-blocking-behaviors), expect that when `_till_accepted` is explicitly added, individual components cannot override the blocking behavior.
-   `_auto_reject` : Always reject the consent automatically if consent is required but unknown. The reject consent decision will not be stored. It is recommended not to specify a consent prompt UI when auto rejecting consent for every components.

When one of the pre-defined attributes is used, AMP assumes that the publisher takes final control on the consent blocking behaviors. Individual components cannot override the blocking behaviors brought by pre-defined consent policy, they can however still customize components' behaviors after having been unblocked.

### Customize Consent Blocking Behaviors

An optional `policy` property can be added to the `<amp-consent>` element's JSON configuration object. Its value is an object that customizes consent blocking behaviors.

```html
<amp-consent layout="nodisplay" id="consent-element">
  <script type="application/json">
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

The `default` policy is the only one allowed to be configured. This policy applies to every element that is blocked by the `data-block-on-consent` attribute.

### Policy Instance (optional)

#### waitFor

`waitFor` object specifies the consent instance that needs to wait. Each consent instance requires an array value. AMP may support sub item lists under an consent instance, but right now only empty array is expected, and the value will be ignored.

#### timeout (optional)

`timeout` can be used to inform components the current consent state status after specified time.

When used as a single value, `timeout` equals the timeout value in second.

```html
"default": { "waitFor": { "my-consent": [] }, "timeout": 2 }
```

When used as an object. `timeout` object supports two attributes

-   `seconds`: timeout value in second
-   `fallbackAction` (optional): the fallback action at timeout if no user action is taken and no state has been stored. The fallback actions supported are `reject` and `dismiss`. Default action is `dismiss` if not configured. Note the consent state changed due to fallback action at timeout will not be stored on client side.

```html
"default": { "waitFor": { "my-consent": [] }, "timeout": { "seconds": 2,
"fallbackAction": "reject" } }
```

## Integrations and availability

The table below lists the vendors and components that are integrated with amp-consent

| Integration                       | Prod Availability | Documentation                                                                                        | Ready For Testing |
| --------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------- | ----------------- |
| DoubleClick & AdSense Integration | 05/10/18          | [Link](https://support.google.com/dfp_premium/answer/7678538)                                        | Yes               |
| AMP IMA Video Integration         | 05/15/18          | [Link](https://github.com/ampproject/amphtml/blob/main/extensions/amp-ima-video/consent-blocking.md) | Yes               |
| AMP Geo                           | 05/10/18          | [Link](https://amp.dev/documentation/examples/user-consent/geolocation-based_consent_flow/)          | Yes               |
| AMP Stories                       | 05/15/18          | [Link](#prompt-ui-for-stories)                                                                       | Yes               |

## FAQs

##### Will AMP change any behavior by default on May 25th?

No. All desired behavior on AMP pages is managed by publishers and this is no different.

##### How can I stop making ad and analytics calls on all my AMP pages?

Use the [`data-block-on-consent`](#blocking-behaviors) attribute on the [`<amp-ad>`](https://amp.dev/documentation/components/amp-ad) or [`<amp-analytics>`](https://amp.dev/documentation/components/amp-analytics) component.

Example:

```html
<amp-ad
  data-block-on-consent
  width="320"
  height="50"
  type="doubleclick"
  data-slot="/4119129/mobile_ad_banner"
>
</amp-ad>
```

**Note**: For some vendors, the `data-block-on-consent` attribute only works in conjunction with `<amp-consent>`. Consult with your ad or analytics vendor for implementation details.

##### How can I gather consent from all users on AMP pages?

Use the `<amp-consent>` component which allows configuring a custom UI with `Accept`, `Reject` and `Dismiss` states. It is up to each amp-component vendor how they interpret these states, so please read your vendor's documentation carefully.

##### How can I stop showing all of my content to users from the EEA?

You could consider hiding all your content for EEA users by implementing [`<amp-geo>`](https://amp.dev/documentation/components/amp-geo). See [this blog post](https://www.ampproject.org/latest/blog/dynamic-geo-personalization/) for more details.

##### How can I target consent for only EEA users?

Use [`<amp-geo>`](https://amp.dev/documentation/components/amp-geo) to configure a country group and hook up the country group to `geoOverride` attribute in `<amp-consent>`. If the user accesses the AMP page from a country that's configured in the list, the appropriate consent UI will be invoked.

##### Can I make the consent UI blocking?

Yes. The UI is not prescriptive. If you do end up providing a non-blocking version of the UI, dismissing the UI will lead to a `dismiss` state. It is up to each vendor (ads & analytics) how they would process `accept`, `reject` and `dismiss`.

##### What is `checkConsentHref`? And is it mandatory?

Note that [`checkConsentHref`](#checkconsenthref) is not mandatory if you collect consent and store consent completely at client side.

`checkConsentHref` gives you, the publisher, the ability to know if a consent must be shown to the user. For example, by using this call, you may determine the user's geo-location on the server-side, allowing you to suppress the consent. You can also instead use `<amp-geo>` and `geoOverride` to achieve the same result without any server-side setup.

You may also choose to suppress the consent if you detect that the user doesn't need consent because they accepted consent on a different property or for alternate reasons.

##### What is `consentRequired`?

[`consentRequired`](#consentRequired) is used to determine if consent is required for the user. It can be specified in the config of `<amp-consent>` for different geo regions, it can also be retrieved from the `checkConsentHref` endpoint.

##### I also manage consent on non-AMP pages, how can I reconcile the two?

You can configure `checkConsentHref` to call your own server-side endpoint to detect consent state for the user and reconcile how you want AMP to behave with using a response from the [`checkConsentHref`](#checkConsentHref).

##### How can I send additional information to an ad network/analytics provider?

The response on `checkConsentHref` also accepts values for the key [`sharedData`](#response) on the response which will be made available to all vendor components being blocked by the consent logic. It is up to the vendor how they process this sharedData. DoubleClick/AdSense expect specific key-values, refer to their [documentation](https://support.google.com/dfp_premium/answer/7678538#amp-pages) for details.

##### I have a complicated consent UI, will it work?

You should try out the [advanced consent flows](https://amp.dev/documentation/examples/user-consent/advanced_user_consent_flow/) to see how it's implemented. You could also consider using the [`<amp-selector>`](https://amp.dev/documentation/components/amp-selector) component.

##### How can I show a persistent UX element for users to update their consent preferences?

You can use the optional [post-prompt UI](<#post-prompt-ui-(optional)>) to accomplish this. View this [sample on AMP By Example](https://amp.dev/documentation/examples/user-consent/client_side_user_consent_flow/) for a similar implementation.

##### Can I keep the non-EU experience unchanged and just deliver an "opt-out" experience to all EU users?

You can configure `<amp-consent>` and [`<amp-geo>`](https://amp.dev/documentation/components/amp-geo) to show consent to users in specific countries (e.g., via a list of EEA countries that you configure). The `<amp-consent>` component can also be configured to automatically "reject" consent on behalf of the user, if the publisher so desires. The way to do this is by setting the [`timeout`](#timeout-optional) seconds to `0` and `fallbackAction` to `reject`. Note that the `fallbackAction` state won't be stored across sessions. Note also that each ad network will have its own implementation for how it interprets a "reject" action from a user. There is no way to automatically 'accept' consent on behalf of the user.

You can [learn more](https://support.google.com/dfp_premium/answer/7678538) about how Google AdSense and DoubleClick plan to handle a 'reject', and any configuration available to serve non-personalized ads.

##### Can the consent be set via amp-geo, either directly or through amp-bind? If not, can it be set in the response from checkConsentHref?

You can use the response of `checkConsentHref` to show a consent to the user if there is no previous consent state, which allows the user to go through the consent flow. For details on how to reject consent by default, see the opt-out question above. It isn't possible to "accept" consent by default.

##### Is "checkConsentHref" called on every page view or during every user action?

`checkConsentHref` is called on every page view before the consent UI is displayed to the user.

##### Can amp-geo work with amp-consent so that it only shows consent for a user that's accessing my content from a certain country?

Yes. See example [here](https://amp.dev/documentation/examples/user-consent/geolocation-based_consent_flow/).

##### Does AMP support the IAB TCF?

AMP supports popular transparency consent frameworks including the IAB TCF v1, TCF v2, TCF v2.2 and the IAB US Privacy String.
Please check with your consent management platform (CMP) and ad networks on their AMP support. AMP will read and pass the strings passed by the frameworks (IAB TCF v1, TCF v2, TCF v2.2 and the IAB US Privacy String) when received by CMPs/ad networks.

##### I have a CMP implemented with AMP but for TCF v2 what do I need to do to support TCF v2.2?

For AMP integration, the only thing you need to do is provide the value of `tcfPolicyVersion` during the client-side `postMessage`, and in case you also use `checkConsentHref` you need to provide it in the response, and you can also update it directly from the response too via the `tcfPolicyVersion` field in the response from your server, this will allow you to update consents in case you have not added the tcfPolicyVersion field before the transaction to TCF v2.2.

##### I can't see feature X being supported, what can I do?

Join in on the discussion where we are discussing [upcoming potential features](https://github.com/ampproject/amphtml/issues/13716#issuecomment-382474345). Please chime in on the thread if something isn't supported yet.

## Related resources

-   Blog post: [New functionality to help manage user choice in AMP pages](https://www.ampproject.org/latest/blog/new-functionality-to-help-manage-user-choice-in-amp-pages/)
-   Blog post: [Dynamic geo-personalization](https://www.ampproject.org/latest/blog/dynamic-geo-personalization/)
-   [`<amp-geo>` documentation](https://amp.dev/documentation/components/amp-geo)
-   [DoubleClick/ AdSense documentation ](https://support.google.com/dfp_premium/answer/7678538#amp-pages)
-   [New feature discussion for amp-consent](https://github.com/ampproject/amphtml/issues/13716#issuecomment-382474345)

## Supported Consent Management Platforms

<!-- markdown-link-check-disable -->

-   AppConsent : [Website](https://sfbx.io/en/produits/) - [Documentation](./cmps/appconsent.md)
-   ConsentManager : [Website](https://www.consentmanager.net/) - [Documentation](https://help.consentmanager.net/books/cmp/page/using-the-cmp-with-amp-websites)
-   Didomi : [Website](https://www.didomi.io/) - [Documentation](https://developers.didomi.io/cmp/amp)
-   Funding Choices : [Website](https://fundingchoices.google.com/start) - [Documentation](./cmps/googlefc.md)
-   iubenda : [Website](https://www.iubenda.com/) - [Documentation](./cmps/iubenda.md)
-   LiveRamp : [Website](https://liveramp.com/our-platform/preference-consent-management/) - [Documentation](./cmps/liveramp.md)
-   Marfeel : [Website](https://www.marfeel.com/) - [Documentation](./cmps/marfeel.md)
-   Ogury : [Website](https://www.ogury.com/) - [Documentation](./cmps/ogury.md)
-   OneTrust: [Website](https://www.onetrust.com/) - [Documentation](./cmps/onetrust.md)
-   opencmp : [Documentation](./cmps/opencmp.md)
-   Pubtech : [Website](https://www.pubtech.ai/) - [Documentation](./cmps/pubtech.md)
-   Quantcast : [Website](https://www.quantcast.com) - [Documentation](https://help.quantcast.com/hc/en-us/categories/360002940873-Quantcast-Choice)
-   Sirdata : [Website](http://www.sirdata.com/) - [Documentation](https://cmp.sirdata.com/#/docs)
-   SourcePoint : [Website](https://www.sourcepoint.com/) - [Documentation](./cmps/sourcepoint.md)
-   UniConsent : [Website](http://www.uniconsent.com/) - [Documentation](./cmps/uniconsent.md)
-   Usercentrics : [Website](https://www.usercentrics.com/) - [Documentation](./cmps/usercentrics.md)

-   Your Integrated platform here!
