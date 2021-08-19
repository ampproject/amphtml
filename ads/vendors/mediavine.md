# Mediavine

## Example

```html
<amp-ad width="300" height="250" type="mediavine" data-site="amp-project">
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact [Mediavine](http://www.mediavine.com). Each site must be approved and signed up with [Mediavine](http://www.mediavine.com) prior to launch. The site name will be the same as name in the Mediavine script wrapper. The site name `amp-project` can be used for testing and will serve placeholder ads.

### Required parameters

-   `data-site` - The site's unique name this ad will be served on. This is the same name from your Mediavine script wrapper.

## User Consent Integration

When [user consent](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/amp-consent.md#blocking-behaviors) is required. Mediavine approaches user consent in the following ways:

-   `CONSENT_POLICY_STATE.SUFFICIENT`: Personalized Ads.
-   `CONSENT_POLICY_STATE.INSUFFICIENT`: Non-Personalized Ads.
-   `CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED`: Personalized Ads.
-   `CONSENT_POLICY_STATE.UNKNOWN`: Non-Personalized Ads.
