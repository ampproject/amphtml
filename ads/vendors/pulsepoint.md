# PulsePoint

## Tag Example

```html
<amp-ad
  width="300"
  height="250"
  type="pulsepoint"
  data-pid="512379"
  data-tagid="472988"
  data-size="300X250"
>
</amp-ad>
```

## Header Bidding Tag Example

```html
<amp-ad
  width="300"
  height="250"
  type="pulsepoint"
  data-pid="521732"
  data-tagid="76835"
  data-tagtype="hb"
  data-timeout="1000"
  data-slot="/1066621/ExchangeTech_Prebid_AdUnit"
>
</amp-ad>
```

## Configuration

For semantics of configuration, please see [PulsePoint's documentation](https://www.pulsepoint.com).

Supported parameters:

-   `pid`: Publisher Id
-   `tagid`: Tag Id
-   `tagtype`: Tag Type. "hb" represents Header bidding, otherwise treated as regular tag.
-   `size`: Ad Size represented 'widthxheight'
-   `slot`: DFP slot id, required for header bidding tag
-   `timeout`: optional timeout for header bidding, default is 1000ms.
