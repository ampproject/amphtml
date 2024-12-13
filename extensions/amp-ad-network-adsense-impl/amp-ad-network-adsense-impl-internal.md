### amp-ad-network-adsense-impl

AdSense implementation of AMP Ad tag which requests early by XHR and
renders natively within the page if a valid AMP Ad is returned. Should
not be directly referenced by pages and instead is dynamically loaded
via the amp-ad tag. However, in order to remove an async script load
of this library, publishers can include its script declaration.

<table>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>General Availability</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>TBD</td>
  </tr>
</table>

#### AMP Consent integration

The `<amp-consent>` element can be used to block the ad request until the user or AMP consent [checkConsentHref](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/amp-consent.md#consent-configuration) end point provide consent state. After the amp-consent extension has been configured (please refer to its [documentation](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/amp-consent.md)), it can be linked to the amp-ad element via the `data-block-on-consent` attribute.

If the user has responded negatively to the amp-consent component (user rejects the consent prompt), RTC call-outs will not be made and [non-personalized ads](https://support.google.com/dfp_premium/answer/9005435) will be requested.

If the user’s response to the amp-consent is unknown (user dismisses the consent prompt), by default, no ad requests are sent.  
If `data-npa-on-unknown-consent` is set to true, non-personalized ads will be requested.

The `amp-consent` response may set the following fields in the `sharedData` object for additional controls:

<table>
  <tr>
    <td><strong>Key</strong></td>
    <td><strong>Description</strong></td>
    <td><strong>Possible Values</strong></td>
  </tr>
  <tr>
    <td><code>"adsense-tfua"</code></td>
    <td>Whether the slot should be treated as under-age of consent.</td>
    <td><code>0</code> or <code>1</code></td>
  </tr>
  <tr>
    <td><code>"adsense-tfcd"</code></td>
    <td>Whether the slot should be treated as child-directed.</td>
    <td><code>0</code> or <code>1</code></td>
  </tr>
</table>

See [AdSense Help Center article](https://support.google.com/dfp_premium/answer/7678538) and [Restricted Data Processing article](https://support.google.com/adsense/answer/9009582?hl=en) for more information.

#### Examples

Example - AdSense Ad

```html
<amp-ad
  width="300"
  height="200"
  type="adsense"
  data-ad-client="ca-pub-8125901705757971"
  data-ad-slot="7783467241"
>
</amp-ad>
```

#### Attributes

##### always-serve-npa

`always-serve-npa` provides a way to utilize the `<amp-geo>` component to detect user's geo location to decide if a non-personalized ad should be requested from AdSense, regardless of the [user's consent decision](#AMP-Consent-integration). The value of `always-serve-npa` should be a comma delimited string of geo group codes which are defined in `<amp-geo>` (details [here](https://github.com/ampproject/amphtml/blob/main/extensions/amp-geo/amp-geo.md)). If no value is found or an empty string is provided, then a NPA will always be requested, regardless of the location.

```html
<amp-ad
  width="300"
  height="200"
  type="adsense"
  always-serve-npa="geoGroup1,geoGroup2"
  data-ad-client="ca-pub-8125901705757971"
  data-ad-slot="7783467241"
>
</amp-ad>

<amp-geo>
  <script type="application/json">
    {
      "ISOCountryGroups": {
        "geoGroup1": [ "preset-eea", "unknown" ],
        "geoGroup2": [ "preset-us-ca" ]
      }
    }
  </script>
</amp-geo>
```

TODO: Add attributes
