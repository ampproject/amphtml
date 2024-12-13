---
$category@: media
formats:
  - websites
teaser:
  text: Displays an Imgur post.
---

# bento-imgur

## Usage

This extension creates an iframe and displays an [imgur](http://imgur.com) post.

```html
<bento-imgur
  data-imgur-id="f462IUj"
  layout="responsive"
  width="540"
  height="663"
></bento-imgur>
```

## Attributes

### data-imgur-id (required)

The id of the Imgur post.

[tip type="important"]
Album ids should be prefixed with `a/` like `a/ZF7NS3V`.

You can confirm this in the post's url. It should include `a/` or `gallery/` before the rest of the id, like on: `https://imgur.com/a/ZF7NS3V` or `https://imgur.com/gallery/ZF7NS3V`.
[/tip]

### width (required)

The width of the Imgur post.

### height (required)

The height of the Imgur post.
