# ReadMo

## Example

ReadMo only requires a section code to run. Please work with your account manager to properly configure your AMP section.

### Basic

```html
<amp-embed
  width="400"
  height="320"
  type="readmo"
  layout="responsive"
  data-infinite="true"
  data-section="1234567"
>
</amp-embed>
```

### Required parameters

-   `data-section` : A unique identifier that represents your site and placement

### Optional parameters

-   `data-module` : Defines the type of module to render (`end-of-article`, `smart-feed`, `smart-feed-video`, `side-rail`)
-   `data-infinite` : If true, enables infinite feed for your module
-   `data-title` : The title that appears above the module (defaults to "You May Like")
-   `data-sponsored-by-label` : Text override to the default "Sponsored by" label that appears next to the sponsors name
-   `data-url` : Publisher url override
-   `json` : Use this to pass additional configuration properties (ex: `json='{ "contentId": 1234 }'`)
