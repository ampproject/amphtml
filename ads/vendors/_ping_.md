# \_PING\_

A fake ad type that is only used for local development.

## Example

```html
<amp-ad
  width="300"
  height="250"
  type="_ping_"
  data-url="https://lh3.googleusercontent.com/pSECrJ82R7-AqeBCOEPGPM9iG9OEIQ_QXcbubWIOdkY=w400-h300-no-n"
  data-valid="true"
  data-enable-io="true"
>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the [ad network](#configuration) or refer to their [documentation](#ping).

### Required parameters

-   `data-url` : Image ad with the image.

### Optional parameters

-   `data-valid` : Set to false to return a no fill ad.
-   `data-ad-height` : Ad image size.
-   `data-ad-width` : Ad image width.
-   `data-enable-io` : Enable logging IntersectionObserver entry.

## User Consent Integration

When [user consent](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/amp-consent.md#blocking-behaviors) is required. \_Ping\_ ad approaches user consent in the following ways:

-   `CONSENT_POLICY_STATE.SUFFICIENT`: Serve a personalized ad to the user.
-   `CONSENT_POLICY_STATE.INSUFFICIENT`: Serve a non-personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED`: Serve a personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN`: Will not serve an ad to the user.
