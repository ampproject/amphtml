# MANTIS® Ad Network

Please visit the [MANTIS® Ad Network website](https://www.mantisadnetwork.com) for more information about MANTIS. If you have an issues implementing these tags, please [contact MANTIS](http://www.mantisadnetwork.com/contact/).

## Examples

### Display Ads

```html
<amp-ad
  width="300"
  height="250"
  type="mantis-display"
  data-property="demo"
  data-zone="medium-rectangle"
>
</amp-ad>
```

Supported parameters:

-   `data-property`
-   `data-zone`

### Content Recommendation

Depending on your page design, you may need to play with the `"heights="` parameter to ensure the styling works for your layout.

```html
<amp-embed
  width="100"
  height="283"
  type="mantis-recommend"
  layout="responsive"
  heights="(min-width:1907px) 56%, (min-width:1100px) 64%, (min-width:780px) 75%, (min-width:480px) 105%, 200%"
  data-property="demo"
>
</amp-embed>
```

Supported parameters:

-   `data-property`
-   `data-css` (Overrides the default CSS embedded by the script)
