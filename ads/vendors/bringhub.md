# Bringhub

## Example installation of the Bringhub Mini-Storefront

### Basic

```html
<amp-embed
  width="600"
  height="320"
  type="bringhub"
  layout="responsive"
  heights="(max-width: 270px) 1280px, (max-width:553px) 640px, 338px"
>
</amp-embed>
```

## Configuration

### Optional parameters

-   `htmlURL`: The URL of the standard html version of the page. Defaults to `global.context.canonicalURL`.
-   `ampURL`: The URL of the AMP version of the page. Defaults to `global.context.sourceUrl`.
-   `articleSelector`: The CSS Selector of the article body on the page. Contact your Bringhub Account Manager for requirements.
