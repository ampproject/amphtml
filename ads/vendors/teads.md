# Teads

## Example

```html
<amp-ad
  width="300"
  height="1"
  type="teads"
  data-pid="42266"
  layout="responsive"
>
</amp-ad>
```

## Configuration

For configuration semantics, please contact [Teads](http://teads.tv/fr/contact/).

Supported parameters:

-   `data-pid`

## User Consent Integration

When [user consent](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/amp-consent.md#blocking-behaviors) is required, Teads ad approaches user consent in the following ways:

-   `CONSENT_POLICY_STATE.SUFFICIENT`: Serve a personalized ad to the user.
-   `CONSENT_POLICY_STATE.INSUFFICIENT`: Serve a non-personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED`: Serve a personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN`: Serve a non-personalized ad to the user..
