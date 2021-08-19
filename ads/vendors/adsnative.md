# AdsNative

## Example

```html
<amp-ad width="300" height="250" type="adsnative" data-anapiid="123456">
</amp-ad>
```

## Configuration

For configuration details, see [AdsNative's documentation](http://dev.adsnative.com).

### Required parameters

-   `width`: required by amp
-   `height`: required by amp
-   `data-anapiid`: the api id may be used instead of network and widget id
-   `data-annid`: the network id must be paired with widget id
-   `data-anwid`: the widget id must be paired with network id

### Optional parameters

-   `data-anapiid`: the api id
-   `data-anwid`: the widget id
-   `data-antid`: the template id
-   `data-ancat`: a comma separated list of categories
-   `data-ankv`: a list of key value pairs in the format `"key1:value1, key2:value2"`.
