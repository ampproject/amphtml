# Trugaze

## Example

### Basic sample

```html
<amp-ad
  width="300"
  height="250"
  type="trugaze"
  data-public-id="4WMPI6PV"
  data-slot="/134642692/amp-samples"
>
</amp-ad>
```

### Sample with multisize

```html
<amp-ad
  width="300"
  height="250"
  type="trugaze"
  data-public-id="4WMPI6PV"
  data-slot="/134642692/amp-samples"
  data-multi-size="320x50"
>
</amp-ad>
```

### Sample with targeting

```html
<amp-ad
  width="320"
  height="50"
  type="trugaze"
  data-public-id="4WMPI6PV"
  data-slot="/134642692/amp-samples"
  json='{"targeting":{"target":["sample"],"pos":["amp"]}}'
>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

## Supported parameters

| Parameter name  | Description                         | Required |
| --------------- | ----------------------------------- | -------- |
| width           | Primary size width                  | Yes      |
| height          | Primary size height                 | Yes      |
| data-public-id  | Application public id               | Yes      |
| data-slot       | Ad unit code                        | Yes      |
| data-multi-size | Comma separated list of other sizes | No       |
| json            | Custom targeting map                | No       |

Note: if any of the required parameters is not present, the ad slot will not be filled.
