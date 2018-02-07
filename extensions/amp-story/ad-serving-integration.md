# Ad serving integration for AMP Story

## THIS IS A WORK-IN-PROGRESS

This article is for parties who want to serve ads into AMP stories. If you're a
publisher who wants to monetize your stories, go for [monetize with story](./monetize-with-story.md) instead,
unless you want to serve ads by yourselves.

## Custom ad

Story publisher can do self-served ads using the [Custom ad](../../ads/custom.md) 
extension. The ads are rendered with inlined templates in the story document
and data fetched remotely.

### Template
An ad template will be written in [amp-mustache](../amp-mustache/amp-mustache.md).

```html
<template type="amp-mustache" id="template-1">
  <amp-img src="{{imgSrc}}"></amp-img>
  <amp-pixel src="{{impressionUrl}}"></amp-pixel>
</template>
```

Important things

- Templates need to be inlined in the AMP Story, as a direct children of `<amp-story>` element.
- An element ID is required, so that the template can be referenced by the ad response.
- The selected template ID will be set as an attribute of `amp-ad`: `<amp-ad template="template-1">`
- The content inside a template should strictly follow the [rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-story/validator-amp-story.protoascii) of `amp-story-grid-layer`
- Be aware of the [restrictions](../amp-mustache/amp-mustache.md#Restrictions) of `amp-mustache`.

- Ads of different templates can be styled separately using CSS attribute selector:
```css
amp-ad[template=template-1] {
  background-color: blue;
}
amp-ad[template=template-2] {
  background-color: red;
}
```

- To provide a consistent user experience, CTA (call-to-action) button should NOT
be included in the template. Story defines a list of CTA buttons to select from.
For details, read the "CTA ad" section below. 

### Ad response

#### Response payload
A server endpoint needs to provide ad responses in the following JSON format:

```js
{
  "templateId": "template-1",
  "data": {
    "imgSrc": "https://cdn.adserver.com/img-12345.jpg",
    "impressionUrl": "https://adserver.com/track?iid=18745543"
  },
  "var": {
    "ctaType": "EXPLORE",
    "ctaUrl": "https://advertiser.com/landing-123.html",
    "impressionId": "ac2d1s2E3B"
  }
}
```

- `templateId`: the ID of the inlined template that is going to be used.
- `data`: the data model to populate the selected template. The fields should match the variable names in the selected template.
- `var`: extra variables needed by the story. They will be added to the `amp-ad` element as data attributes, and picked by runtime for different use cases:
    - CTA button rendering (see details in the "CTA ad" section)
    - Provide dynamic content of the ad for tracking purpose (see details in the "tracking" section)

#### Response headers
The ad request will be an AMPCORS request, hence a couple of custom response headers are needed.
Take a look at the [AMPCORS spec](../spec/amp-cors-request.md).

### Tagging

In AMP Story, you cannot put `amp-ad` directly onto the page, instead, all ads
are fetched & displayed by the [amp-story-auto-ads](./amp-story-auto-ads.md)
extension.

Here is a full example using `amp-story-auto-ads` together with some templates inlined.

```html
<amp-story>
  <template type="amp-mustache" id="template-1">
    <amp-img src="{{imgSrc}}"></amp-img>
    <amp-pixel src="{{impressionUrl}}"></amp-pixel>
  </template>

  <template type="amp-mustache" id="template-2">
    <div class="creative-line-1">{{creativeLine1}}</div>
    <div class="creative-line-2">{{creativeLine2}}</div>
    <amp-pixel src="{{impressionUrl}}"></amp-pixel>
  </template>
  
  <amp-story-auto-ads>
     <script type=”application/json”>
       {
          "ad-attributes": {
            type: “custom”
            data-src: “https://adserver.com/getad?slot=abcd1234”
          }
       }
     </script>
  </amp-story-auto-ads>
  ...
```

At runtime, an `amp-ad` element will be inserted dynamically:

```html
<amp-ad type="custom"
  data-src="https://adserver.com/getad?slot=abcd1234"
</amp-ad>
```

And an ad request will be made to this URL `https://adserver.com/getad?slot=abcd1234`.

### CTA ad
To provide a consistent user experience, story will be responsible to render 
the button of a CTA ad. The URL and button text will be provided in the `var` 
object of the ad response.

- `ctaType`: the CTA button type, of which the value is an enum 
   - EXPLORE: "Explore Now"
   - SHOP: "Shop Now"
   - READ: "Read Now"
- `ctaUrl`: the landing page URL for the CTA button

### Tracking
Each story page that is dynamically inserted for ad will be assigned with a system
generated page ID, prefixed with `i-amphtml-AD-`. `story-page-visible` trigger 
can be used to track ad views.

Further more, ad response can leverage the `var` object to put data attributes 
to the `amp-ad` tag, and used by amp-analytics as [data-var](../amp-analytics/analytics-vars.md),

## Ad network integration
Coming soon ...
