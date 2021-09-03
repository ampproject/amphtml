# Marfeel

## Example

```html
<amp-ad width="300" height="250" type="marfeel" data-tenant="demo.marfeel.com">
</amp-ad>
```

## Configuration

For additional details and support, please contact [Marfeel](https://marfeel.com).

### Required parameters

-   `data-tenant`

### Optional parameters

-   `data-multisize`
-   `data-version`

## Consent Support

When [user consent](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/amp-consent.md#blocking-behaviors) is required, Marfeel ad approaches user consent in the following ways:

-   `CONSENT_POLICY_STATE.SUFFICIENT`: Marfeel amp-ad will display a personalized ad to the user.
-   `CONSENT_POLICY_STATE.INSUFFICIENT`: Marfeel amp-ad will display a non-personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED`: Marfeel amp-ad will display a personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN`: Marfeel amp-ad will display a non-personalized ad to the user.
