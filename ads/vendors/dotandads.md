# DotAndAds

## Examples

#### 300x250 box

```html
<amp-ad
  width="300"
  height="250"
  type="dotandads"
  data-sp="300x250-u"
  data-mpo="ampTest"
  data-mpt="amp-amp-all-all"
>
</amp-ad>
```

#### 980x250 masthead

```html
<amp-ad
  width="980"
  height="250"
  type="dotandads"
  data-sp="sn-u"
  data-cid="11"
  data-mpo="ampTest"
  data-mpt="amp-amp-all-all"
>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

Supported parameters:

-   `sp`: sizepos (the ad size and position code)
-   `mpo`: multipoint (an extraction parameter based on site)
-   `mpt`: mediapoint tag (the box where the ad will be shown)
-   `cid`: customer id
