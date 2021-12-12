# Marfeel

CMP used through Marfeel platform in order to handle and enforce user consent.

## Example

```html
<amp-consent id="consent" layout="nodisplay" type="Marfeel">
  <script type="application/json">
    {
      "postPromptUI": "postPromptUI",
      "clientConfig": {
        "consentLanguage": "language-code",
        "publisherLogo": "website-logo"
      }
    }
  </script>
  <div id="postPromptUI">
    Post Prompt UI
    <button on="tap:consent.prompt(consent=Marfeel)">
      Manage
    </button>
  </div>
</amp-consent>
```

## Configuration

| Attribute       |  Type  | Mandatory | Description                                         |
| --------------- | :----: | :-------: | --------------------------------------------------- |
| consentLanguage | String |    yes    | Language code (in ISO-639-1) to display the consent |
| publisherLogo   | String |    yes    | URL of your website logo                            |

Please contact [Marfeel](https://marfeel.com) for further details regarding the configuration of this CMP.
