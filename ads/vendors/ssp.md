# SSP

## Example with one Ad

```html
<amp-ad
  width="480"
  height="300"
  type="ssp"
  data-position='{ "id": "id-1", "width": "480", "height": "300", "zoneId": "1234" }'
>
</amp-ad>
```

## Example with two Ads

```html
<amp-ad
  width="480"
  height="300"
  type="ssp"
  data-position='{ "id": "id-1", "width": "480", "height": "300", "zoneId": "1234" }'
>
</amp-ad>

<amp-ad
  width="480"
  height="300"
  type="ssp"
  data-said="abcd1234"
  data-position='{ "id": "id-2", "width": "480", "height": "300", "zoneId": "1234" }'
>
</amp-ad>
```

## Configuration

Required parameters:

| Attribute     | Description                          | Example                                                               |
| ------------- | ------------------------------------ | --------------------------------------------------------------------- |
| width         | Width of AMP Ad (grey fixed border)  | `200`                                                                 |
| height        | Height of AMP Ad (grey fixed border) | `200`                                                                 |
| type          | Type of amp-ad                       | `ssp`                                                                 |
| data-position | JSON stringified position object     | `{ "id": "id-1", "width": "480", "height": "300", "zoneId": "1234" }` |
| data-said     | SAID identificator                   | `abcd1234`                                                            |

### `data-position`

-   Object must have required keys `id`, `width`, `height`, `zoneId` (Watch out for uppercase "I" in "id").
-   Every position MUST have unique `id`, if you duplicate some id, Ad may be used from another position.
-   Attributes `width` and `height` are from AMP specification, and they will set fixed border around Ad.
-   Attributes `data-width` and `data-height` are used to fetch SSP Ads on the server (They can be different).

### `data-said`

-   Optional
-   String representing `said` identificator

## Contact

seznam.partner@firma.seznam.cz
