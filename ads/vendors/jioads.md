# JIOADS

## Example of JIOADS AD's implementation

```html
 <h4>Native Banner (Fixed Size W320 x H50)</h4>
  <amp-ad
  width="320"
  height="50"
  layout="fixed"
  type="jioads"
  data-adspot="t85hrz97"
  data-pkg-name="com.jio.web"
  data-refresh-rate="40"
  data-ad-meta-data={}
  >
  </amp-ad>
  <br>
  <h4>Native Billboard (Fixed Size W300 x H250)</h4>
  <amp-ad
  width="300"
  height="250"
  layout="fixed"
  type="jioads"
  data-adspot="dh0icl54"
  data-pkg-name="com.jio.web"
  data-refresh-rate="35"
  >
  <div placeholder>Loading....</div>
  <div fallback>Something went wrong in ad load</div>
  </amp-ad>
  <h4>Dynamic Display Billboard (Responsive Size Min W320 x H 300)</h4>
  <amp-ad
  width="360"
  height="300"
  layout="responsive"
  type="jioads"
  data-adspot="960s2apj"
  data-pkg-name="com.jio.web"
  data-height-auto="true"
  >
  <div placeholder>Loading....</div>
  <div fallback>Something went wrong in ad load</div>
  </amp-ad>
  <h4>Instream /  Video (Responsive Size Min W320 x H280)</h4>
  <amp-ad
  width="360"
  height="360"
  layout="fixed"
  type="jioads"
  data-adspot="3vu7gqas"
  data-pkg-name="com.jio.web"
  data-height-auto="true"
  data-video-ad="1"
  >
  <div placeholder>Loading....</div>
  <div fallback>Something went wrong in ad load</div>
  </amp-ad>
```

## Configuration

For details on the configuration semantics, please contact JioAds

### Required parameters

-   `data-adspot`: ADSPOT (publisher will get from jioads campaign dashboard)
-   `data-pkg-name`: PACKAGE NAME (publisher will get from jioads campaign dashboard as unique for each ad)

### Optional parameters

-   `data-video-ad`: VIDEO AD boolean, only for instream ad (publisher will get from jioads campaign dashboard and decide taht want to publish video)
-   `data-refersh-rate`: REFRESH RATE integer seconds, defaut refresh rate is 30 seconds, manually set should be greater than 30 (publisher can set refresh rate in seconds, so ad will be refreshed according to given seconds)
-   `data-ad-meta-data`: AD META DATA json format (publisher can set json data like category etc, full example on campaign dashboard)
