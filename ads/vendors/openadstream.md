# Open AdStream (OAS)

## Examples

### Single ad

```html
<amp-ad
  width="300"
  height="250"
  type="openadstream"
  data-adhost="oasc-training7.247realmedia.com"
  data-sitepage="dx_tag_pvt_site"
  data-pos="x04"
  data-query="keyword=keyvalue&key2=value2"
>
</amp-ad>
```

### Multi ads using coordinated positions

```html
<amp-ad
  width="728"
  height="90"
  type="openadstream"
  data-adhost="oasc-training7.247realmedia.com"
  data-sitepage="dx_tag_pvt_site"
  data-pos="x50,x51!x50"
>
</amp-ad>
<amp-ad
  width="300"
  height="250"
  type="openadstream"
  data-adhost="oasc-training7.247realmedia.com"
  data-sitepage="dx_tag_pvt_site"
  data-pos="x50,x51!x51"
>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Required parameters

-   `adhost`: OAS cname. Must start with HTTPS.
-   `sitepage`: Sitepage configured for this ad spot.
-   `pos`: Position for the this ad spot.

### Optional parameters

-   `query`: Query parameter to be sent with request. Keywords and keynames, taxonomy etc.
