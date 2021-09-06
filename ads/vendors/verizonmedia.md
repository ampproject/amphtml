# VerizonMedia

## Example

```html
<amp-ad
  type="verizonmedia"
  width="300"
  height="250"
  data-config='{"adServer":{"1AS":{"region":"US"}},
    "positions":{"FB":{"alias":"1111111","sizes":["300x250"]}},
    "site":{name:{"autoblogAMP"}},"spaceId":"111111"}'
  data-stylesheet="https://www.autoblog.com/static/styles.css"
>
</amp-ad>
```

## Configuration

For semantics of configuration, please see ad network documentation.

### Required Parameters:

`data-config` - Config for ad call

### Optional parameters:

`data-stylesheet` - stylesheet to use inside iframe

### Configuration Details

Required
"adServer":{"1AS":{region":"US"}},
"positions":{"FB":{alias:"1111111"},"sizes":["300x250"]}},
"site":{name:{"autoblogAMP"}},"spaceId":"111111"}

Alias, Sizes, SiteName and spaceId should be replaced by correct values.
NOTE: SiteName should be site name + "AMP"

Optional
"params":{"name":"value"}
