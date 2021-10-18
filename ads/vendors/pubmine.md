# Pubmine

## Example

### Basic

```html
<amp-ad width="300" height="265" type="pubmine" data-siteid="37790885">
</amp-ad>
```

### With all attributes

```html
<amp-ad
  width="300"
  height="265"
  type="pubmine"
  data-section="1"
  data-pt="1"
  data-ht="1"
  data-siteid="37790885"
  data-blogid="428"
>
</amp-ad>
```

## Configuration

For further configuration information, please [contact Pubmine](https://wordpress.com/help/contact).

Please note that the height parameter should be 15 greater than your ad size to ensure there is enough room for the "Report this ad" link.

### Required parameters

-   `data-siteid`: Pubmine publisher site number.

### Optional parameters

-   `data-section`: Pubmine slot identifier
-   `data-pt`: Enum value for page type
-   `data-ht`: Enum value for hosting type
-   `data-npa-on-unknown-consent`: Flag for allowing/prohibiting non-personalized-ads on unknown consent.
-   `data-blogid`: Pubmine publisher blog number.

## Consent Support

Pubmine's amp-ad adheres to a user's consent in the following ways:

-   No `data-block-on-consent` attribute: Pubmine amp-ad will display a personalized ad to the user.
-   `CONSENT_POLICY_STATE.SUFFICIENT`: Pubmine amp-ad will display a personalized ad to the user.
-   `CONSENT_POLICY_STATE.INSUFFICIENT`: Pubmine amp-ad will display a non-personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED`: Pubmine amp-ad will display a personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN`: Pubmine amp-ad will display a non-personalized ad to the user.
-   `CONSENT_POLICY_STATE.UNKNOWN` and `data-npa-on-unknown-consent=false`: Pubmine amp-ad will display a personalized ad to the user.
