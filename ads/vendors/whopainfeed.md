# Whopa InFeed

## Example installation of the InFeed widget

### Basic

```html
<amp-embed
  width="100"
  height="100"
  type="whopainfeed"
  layout="responsive"
  heights="(min-width:1907px) 39%, (min-width:1200px) 46%, (min-width:780px) 64%, (min-width:480px) 98%, (min-width:460px) 167%, 196%"
  data-siteId="1234"
  data-template="default"
>
</amp-embed>
```

## Configuration

For details on the configuration, please contact Whopa Team support@whopa.net \
These configurations are relevant for both `<amp-ad />` and `<amp-embed />`.

### Required parameters

-   `data-siteId`: Site ID provided by Whopa InFeed Team.

### Optional parameters

-   `data-template`: The Template of Widget.

**Resolution**

You can set an initial height of what the widget height is supposed to be. That is, instead of `height="100"`, if the widget's final height is 600px, then set `height="600"`. Setting the initial height **_will not_** finalize the widget height if it's different from the actual. The widget will resize to it's true dimensions after the widget leaves the viewport.
