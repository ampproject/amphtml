# Google Funding Choices

Funding Choices is a Consent Management Platform (CMP) that integrates with Google's advertising services to help you gather your visitors' consent for privacy regulations. More information can be found [on support.google.com](https://support.google.com/fundingchoices/#topic=9437573)

## Closed Beta

The amp-consent configuration for Funding Choices is in a closed Beta, and usage of this feature has been limited to a small batch of publishers. However, Funding Choices is looking to open up access for general availability in the near future!

## Example

```html
<amp-consent id="consent" layout="nodisplay" type="googlefc">
  <script type="application/json">
    {
      "clientConfig": {
        "publisherIdentifier": "id"
      }
    }
  </script>
</amp-consent>
```

## Configuration (`clientConfig`)

| Attribute           |  Type  | Mandatory | Description                                                                                                                                           |
| ------------------- | :----: | :-------: | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| publisherIdentifier | String |    yes    | This is your publisher identifier that uniquely identifies your Google publisher account. It will be provided in the generated amp-consent extension. |
