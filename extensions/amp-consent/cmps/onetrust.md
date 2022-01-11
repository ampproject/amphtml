# OneTrust

## Example

```html
<amp-consent id="consent" layout="nodisplay" type="onetrust">
  <script type="application/json">
    {
      "postPromptUI": "onetrust-consent-prompt-ui",
      "clientConfig": {
        "CMP_id": "ac6c1ea9-9ac8-460e-a132-b328dea3f56f-test",
        "Env": "App",
        "Opt_Out": "C0004"
      }
    }
  </script>
  <div id="onetrust-consent-prompt-ui">
    Post Prompt UI
    <button on="tap:consent.prompt(consent=onetrust)">
      Privacy Settings
    </button>
  </div>
</amp-consent>
```

## Notes

### `postPromptUI`

The value of `postPromptUI` should be the id of the html tag in which the consent ui will be attached to. In our example above, the value of `postPromptUI` is `onetrust-consent-prompt-ui` since we have a div with that id.

### Opening the Preference Center

Notice in the example above, we have a `button` with the attribute `on="tap.consent.prompt(consent=onetrust)"` with the text "Privacy Settings". The id of your `<amp-consent>` element is relevant here. Notice how the id of our `<amp-consent>` is `consent`, that's why the `on` attribute has the value "tap.**consent**.prompt(consent=onetrust)". This button is required if using IAB TCF 2.0, but the button text and position can be changed.

## Configuration (`clientConfig`)

| Attribute |  Type  | Mandatory | Description                                                                                                                                                                                                |
| --------- | :----: | :-------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CMP_id    | String |    yes    | This your domain script ID, if can be found in the data-domain-script attribute of your script tag.                                                                                                        |
| Env       | String |    yes    | This is the environment of where your OneTrust account is hosted. This affects which domain your script is being served from. Options include: "App", "App-eu", "App-de", "App-uk", "CookiePro"            |
| Opt_Out   | String |    Yes    | This indicates which cookie category id should be used to return a rejection or acceptance to AMP. Recommend using your Targeting Ads category, which has a default id of C0004 (your id may be different) |

## Getting Help

For more information on how to integrate AMP to your page please visit our [support portal](http://my.onetrust.com/) or contact your technical account manager directly.
