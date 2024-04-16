# Single Page Ads

A single page ad allows an ad creative to appear as a full page, dynamically interleaved, within the pages of an AMP story. For more information about AMP stories, see [here](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/amp-story-ads.md).

## Adding a Single Page Ad to Your Story

Single page ads are similar to regular Google Ad Manager ads, but must be tagged as script elements within an `<amp-story-auto-ads>` element as follows:

```html
<amp-story-auto-ads>
  <script type="application/json">
    {
      "ad-attributes": {
        "type": "doubleclick",
        "data-slot": "/30497360/a4a/amp_story_dfp_example"
      }
    }
  </script>
</amp-story-auto-ads>
```

You **cannot** use an `<amp-ad>` element to display a single page ad within a story.

## Single Page Ad Creatives

Single page ad creatives _must_ contain two meta tags: one to specify the [call-to-action enum](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/amp-story-ads.md#cta-text-enum), and one to specify the outlink URL. E.g.,

```html
<meta name="amp-cta-url" content="https://www.example-ads.com/landing?q=123" />
<meta name="amp-cta-type" content="EXPLORE" />
```

A third meta tag should also be included to indicate the [landing page type](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/amp-story-ads.md#cta-landing-page-enum)

```html
<meta name="amp-cta-landing-page-type" content="NONAMP" />
```

See the above link for allowed call-to-action buttons. By design, these will be the only clickable elements of the creative unit. This means that while things like AMP carousels are allowed within a single page story ad, they will not be clickable.

## Example

You can find a fully working example hosted on [ampbyexample.com](https://amp.dev/documentation/examples/advertising-analytics/doubleclick_amp_story_ads/).

Google Ad Manager trafficking instructions can be found in the [DFP Help Center](https://support.google.com/dfp_premium/answer/9038178).

#### <a href="amp-ad-network-doubleclick-impl-internal.md">Back to Google Ad Manager</a>
