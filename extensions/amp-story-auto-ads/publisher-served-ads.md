# Publisher served ads

This is an option for publishers who would like to place single page ads amidst
AMP story content they produce. This is a complex solution. If you are looking
for the more common implementation please see our [getting started guide](https://amp.dev/documentation/guides-and-tutorials/develop/advertise_amp_stories)

This is implemented using a mechanism in the [Custom ad](../../ads/custom.md) extension.
The ads are rendered with inlined templates in the story document
and the data for the templates is fetched remotely.

### Template

An ad template must be written in [amp-mustache](../amp-mustache/amp-mustache.md).
For example:

```html
<template type="amp-mustache" id="template-1">
  <amp-img layout="fill" src="{{imgSrc}}"></amp-img>
  <amp-pixel src="{{impressionUrl}}"></amp-pixel>
</template>
```

A few important things to note:

-   Templates need to be inlined in the AMP story, as direct children of a `<amp-story-auto-ads>` element.
-   An element ID is required, so that the template can be referenced by the ad response.
-   The selected template ID will be set as an attribute of `amp-ad`: `<amp-ad template="template-1">`
-   The content inside a template should strictly follow the
    [rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/validator-amp-story.protoascii) of `amp-story-grid-layer`
-   Be aware of the [restrictions](../amp-mustache/amp-mustache.md#restrictions) of `amp-mustache`.
-   Ads that use different templates can be styled separately using CSS attribute selector:

```css
amp-ad[template='template-1'] {
  background-color: blue;
}
amp-ad[template='template-2'] {
  background-color: red;
}
```

-   The CTA (call-to-action) button should NOT
    be included in the template. Story defines a list of CTA buttons to select from.
    For details, read the ["CTA ad" section](#cta-ad) below.

### Ad response

#### Response payload

A server endpoint needs to provide ad responses in the following JSON format:

```json
{
  "templateId": "template-1",
  "data": {
    "imgSrc": "https://cdn.adserver.com/img-12345.jpg",
    "impressionUrl": "https://adserver.com/track?iid=18745543"
  },
  "vars": {
    "ctaType": "EXPLORE",
    "ctaUrl": "https://advertiser.com/landing-123.html",
    "impressionId": "ac2d1s2E3B"
  }
}
```

-   `templateId`: the ID of the inlined template that is going to be used.
-   `data`: the data model to populate the selected template. The fields should match the variable names in the selected template.
-   `vars`: extra variables needed by the story. They will be added to the `amp-ad` element as data attributes, and picked by runtime for different use cases:
    -   CTA button rendering (see details in the ["CTA ad" section](#cta-ad))
    -   Provide dynamic content of the ad for tracking purpose (see details in the "tracking" section)

#### Response headers

The ad request is an AMP CORS request, hence a couple of custom response headers are needed.
See [AMP CORS spec](../../docs/spec/amp-cors-requests.md) for details.

### Tagging

In an AMP story, you cannot put an `amp-ad` directly onto the page, instead, all ads
are fetched and displayed by the [amp-story-auto-ads](./amp-story-auto-ads.md)
extension.

Here is a full example using `amp-story-auto-ads` together with some templates inlined:

```html
<amp-story>
  <amp-story-auto-ads>
     <script type=”application/json”>
        {
          "ad-attributes": {
            "type": "custom",
            "data-url": "https://adserver.com/getad?slot=abcd1234"
          }
        }
     </script>

     <template type="amp-mustache" id="template-1">
       <amp-img src="{{imgSrc}}"></amp-img>
       <amp-pixel src="{{impressionUrl}}"></amp-pixel>
     </template>

     <template type="amp-mustache" id="template-2">
       <div class="creative-line-1">{{creativeLine1}}</div>
       <div class="creative-line-2">{{creativeLine2}}</div>
       <amp-pixel src="{{impressionUrl}}"></amp-pixel>
     </template>
  </amp-story-auto-ads>

  ...
```

At runtime, an `amp-ad` element is dynamically inserted:

```html
<amp-ad type="custom"
  data-url="https://adserver.com/getad?slot=abcd1234"
</amp-ad>
```

And an ad request is made to this URL: `https://adserver.com/getad?slot=abcd1234`.
Each story can only have one `amp-story-auto-ads` element. And it must be the first
child of the `<amp-story>` element.
