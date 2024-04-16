# AMP Consent integration

The `<amp-consent>` element can be used to block the ad request and any [RTC](./doubleclick-rtc.md) requests from being sent until the user or AMP consent [checkConsentHref](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/amp-consent.md#consent-configuration) end point provide consent state. After the amp-consent extension has been configured (please refer to its [documentation](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/amp-consent.md)), it can be linked to the amp-ad element via the `data-block-on-consent` attribute.

If the user has responded negatively to the amp-consent component (user rejects the consent prompt), RTC call-outs will not be made and [non-personalized ads](https://support.google.com/dfp_premium/answer/9005435) will be requested.  
If the user’s response to the amp-consent is unknown (user dismisses the consent prompt), by default, no ad requests or RTC call-outs are sent.  
If `data-npa-on-unknown-consent` is set to true, non-personalized ads will be requested but RTC call-outs are not sent.

See [Google Ad Manager Help Center article](https://support.google.com/dfp_premium/answer/7678538) and [restricted Data Processing article](https://support.google.com/admanager/answer/9004919) for more information.

## Supported `sharedData` key-values

The `amp-consent` response may set the following fields in the `sharedData` object for additional controls:

<table>
  <tr>
    <td><strong>Key</strong></td>
    <td><strong>Description</strong></td>
    <td><strong>Possible Values</strong></td>
  </tr>
  <tr>
    <td><code>"doubleclick-tfua"</code></td>
    <td>Whether the slot should be treated as under-age of consent.</td>
    <td><code>0</code> or <code>1</code></td>
  </tr>
  <tr>
    <td><code>"doubleclick-tfcd"</code></td>
    <td>Whether the slot should be treated as child-directed.</td>
    <td><code>0</code> or <code>1</code></td>
  </tr>
</table>
