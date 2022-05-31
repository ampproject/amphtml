# Imedia

## Example

```html
<amp-ad
  width="300"
  height="250"
  type="imedia"
  data-id="p1"
  data-positions='[{"id":"p1", "zoneId":"seznam.novinky.ikona2"}, {"id":"p2", "zoneId":"seznam.novinky.ikona"}]'
>
</amp-ad>
```

## Configuration

For configuration semantics, see [Imedia's documentation](https://iimedia.sbeta.cz/html/navod-im3light/) or contact reklama-pozadavky@firma.seznam.cz

Required parameters:

-   `data-id`
-   `data-positions`: JSON value

Required JSON fields:

-   `id`: unique element id
-   `zoneId`: advertisement identificator
