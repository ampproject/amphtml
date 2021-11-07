---
$category@: media
formats:
  - websites
teaser:
  text: Displays any Playbuzz item content (e.g., list, poll, etc.).
---

# amp-playbuzz

Can be any item URL taken from [playbuzz.com](http://www.playbuzz.com).

## Examples

Playbuzz Item by plain url (without info, share-buttons, comments)

```html
<amp-playbuzz
  src="https://www.playbuzz.com/HistoryUK/10-classic-christmas-movies"
  height="500"
>
</amp-playbuzz>
```

Playbuzz Item by item-id (can be found in the item's embed code)

```html
<amp-playbuzz data-item="a6aa5a14-8888-4618-b2e3-fe6a30d8c51b" height="500">
</amp-playbuzz>
```

With optional parameters (info, share-buttons, comments):

```html
<amp-playbuzz
  src="https://www.playbuzz.com/HistoryUK/10-classic-christmas-movies"
  height="500"
  data-item-info="true"
  data-share-buttons="true"
  data-comments="true"
>
</amp-playbuzz>
```

## Required attributes

### One of the following is required:

<table>
  <tr>
    <td width="40%"><strong>src</strong></td>
    <td>The URL for the Playbuzz item.
    Can be any item URL taken from <a href="http://www.playbuzz.com">playbuzz.com</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-item</strong></td>
    <td>The item id for the Playbuzz item.
    Can be taken from the item's embed code (at the item's page at playbuzz website)</td>
  </tr>
</table>

**Note**: If both attributes are present, `data-item` is used.

## Optional attributes

<table>
  <tr>
    <td width="40%"><strong>data-item-info </strong> (optional)</td>
    <td>Indicates whether to display data info, such as creation date, creator name, etc.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-share-buttons</strong> (optional)</td>
    <td>Indicates whether to display share buttons.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-comments</strong> (optional)</td>
    <td>Indicates whether to display users' comments.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-playbuzz rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-playbuzz/validator-amp-playbuzz.protoascii) in the AMP validator specification.
