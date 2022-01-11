# opencmp

## Example

```html
<amp-consent id="consent" layout="nodisplay" type="opencmp">
  <script type="application/json">
    {
      "postPromptUI": "opencmp-consent-prompt-ui"
    }
  </script>
  <div id="opencmp-consent-prompt-ui">
    Post Prompt UI
    <button on="tap:consent.prompt(consent=opencmp)">
      Privacy Settings
    </button>
  </div>
</amp-consent>
```

## Notes

### `postPromptUI`

The value of `postPromptUI` should be the id of the html tag in which the consent ui will be attached to. In our example above, the value of `postPromptUI` is `opencmp-consent-prompt-ui` since we have a div with that id.

### Opening the Privacy Manager

Notice in the example above, we have a `button` with the attribute `on="tap.consent.prompt(consent=opencmp)"`. The id of your `<amp-consent>` element is relevant here. Notice how the id of our `<amp-consent>` is `consent`, that's why the `on` attribute has the value "tap.**consent**.prompt(consent=opencmp)"

## Getting Help

For more information on how to integrate AMP to your page please contact your account manager directly.
