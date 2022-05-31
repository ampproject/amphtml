# amp-ad-network-dianomi-impl

The Dianomi fast fetch implementation for serving AMP ads, using `<amp-ad>`.

[https://amp.dev/documentation/components/amp-ad/?format=websites](https://amp.dev/documentation/components/amp-ad/?format=websites)

### Required parameters

-   `data-request-param-id` : A Dianomi provided SmartAd ID.

### Optional parameters

-   `data-dianomi-type` : The type of Dianomi ad to be served.
-   `data-dianomi-env` : The Dianomi environment from which to serve the ad.

#### Example configuration:

```html
<amp-ad
  width="400"
  height="450"
  type="dianomi"
  data-request-param-id="5519"
  data-dianomi-type="smartads">
</amp-ad>
```
