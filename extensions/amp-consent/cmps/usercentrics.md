# Usercentrics

Collect user consent with Usercentrics CMP.

## Example

```html
<amp-consent id="consent" layout="nodisplay" type="Usercentrics">
  <script type="application/json">
    {
      "postPromptUI": "postPromptUI",
      "clientConfig": {
        "id": "i3_E5TN2b"
      }
    }
  </script>
  <div id="postPromptUI">
    Post Prompt UI
    <button on="tap:consent.prompt(consent=Usercentrics)">
      Manage
    </button>
  </div>
</amp-consent>
```

## Configuration

| Attribute |  Type  | Mandatory | Description                               |
| --------- | :----: | :-------: | ----------------------------------------- |
| id        | String |    yes    | Settings id, provided via Admin Interface |

In order to retrieve your settings id, please use the [Usercentrics Admin Interface](https://admin.usercentrics.com/).

## Support

Please get in contact with [Usercentrics](https://usercentrics.com/) if you need further support.
