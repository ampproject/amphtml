# InMobi

## Examples

### For 320x50 ad

```html
<amp-ad
  width="320"
  height="50"
  type="inmobi"
  data-siteid="a0078c4ae5a54199a8689d49f3b46d4b"
  data-slotid="15"
>
</amp-ad>
```

### For 300x250 ad

```html
<amp-ad
  width="300"
  height="250"
  type="inmobi"
  data-siteid="a0078c4ae5a54199a8689d49f3b46d4b"
  data-slotid="10"
>
</amp-ad>
```

### Banner Ad SlotIds

| AdSize  | SlotId |
| ------- | ------ |
| 320x50  | 15     |
| 300x250 | 10     |
| 468x60  | 12     |
| 728x90  | 11     |
| 120x600 | 13     |

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Required parameters

-   `data-siteid`: Site Id is the InMobi property id. You can get this from InMobi dashboard.
-   `data-slotid`: Slot Id is the ad size.

### Test Ads

To get test ads, you need to enable Diagnostic Mode from Site settings.
