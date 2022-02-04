# Invibes

## Example

```html
<amp-ad
  width="300"
  height="300"
  type="invibes"
  data-pid="placement1"
  data-ad-categ="infeed"
  data-custom-endpoint="https://k.r66net.com/GetAmpLink"
>
</amp-ad>
```

## Configuration

For configuration semantics, please contact [Invibes](https://www.invibes.com/#section-contact-email)

Supported parameters:

-   `data-pid`
-   `data-ad-categ`
-   `data-custom-endpoint`

## User Consent Integration

Invibes ad approaches user consent as follows:

-   `CONSENT_POLICY_STATE.UNKNOWN`: Serve a non-personalized ad to the user.
-   `CONSENT_POLICY_STATE.INSUFFICIENT`: Serve a non-personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED`: Serve a non-personalized ad to the user.
-   `CONSENT_POLICY_STATE.SUFFICIENT`: Serve a personalized ad to the user.
