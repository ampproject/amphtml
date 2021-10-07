---
$category: ads-analytics
formats:
  - websites
  - ads
  - stories
teaser:
  text: A tracking pixel to count page views.
---

# <a name="amp-pixel"></a> `amp-pixel`

[TOC]

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Can be used as a typical tracking pixel to count pageviews.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fixed, nodisplay</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://amp.dev/documentation/examples/components/amp-pixel/">amp-pixel example</a>.</td>
  </tr>
</table>

## Usage

The `amp-pixel` component behaves like a simple tracking pixel `img`. It takes a single URL, but provides variables that can be replaced by the component in the URL string when making the request. See the [substitutions](#substitutions) section for further details.

In this basic example, the `amp-pixel` issues a simple GET request to the given URL and ignores the result.

```html
<amp-pixel src="https://foo.com/tracker/foo" layout="nodisplay"></amp-pixel>
```

[tip type="note"]
When processing AMP URLs in the referrer header of analytics requests, strip out or ignore the `usqp` parameter. This parameter is used by Google to trigger experiments for the Google AMP Cache.
[/tip]

### Substitutions

The `amp-pixel` allows all standard URL variable substitutions.
See the [Substitutions Guide](../../../docs/spec/amp-var-substitutions.md) for more information.

In the following example, a request might be made to something like `https://foo.com/pixel?0.8390278471201` where the RANDOM value is randomly generated upon each impression.

```html
<amp-pixel src="https://foo.com/pixel?RANDOM" layout="nodisplay"></amp-pixel>
```

## Attributes

### src (required)

A simple URL to a remote endpoint that must be `https` protocol.

### referrerpolicy (optional)

This attribute is similar to the `referrerpolicy` attribute on `<img>`, however `no-referrer` is the only accepted value. If `referrerpolicy=no-referrer` is specified, the `referrer` header is removed from the HTTP request.

```html
<amp-pixel
  src="https://foo.com/tracker/foo"
  layout="nodisplay"
  referrerpolicy="no-referrer"
></amp-pixel>
```

### allow-ssr-img (optional)

This attribute used in AMP4ADS creatives indicates that as part of post validation
transformation, an img element may be placed directly within the amp-pixel
element allowing the ping to be sent in parallel with AMP runtime fetch/execution.
Note that it means that any macros within the url will NOT be expanded so only
use if they are not present in the src.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Styling

`amp-pixel` should not be styled.

## Validation

See [amp-pixel rules](https://github.com/ampproject/amphtml/blob/main/validator/validator-main.protoascii) in the AMP validator specification.
