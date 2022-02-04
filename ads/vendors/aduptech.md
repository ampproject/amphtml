# AdUp Technology

Please visit [www.adup-tech.com](http://www.adup-tech.com) for more information and sign up as publisher to create your placement.

## Examples

### Fixed size

Uses fixed size by the given `width` and `height`.

```html
<amp-ad
  type="aduptech"
  layout="fixed"
  width="500"
  height="200"
  data-placementkey="ae7906d535ce47fbb29fc5f45ef910b4"
  data-query="reisen;mallorca;spanien"
  data-adtest="1"
>
</amp-ad>
```

### Filled size

Uses available space of parent html container.

```html
<style amp-custom>
  #aduptech-container {
    width: 350px;
    height: 300px;
    position: relative;
  }
</style>
<div id="aduptech-container">
  <amp-ad
    type="aduptech"
    layout="fill"
    data-placementkey="ae7906d535ce47fbb29fc5f45ef910b4"
    data-query="reisen;mallorca;spanien"
    data-adtest="1"
  >
  </amp-ad>
</div>
```

### Fixed height

Uses available width and the given `height`.

```html
<amp-ad
  type="aduptech"
  layout="fixed-height"
  height="100"
  data-placementkey="ae7906d535ce47fbb29fc5f45ef910b4"
  data-query="reisen;mallorca;spanien"
  data-adtest="1"
>
</amp-ad>
```

### Responsive

Uses available space but respecting aspect ratio by given `width` and `height` (for example 10:3).

```html
<amp-ad
  type="aduptech"
  layout="responsive"
  width="10"
  height="3"
  data-placementkey="ae7906d535ce47fbb29fc5f45ef910b4"
  data-query="reisen;mallorca;spanien"
  data-adtest="1"
>
</amp-ad>
```

## Configuration

| Attribute           | Optional | Description                                                                                   |
| ------------------- | :------: | --------------------------------------------------------------------------------------------- |
| `data-placementkey` |          | The unique placement key                                                                      |
| `data-mincpc`       |    X     | The mininum price per click in €                                                              |
| `data-query`        |    X     | Additional query keywords separated by semicolon                                              |
| `data-pageurl`      |    X     | The page url (if different from current url)                                                  |
| `data-gdpr`         |    X     | `1` = GDPR applies / `0` = GDPR does not apply / omit = unknown wether GDPR applies (default) |
| `data-gdpr_consent` |    X     | The base64url-encoded IAB consent string                                                      |
| `data-adtest`       |    X     | `1` = testing mode enabled / `0` = testing mode disabled (default)                            |

## User Consent Integration

If avaiable, the following consent data will always be send to our adserver:

-   `window.context.consentSharedData.consentString` as IAB consent string

Otherwise following (optional) tag attributes will be send to our adserver:

-   `data-gdpr` as "GDPR applies" state
-   `data-gdpr_consent` as IAB consent string

If none of above values are given, we try to fetch users consent data via TCF API (if avaiable).
