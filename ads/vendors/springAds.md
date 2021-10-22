# Spring AdTechnology

## Example

```html
<amp-ad
  height="fluid"
  type="springAds"
  data-adssetup='{
    "view": "amp",
    "partners": true,
    "adPlacements": ["banner","mrec"],
    "adSlotSizes": {
      "banner": [{
        "minWidth": 1,
        "sizes": [[320, 50]]
      }],
      "mrec": [{
        "minWidth": 1,
        "sizes": [[300, 250], [300, 300], [250, 250], [320, 160], [300, 150], [320, 50], [320, 75], [320, 80], [320, 100], [300, 100], [300, 50], [300, 75]]
      }]
    },
    "pageName": "demo_story",
    "publisher": "adtechnology.axelspringer.com",
    "target": "singleAds;multiAds;you;me;team=adtech,MIT;"
  }'
>
</amp-ad>
<amp-ad width="320" height="50" type="springAds" data-adslot="banner"></amp-ad>
<amp-ad
  width="100vW"
  height="fluid"
  type="springAds"
  data-adslot="mrec"
></amp-ad>
```

For a maintenanced uptodate documentation please refer to our
[official springAds document](https://github.com/spring-media/adsolutions-implementationReference/blob/master/publisher-amp-reference.md)

## Configuration

for further information regarding this implementation, please contact adtechnology@axelspringer.de

## Optional features

-   Loading placeholder for ads, see [Placeholders in amp-ad](https://amp.dev/documentation/components/amp-ad#placeholder).
-   No ad fallback for ads, see [No ad in amp-ad](https://amp.dev/documentation/components/amp-ad#no-ad-available).
