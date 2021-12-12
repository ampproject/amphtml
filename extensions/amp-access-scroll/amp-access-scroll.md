---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Integrates with Scroll membership.
---

# amp-access-scroll

## Usage

Lets sites in the [Scroll](https://scroll.com) network identify Scroll members in order to serve them an ad-free, directly-monetized experience.

### Configuration

In `<head>`, add

```
<script id="amp-access" type="application/json">
{
  "vendor": "scroll",
  "namespace": "scroll"
}
</script>
```

Be sure not to add a trailing comma to the namespace line, which makes it invalid JSON!

If you are already using `amp-access` for a paywall, follow the steps in the `amp-access` documentation for [using namespaces and an array of providers](https://amp.dev/documentation/components/amp-access#multiple-access-providers).

### Make each ad conditional

Add an `amp-access` attribute to each ad container.

```
<div class="amp-ad-container" amp-access="NOT scroll.scroll">
  <amp-ad... >
</div>
```

Learn more at [https://developer.scroll.com/amp](https://developer.scroll.com/amp).

## Validation

See [`amp-access-scroll` rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-access-scroll/validator-amp-access-scroll.protoascii) in the AMP validator specification.
