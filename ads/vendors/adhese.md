# Adhese

Serves ads from [Adhese](https://www.adhese.com).

## Example

### Basic setup

```html
<amp-ad
  width="300"
  height="250"
  type="adhese"
  data-location="_sdk_amp_"
  data-position=""
  data-format="amprectangle"
  data-account="demo"
  data-request-type="ad"
>
</amp-ad>
```

### With additional parameters

```html
<amp-ad
  width="300"
  height="250"
  type="adhese"
  data-location="_sdk_amp_"
  data-position=""
  data-format="amprectangle"
  data-account="demo"
  data-request-type="ad"
  json='{"targeting":{"br": ["sport", "info"],"dt": ["desktop"]}}'
>
</amp-ad>
```

## Configuration

For details on the configuration semantics, see the [Adhese website](https://www.adhese.com) or contact Adhese support.

### Required parameters

-   `data-account`
-   `data-request_type`
-   `data-location`
-   `data-position`
-   `data-format`

### Optional parameter

The following optional parameter is supported via the 'json' attribute:

-   `targeting`

## User Consent Integration

Adhese consent is linked to the window.context.consentSharedData object:

-   consentStateValue which contains the consent state
-   consentString which contains the IAB consent string

If the consentStateValue is set to 'accepted', our consent parameter is set to 'all'.
When avaiable, the consentString will always be send to the adserver.
