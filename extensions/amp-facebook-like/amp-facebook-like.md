---
$category@: social
formats:
  - websites
teaser:
  text: Embeds the Facebook like button plugin.
---

# amp-facebook-like

## Usage

Use the `amp-facebook-like` component to embed the [Facebook like button plugin](https://developers.facebook.com/docs/plugins/like-button).

```html
<amp-facebook-like
  width="90"
  height="20"
  layout="fixed"
  data-layout="button_count"
  data-href="https://www.facebook.com/testesmegadivertidos/"
>
</amp-facebook-like>
```

## Attributes

### `data-href`

The absolute URL of the page that will be liked. For example,
`https://www.facebook.com/testesmegadivertidos/`.

### `data-locale` (optional)

By default, the locale is set to user's system language; however, you can
specify a locale as well.

For details on strings accepted here please visit the
[Facebook API Localization page](https://developers.facebook.com/docs/internationalization).

### `data-action` (optional)

The verb to display on the button. Can be either `like` or `recommend`. The
default is `like`.

### `data-colorscheme` (optional)

The color scheme used by the plugin for any text outside of the button itself.
Can be `light` or `dark`. The default is `light`.

### `data-kd_site` (optional)

This attribute is also known as `data-kid_directed_site` in the Facebook SDK.
If your web site or online service, or a portion of your service, is directed to
children under 13 you must enable this attribute. The default is `false`.

### `data-layout` (optional)

Selects one of the different layouts that are available for the plugin. Can be
one of `standard`, `button_count`, `button` or `box_count`. The default is
`standard`.

### `data-ref` (optional)

A label for tracking referrals which must be less than 50 characters and can
contain alphanumeric characters and some punctuation.

### `data-share` (optional)

Specifies whether to include a share button beside the Like button. This only
works with the XFBML version. The default is `false`.

### `data-show_faces` (optional)

Specifies whether to display profile photos below the button (standard layout
only). You must not enable this on child-directed sites. The default is `false`.

### `data-size` (optional)

The size of the button, which can be one of two sizes, `large` or `small`. The
default is `small`.

For details, see the
[Facebook comments documentation](https://developers.facebook.com/docs/plugins/like-button#settings).

### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"Facebook like button"`.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Validation

See [amp-facebook-like rules](validator-amp-facebook-like.protoascii) in the AMP validator specification.
