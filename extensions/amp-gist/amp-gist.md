---
$category@: dynamic-content
formats:
  - websites
  - stories
teaser:
  text: Creates an iframe and displays a GitHub Gist.
---

# amp-gist

## Usage

Creates an iframe and displays a [GitHub Gist](https://docs.github.com/en/github/writing-on-github/creating-gists).

The following example shows how to embed multiple files:

```html
<amp-gist
  data-gistid="b9bb35bc68df68259af94430f012425f"
  layout="fixed-height"
  height="225"
>
</amp-gist>
```

The following example shows how to embed a single file:

```html
<amp-gist
  data-gistid="a19e811dcd7df10c4da0931641538497"
  data-file="hi.c"
  layout="fixed-height"
  height="185"
>
</amp-gist>
```

## Attributes

### `data-gistid`

The ID of the gist to embed.

### `layout`

Currently only supports `fixed-height`.

### `height`

The initial height of the gist or gist file in pixels.

[tip type="note"]

You should obtain the height of the gist by inspecting it with your browser
(e.g., Chrome Developer Tools). Once the Gist loads the contained iframe will
resize to fit so that its contents will fit.

[/tip]

### `data-file` (optional)

If specified, display only one file in a gist.

### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"Github gist"`.

## Validation

See [amp-gist rules](validator-amp-gist.protoascii) in the AMP validator specification.
