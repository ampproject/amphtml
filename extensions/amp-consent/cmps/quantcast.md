# Quantcast

## Example

```html
    <amp-consent id="quantcast" layout="nodisplay" type="quantcast">
        <script type="application/json">
          {
            "postPromptUI": "quantcast-post-prompt",
            "clientConfig": {
              "coreConfig": {
                "googleEnabled": true
              }
            }
          }
        </script>
        <div id="quantcast-post-prompt">
          <button on="tap:consent.prompt(consent=quantcast)">Privacy settings</button>
        </div>
    </amp-consent>
```

## Notes

### `postPromptUI`

The value of `postPromptUI` should be the id of the html tag in which the consent ui will be attached to. In our example above, the value of `postPromptUI` is `quantcast-post-prompt` since we have a div with that id.

## Configuration

Visit the [Privacy Portal](https://www.quantcast.com/protect/sites) to get a tag with your latest configuration.

## Getting Help

For more information on how to integrate AMP to your page please visit our [help portal](https://help.quantcast.com/hc/en-us/categories/360002940873-Quantcast-Choice) or contact your account manager directly.
