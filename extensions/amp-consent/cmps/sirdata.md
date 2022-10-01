# Sirdata

Collects user consent with Sirdata CMP.

## Example

```html
<amp-consent id="consent" layout="nodisplay" type="sirdata">
  <script type="application/json">
    {
      "postPromptUI": "promptConsentUI",
      "clientConfig": {
        "cmp": {
          "theme": {
            "noConsentButton": "refuse"
          }
        }
      }
    }
  </script>
  <div id="promptConsentUI">
    Post Prompt UI
    <button on="tap:consent.prompt(consent=sirdata)">
      Privacy settings
    </button>
  </div>
</amp-consent>
```

## Configuration

For more information and configuration options, please visit our [Documentation](https://cmp.sirdata.com/#/docs).
