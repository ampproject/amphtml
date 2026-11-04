# gsrv

Serves ad zones from an ad network that runs on [GoAdserver](https://www.goadserver.com/). The network's ad controller renders the zone inside the ad frame, tells AMP when the ad has rendered (with its size) and collapses the slot when the zone has no ad. Clicks open in a new window.

## Example

### Banner zone

```html
<amp-ad
  width="300"
  height="250"
  type="gsrv"
  data-host="g2.gsrv.dev"
  data-ctrl="19460"
  data-zone="12512838"
>
</amp-ad>
```

### Native zone

```html
<amp-ad
  width="360"
  height="300"
  type="gsrv"
  data-host="g2.gsrv.dev"
  data-ctrl="19460"
  data-zone="12512839"
  data-plugin="native"
>
</amp-ad>
```

## Configuration

The ad network gives publishers the values for each zone in its panel (the zone's code tab, "AMP pages").

### Required parameters

-   `data-host`: the ad network's serving host, a host name only (for example `ads.example.com`). The ad controller is loaded from `https://<data-host>/ctrl/<data-ctrl>.js`.
-   `data-ctrl`: the publisher site's ad controller id.
-   `data-zone`: the ad zone id.

### Optional parameters

-   `data-plugin`: how the zone renders, `banner` (default) or `native`.
-   `data-options`: extra zone options as a JSON string, for example native templates: `data-options='{"tpl_item":"…"}'`.

## Support

For questions, contact support@goadserver.com.
