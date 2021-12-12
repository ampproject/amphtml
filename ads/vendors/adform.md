# Adform

## Examples

### Simple ad tag with `data-bn`

```html
<amp-ad width="320" height="50" type="adform" data-bn="12345"> </amp-ad>
```

### Ad placement with `data-mid`

```html
<amp-ad width="320" height="50" type="adform" data-mid="12345"> </amp-ad>
```

### Ad tag or placement with `src`

```html
<amp-ad
  width="320"
  height="50"
  type="adform"
  src="https://track.adform.net/adfscript/?bn=4849385;msrc=1"
>
</amp-ad>
```

## Configuration

Please refer to [Adform Help Center](https://www.adform.com) for more
information on how to get required ad tag or placement IDs.

### Supported parameters

Only one of the mentioned parameters should be used at the same time.

-   `data-bn`
-   `data-mid`
-   `src`: must use https protocol and must be from one of the
    allowed Adform hosts.
