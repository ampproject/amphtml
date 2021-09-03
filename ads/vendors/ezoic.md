# Ezoic

## Example

```html
<amp-ad
  width="300"
  height="250"
  type="ezoic"
  data-slot="slot-name"
  data-json='{"targeting":{"compid":0}, "extras":{"adsense_text_color":"000000"}'
>
</amp-ad>
```

## Ad size

The ad size is the size of the ad that should be displayed. Make sure the `width` and `height` attributes of the `amp-ad` tag match the available ad size.

## Configuration

To generate tags, please visit https://svc.ezoic.com/publisher.php?login

Supported parameters:

-   `data-slot`: the slot name corresponding to the ad position

Supported via `json` attribute:

-   `targeting`
-   `extras`

## Consent Support

Ezoic amp-ad adhere to a user's consent in the following ways:

-   `CONSENT_POLICY_STATE.SUFFICIENT`: Ezoic amp-ad will display a personalized ad to the user.
-   `CONSENT_POLICY_STATE.INSUFFICIENT`: Ezoic amp-ad will display a non-personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED`: Ezoic amp-ad will display a personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN`: Ezoic amp-ad will not display an ad.
