# \_PING\_

A fake cmp type that is only used for local development.

## Example

```html
<amp-consent id="ABC" layout="nodisplay" type="_ping_">
  <script type="application/json">
    {
      "postPromptUI": "postPromptUI",
      "clientConfig": {
        "CMP_id": "test_id",
        "other_info": "test_info"
      }
    }
  </script>
  <div id="postPromptUI">
    Post Prompt UI
    <button on="tap:ABC.prompt(consent=_ping_)">Manage</button>
  </div>
</amp-consent>
```

## Configuration

For details on the configuration semantics, please contact the [ad network](#configuration) or refer to their [documentation](#ping).
