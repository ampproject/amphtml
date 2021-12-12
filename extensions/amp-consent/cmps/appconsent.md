# AppConsent

CMP used through AppConsent platform in order to handle and enforce user consent.

## Example

```html
<amp-consent id="ABC" layout="nodisplay" type="appconsent">
  <script type="application/json">
    {
      "postPromptUI": "postPromptUI",
      "clientConfig": {
        "id": "1/10/v5eCA1JV4"
      }
    }
  </script>
  <div id="postPromptUI">
    Post Prompt UI
    <button on="tap:ABC.prompt(consent=appconsent)">
      Manage
    </button>
  </div>
</amp-consent>
```

## Configuration

| Attribute |  Type  | Mandatory | Description                                             |
| --------- | :----: | :-------: | ------------------------------------------------------- |
| id        | String |    yes    | AppConsent Notice identifier, provided upon registering |

Please contact [AppConsent](https://appconsent.io/en) for further details regarding the configuration of this CMP.
