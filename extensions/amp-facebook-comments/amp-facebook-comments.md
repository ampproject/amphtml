---
$category@: social
formats:
  - websites
teaser:
  text: Embeds the Facebook comments plugin.
---

# amp-facebook-comments

## Usage

Use the `amp-facebook-comments` component to embed the [Facebook comments plugin](https://developers.facebook.com/docs/plugins/comments).

```html
<amp-facebook-comments
  width="486"
  height="657"
  layout="responsive"
  data-numposts="5"
  data-href="http://www.directlyrics.com/adele-25-complete-album-lyrics-news.html"
>
</amp-facebook-comments>
```

## Attributes

### `data-href`

The URL of the comments page. For example,
`http://www.directlyrics.com/adele-25-complete-album-lyrics-news.html`.

### `data-locale` (optional)

By default, the locale is set to user's system language; however, you can
specify a locale as well.

For details on strings accepted here please visit the
[Facebook API Localization page](https://developers.facebook.com/docs/internationalization).

### `data-numposts` (optional)

The number of comments to show. Currently Facebook SDK limits this to max 100.
For details, see the
[Facebook comments documentation](https://developers.facebook.com/docs/plugins/comments).

### `data-order-by` (optional)

The order to use when displaying comments. For details, see the
[Facebook comments documentation](https://developers.facebook.com/docs/plugins/comments).

### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"Facebook comments"`.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

### Deprecated attributes

**`data-colorscheme` (optional)**

The color scheme. For details, see the <a href="https://developers.facebook.com/docs/plugins/comments">Facebook comments documentation</a>.<br><br><em>Note: This is no longer supported by Facebook. For more details, follow our <a href="https://github.com/ampproject/amphtml/issues/29980">our tracking issue</a> and <a href="https://developers.facebook.com/support/bugs/1759174414250782/">Facebook's bug report</a>.</em>

## Validation

See [amp-facebook-comments rules](validator-amp-facebook-comments.protoascii) in the AMP validator specification.
