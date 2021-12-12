# Custom Search Ads

## AdSense For Search (AFS)

To request AdSense for Search ads on the Custom Search Ads protocol, use the
**data-afs-page-options** and **data-afs-adblock-options** attributes in the
amp-ad tag. The values you pass should be set to a stringified version of the
Javascript object you would pass in the ad request of a standard CSA request.

```html
<amp-ad
  height="300"
  type="csa"
  data-afs-page-options='{"pubId": "partner-pub-id", "query": "flowers", "styleId": "123456789"}'
  data-afs-adblock-options='{"width": "auto", "number": 2}'
>
</amp-ad>
```

Please see documentation for [AdSense for Search](https://developers.google.com/custom-search-ads/docs/implementation-guide)
for more information.

## AdSense For Shopping (AFSh)

To request AdSense for Shopping ads on the Custom Search Ads protocol, use the
**data-afsh-page-options** and **data-afsh-adblock-options** attributes in the
amp-ad tag. The values you pass should be set to a stringified version of the
Javascript object you would pass in the ad request of a standard CSA request.

```html
<amp-ad
  height="300"
  type="csa"
  data-afsh-page-options='{"pubId": "partner-vert-pla-pubid-pdp", "query": "flowers", "styleId": "123456789"}'
  data-afsh-adblock-options='{"width": "auto", "height": 300}'
>
</amp-ad>
```

To request an AFSh ad with a width equal to the screen width, use "auto" for
the CSA width parameter. Please note that "auto" width is not supported in
non-AMP implementations.

Note that only the [multiple-format](https://developers.google.com/adsense-for-shopping/docs/multiplereference) AdSense for Shopping ads are supported under this integration.

Please see documentation for [AdSense for Shopping](https://developers.google.com/adsense-for-shopping/docs/implementation-guide)
for more information.

### AFSh with AFS Backfill

To request AFS ads when AFSh does not return any ads, include both the
**data-afs-\*** and **data-afsh-\*** attributes in the amp-ad tag. If AFSh does
not return ads, AMP will request AFS ads with the values from the **data-afs-\***
attributes.

```html
<amp-ad
  height="400"
  type="csa"
  data-afsh-page-options='{"pubId": "partner-vert-pla-pubid-pdp", "query": "flowers"}'
  data-afsh-adblock-options='{"width": "auto", "height": 400}'
  data-afs-page-options='{"pubId": "partner-pub-id", "query": "flowers", "channel": "backfill"}'
  data-afs-adblock-options='{"width": "auto"}'
>
</amp-ad>
```

## Requirements

-   Each amp-ad tag contains one adblock. Only one **data-afs-adblock-options**
    and/or one **data-afsh-adblock-options** attribute can be specified in the tag.
-   Above the fold ads are required to have a minimum height of 300 pixels.
-   When requesting ads above the fold:
-   You must use the maxTop parameter instead of the number parameter to specify the number of ads.
-   You can only request one ad ("maxTop": 1) in an ad unit that is above the fold.
-   You must use a fallback div to show alternate content when no ads are returned. If no ads are returned the ad will not be collapsed because it is above the fold.
