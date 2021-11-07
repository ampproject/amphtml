# DIDOMI

Collect and enforce user consent with the Didomi Consent Management Platform. Use the [Didomi Console](https://console.didomi.io/) to create and configure your consent notices.

## Example

```html
<amp-consent id="didomi" layout="nodisplay" type="didomi">
  <script type="application/json">
    {
      "postPromptUI": "postPromptUI",
      "clientConfig": {"config": {"app": {"apiKey": "Your-API-Key"}}}}
    }
  </script>
  <div id="postPromptUI">
    Post Prompt UI
    <button on="tap:didomi.prompt(consent=didomi)">Manage</button>
  </div>
</amp-consent>
```

## Configuration

Visit the [Didomi Console](https://console.didomi.io/) and our [Documentation](https://developers.didomi.io/cmp/amp) for more information.
