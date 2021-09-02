# Pubtech

## Example

```html
    <amp-consent id="pubtech" layout="nodisplay" type="pubtech">
        <script type="application/json">
          {
            "postPromptUI": "pubtech-post-prompt",
            "clientConfig": {
              "privacyUrl": "",
              "isAmp": true,
              "websiteName": "Pubtech"
            }
          }
        </script>
        <div id="pubtech-post-prompt">
          <button on="tap:consent.prompt(consent=pubtech)">Privacy settings</button>
        </div>
    </amp-consent>
```

## Notes

### `postPromptUI`

The value of `postPromptUI` should be the id of the html tag in which the consent ui will be attached to. In our example above, the value of `postPromptUI` is `pubtech-post-prompt` since we have a div with that id.

## Configuration

Visit the [CMP Section](https://www.pubtech.ai/) to get a full description of our configuration options.

## Getting Help

For more information on how to integrate our CMP AMP to your page please contact your account manager directly.
