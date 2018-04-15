# Customizing your AMP extensions behaviors based on user control

`<amp-consent>` can be used to block AMP extensions' `buildCallback` until the user opts in. Which means that the`buildCallback` will only be called after  the consent has been accepted, or if the consent prompt has been skipped by the `checkConsentHref` response when consent is unknown.

AMP allows vendors to customize their extensions’ behaviors.

## Customizing default consent blocking behaviors

`baseElement.getConsentPolicy()` can be used to inform AMP runtime to change default consent blocking behaviors.

For example: If the vendor believes that an AMP extension doesn't need to be blocked on user control, overwrite the method with

```
getConsentPolicy() {
  return null;
}
```

Or if the vendor believes that an AMP extension should always be blocked on user control with the presence of `<amp-consent>`, overwrite the method with

```
getConsentPolicy() {
  return 'default';
}
```
Note: Only 'default' consent policy is supported currently.

## Advanced blocking behaviors

If the vendor wants to customize an AMP extension behaviors based on user control. There is the `getConsentPolicyState` API.

`getConsentPolicyState` returns a promise with one of the following values
* `null` : no `<amp-consent>` is included
* `CONSENT_POLICY_STATE.UNKNOWN` : The consent state is unknown
* `CONSENT_POLICY_STATE.SUFFICIENT` : The consent is accepted
* `CONSENT_POLICY_STATE.INSUFFICIENT` : The consent is rejected
* `CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED` : The consent state is unknown, and `<amp-consent>` is informed to not prompt UI.
