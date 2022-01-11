# Ogury

## Prerequisite

1. Connect to your [publisher dashboard](http://publishers.ogury.co/)
1. Create web asset for your domain, if needed
1. Use the generated asset key in the `amp-consent` component JSON configuration

## Example

```html
<amp-consent id="ogury" layout="nodisplay" type="Ogury">
  <script type="application/json">
    {
      "postPromptUI": "custom-prompt-ui",
      "clientConfig": {"assetKey": "OGY-316B32F7E5B7"},
      "uiConfig": {"overlay": true}
    }
  </script>
  <div id="custom-prompt-ui">
    Post Prompt UI
    <button on="tap:ogury.prompt(consent=Ogury)">
      Privacy Settings
    </button>
  </div>
</amp-consent>
```

## Notes

### `postPromptUI`

The value of `postPromptUI` should be the id of the html tag in which the consent ui will be attached to. In our example above, the value of `postPromptUI` is `custom-prompt-ui` since we have a div with that id.

### Opening the Privacy Manager

Notice in the example above, we have a `button` with the attribute `on="tap.ogury.prompt(consent=Ogury)"`. The id of your `<amp-consent>` element is relevant here. Notice how the id of our `<amp-consent>` is `consent`, that's why the `on` attribute has the value "tap.**consent**.prompt(consent=Ogury)"

## Configuration (`clientConfig`)

| Attribute |  Type  | Mandatory | Description                                                                             |
| --------- | :----: | :-------: | --------------------------------------------------------------------------------------- |
| assetKey  | String |    yes    | Your asset key can be found in your [publisher dashboard](http://publishers.ogury.co/). |

## Getting Help

For more information on how to integrate AMP to your page please visit our integration documentation in your [publisher dashboard](http://publishers.ogury.co/) or contact your account manager directly.
