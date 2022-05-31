# yahoo

## Display ad

```html
<amp-ad
  type="yahoo"
  width="316"
  height="264"
  data-sid="954014446"
  data-site="news"
  data-sa='{"LREC":"300x250","secure":"true","content":"no_expandable;"}'
>
</amp-ad>
```

```html
<amp-ad
  type="yahoo"
  width="300"
  height="250"
  data-config='{"adServer":{"1AS":{"region":"US"}},
    "positions":{"FB":{"alias":"1111111","sizes":["300x250"]}},
    "site":{name:{"autoblogAMP"}},"spaceId":"111111"}'
  data-stylesheet="https://www.autoblog.com/static/styles.css"
>
</amp-ad>
```

### Configuration

For configuration details, please contact https://advertising.yahoo.com/contact.

Supported parameters:

-   `height`
-   `width`
-   `data-sid`
-   `data-site`
-   `data-sa`
-   `data-config`
-   `data-stylesheet`

### Required Parameters:

`data-config` - Config for ad call JAC
`data-sa` - Config for ad call DARLA

### Optional parameters:

`data-stylesheet` - stylesheet to use inside iframe

### Configuration Details

For JAC ads : Required
"adServer":{"1AS":{region":"US"}},
"positions":{"FB":{alias:"1111111"},"sizes":["300x250"]}},
"site":{name:{"autoblogAMP"}},"spaceId":"111111"}

Alias, Sizes, SiteName and spaceId should be replaced by correct values.
NOTE: SiteName should be site name + "AMP"

Optional
"params":{"name":"value"}
