# Customizing your AMP extensions behaviors based on user control

You can use the `<amp-consent>` component to block AMP extensions' `buildCallback` until the user opts in. This means that `buildCallback` is only called after the consent has been accepted, or if the consent prompt has been skipped by the `checkConsentHref` response, when consent is unknown.

AMP allows vendors to customize their extensions’ behaviors.

## Customizing default consent blocking behaviors

`baseElement.getConsentPolicy()` can be used to inform the AMP runtime to change default consent blocking behaviors.

For example: If the vendor believes that an AMP extension doesn't need to be blocked on user control, overwrite the method with:

```js
getConsentPolicy() {
  return null;
}
```

Or if the vendor believes that an AMP extension should always be blocked on user control with the presence of `<amp-consent>`, overwrite the method with:

```js
getConsentPolicy() {
  return 'default';
}
```

**Note**: Currently, only the 'default' consent policy is supported.

## Advanced blocking behaviors

### On Consent State

AMP provides the consent state information for vendors to customize their behavior based on user control.

The state has the following valid values.

- `null` : no `<amp-consent>` is included
- `CONSENT_POLICY_STATE.UNKNOWN` : The consent state is unknown
- `CONSENT_POLICY_STATE.SUFFICIENT` : The consent is accepted
- `CONSENT_POLICY_STATE.INSUFFICIENT` : The consent is rejected
- `CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED` : The consent state is unknown, and `<amp-consent>` is informed to not prompt UI.

#### If you integrate with AMP as a first party AMP extension

Use the `getConsentPolicyState` API. It returns a promise with one of the `CONSENT_POLICY_STATE` value.

#### If you integrate with AMP as a third party ad vendor

Access the value within the ad iframe using `window.context.initialConsentState`. Check [this](https://github.com/ampproject/amphtml/blob/master/ads/README.md#amp-consent-integration) for more details.

#### If you integrate with AMP as an analytics vendor

Get the value using `CONSENT_STATE` macro, or `${consentState}`. A request with the varaible will only be sent out after the state has resolved to one of the above state.

### On Consent String

AMP collects raw consent string value from `checkConsentHref` endpoint or from the CMP. The it passes the raw consent string to vendors without modification.
It is then up to the vendor to intepret the string and customize behavior accordingly. AMP recommends handling the string on the server side.

AMP will always pass the local stored consent string if there's one. Update to the string will only be reflected the next page load.

#### If you integrate with AMP as a first party AMP extension

Use the `getConsentPolicyInfo` API. `getConsentPolicyInfo` returns a promise with the raw consent string value.

Ways to get the consent string for ad/analytics vendors coming soon.

### On Related Information

In addition to the consent state and consent string, AMP extensions can also use the
`getConsentPolicySharedData` API to receive additional consent related information about
the user from the page owner. See [this](https://github.com/ampproject/amphtml/blob/master/extensions/amp-consent/amp-consent.md#response) for details about the `shareData`.

### On Consent Metadata

In addition to the consent state and consent string, AMP extensions can also use the `getConsentMetadata` to receive additional consent metadata information AMP receives from `checkConsentHref` or the CMP.

Similar to the consent string, AMP will always pass the local stored consent metadata object if there's one. Update will only be reflected on the next page load. Below is an example `consentMetadata` object and its supported fields.

```
{
  "consentStringType": {enum} [CONSENT_STRING_TYPE.TCF_V1, CONSENT_STRING_TYPE.TCF_V2, CONSENT_STRING_TYPE.US_PRIVACY_STRING] (optional),
  "gdprApplies": {boolean} (optional),
  "additionalConsent": {string} (optional)
}
```
