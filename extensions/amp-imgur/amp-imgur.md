---
$category@: media
formats:
  - websites
teaser:
  text: Displays an Imgur post.
---

# amp-imgur

## Usage

This extension creates an iframe and displays an [imgur](http://imgur.com) post.

```html
<amp-imgur
  data-imgur-id="f462IUj"
  layout="responsive"
  width="540"
  height="663"
></amp-imgur>
```

## Attributes

### data-imgur-id (required)

The id of the Imgur post.

[tip type="important"]
Album ids should prefixed with `a/` like `a/ZF7NS3V`.

You can confirm this in the post's url. It should include `a/` before the rest of the id, like on: `https://imgur.com/a/ZF7NS3V`
[/tip]

### width (required)

The width of the Imgur post.

### height (required)

The height of the Imgur post.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Validation

See [amp-imgur rules](validator-amp-imgur.protoascii) in the AMP validator specification.
