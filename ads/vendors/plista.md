# plista

## Example

### Basic

```html
<amp-embed
  width="300"
  height="300"
  type="plista"
  layout="responsive"
  data-countrycode="de"
  data-publickey="e6a75b42216ffc96b7ea7ad0c94d64946aedaac4"
  data-widgetname="iAMP"
  data-categories="politics"
>
</amp-embed>
```

### With article information

```html
<amp-embed
  width="300"
  height="300"
  type="plista"
  layout="responsive"
  data-countrycode="de"
  data-publickey="e6a75b42216ffc96b7ea7ad0c94d64946aedaac4"
  data-widgetname="iAMP"
  data-geo="de"
  data-urlprefix=""
  data-categories="politics"
  json='{"item":{"objectid":"1067327","url":"http://www.plista.com/article/a-1067337.html","updated_at":1449938206}}'
>
</amp-embed>
```

## Configuration

For semantics of configuration, please see [Plista's documentation](https://goo.gl/nm9f41).

Supported parameters:

-   `data-countrycode`
-   `data-publickey`
-   `data-widgetname`
-   `data-geo`
-   `data-urlprefix`
-   `data-categories`

Supported via `json` attribute:

-   `item`

## Layout

Width and height are optional. You can use different layout types with plista.
