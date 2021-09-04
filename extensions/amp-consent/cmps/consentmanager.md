# ConsentManager

Collect and enforce user consent with the ConsentManager CMP. Login to your ConsentManager.net account in order to create a CMP.

## Example

```html
<amp-consent id="ConsentManager" layout="nodisplay" type="ConsentManager">
  <script type="application/json">
    {
      "postPromptUI": "postPromptUI",
      "clientConfig": {
        "id": "your CMP ID",
        "params": "optional configuration parameters"
      }
    }
  </script>
  <div id="postPromptUI">
    Post Prompt UI
    <button on="tap:consent.prompt(consent=ConsentManager)">
      Manage
    </button>
  </div>
</amp-consent>
```

## Configuration

| Attribute |  Type  | Mandatory | Description                                                                    |
| --------- | :----: | :-------: | ------------------------------------------------------------------------------ |
| id        | String |    yes    | Your ConsentManager CMP ID. Can be found in your account under Menu > Get Code |
| params    | String |    no     | Additional parameters that can be used in order to configure the CMP layout    |

Visit the [ConsentManager Website](https://www.consentmanager.net/) and our [Documentation](https://help.consentmanager.net/books/cmp/page/using-the-cmp-with-amp-websites) for more information.
