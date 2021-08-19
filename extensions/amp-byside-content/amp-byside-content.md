---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Displays dynamic content from the BySide service.
---

# amp-byside-content

## Usage

Displays dynamic content from the [BySide service](http://www.byside.com/).

The `amp-byside-content` component is available for BySide customers and
displays dynamic content that can be retrieved from the [BySide](http://www.byside.com/) customization mechanisms.

Example:

The `width` and `height` attributes determine the aspect ratio of the embedded BySide content in responsive layouts.

```html
<amp-byside-content
  data-webcare-id="D6604AE5D0"
  data-label="amp-responsive"
  data-webcare-zone="we2"
  data-lang="en"
  width="1024"
  height="500"
  layout="responsive"
>
</amp-byside-content>
```

### Privacy and cookies policy

[BySide](http://www.byside.com) is committed to respect and protect your privacy and developing technology that gives you the most powerful and safe online experience. BySide privacy statement and cookies policy can be found on the following url's:

-   [http://www.byside.com/privacy.html](http://www.byside.com/privacy.html)
-   [http://www.byside.com/cookies.html](http://www.byside.com/cookies.html)

## Attributes

### `data-webcare-id`

The BySide customer account ID.

### `data-label`

The content label as seen in your BySide account.

### `data-webcare-zone`

The webcare zone property, as specified in the BySide customer account
geographic zone. Defaults to main zone ("we1").

### `data-lang`

The language to show the contents in, as specified in the BySide customer
account localization. Defaults to Portuguese ("pt").

### `data-channel`

The channel identifier to use for content validation. Defaults to an empty
string.

### `data-fid`

The visitor force id. Use this when a unique visitor identifier is available,
usually for authenticated users. Defaults to an empty string.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Validation

See [amp-byside-content rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-byside-content/validator-amp-byside-content.protoascii) in the AMP validator specification.
