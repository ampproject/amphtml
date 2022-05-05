---
$category@: presentation
formats:
  - stories
teaser:
  text: A configurable, templated shopping experience in AMP story pages.
tags:
  - shopping
author: philipbell
toc: true
$title: amp-story-shopping
version: '0.1'
versions:
  - '0.1'
latest_version: '0.1'
$path: /documentation/components/amp-story-shopping.html
$localization:
  path: '/{locale}/documentation/components/amp-story-shopping.html'
scripts:
  - >-
    <script async custom-element="amp-story-shopping" src="https://cdn.ampproject.org/v0/amp-story-shopping-0.1.js"></script>
---

# amp-story-shopping

<amp-img alt="An example of user flow within amp story shopping" src="https://user-images.githubusercontent.com/3860311/152416815-61a63a88-76c0-4ae8-9300-a7ad277dbe7a.jpg" layout="intrinsic" width="806" height="428"></amp-img>

Use `amp-story-shopping` to create configurable, templated shopping experiences within [amp-story](https://amp.dev/documentation/components/amp-story/?format=stories).

`amp-story-shopping` is defined in the document using its two custom elements, [`amp-story-shopping-attachment`](#amp-story-shopping-attachment) and [`amp-story-shopping-tag`](#amp-story-shopping-tag).

Specify a shopping experience by defining one [`amp-story-shopping-attachment`](#amp-story-shopping-attachment) and one or more [`amp-story-shopping-tag`](#amp-story-shopping-tag) elements for each product on the [`amp-story-page`](https://amp.dev/documentation/components/amp-story-page/?format=stories).

## amp-story-shopping-tag

<amp-img alt="An example of amp-story-shopping-tag in each type of configuration" src="https://user-images.githubusercontent.com/3860311/155754637-3403a9dd-c4c9-44f3-ad6d-e4d166d30ad2.gif" layout="intrinsic" width="488" height="102"></amp-img>

Use [`amp-story-shopping-tag`](#amp-story-shopping-tag) elements to indicate shop-able elements within [`amp-story-page`](https://amp.dev/documentation/components/amp-story-page/?format=stories).

Tapping them opens a [product details page (PDP)](<#product-details-page-(PDP)>) within the [`amp-story-shopping-attachment`](#amp-story-shopping-attachment).

They must be a child of [`amp-story-grid-layer`](https://amp.dev/documentation/components/amp-story-grid-layer/).

They are positioned [`absolute`](https://developer.mozilla.org/en-US/docs/Web/CSS/position#values). Use custom CSS to place them on the page using `top` and `left` with percentage based units for a responsive layout.

```html
...
<style amp-custom>
  [data-product-id="product1"] {
    top: 30%;
    left: 30%;
  }
</style>
...
<amp-story-grid-layer template="vertical">
  <amp-story-shopping-tag data-product-id="product1"></amp-story-shopping-tag>
</amp-story-grid-layer>
```

Example of positioning an [`amp-story-shopping-tag`](#amp-story-shopping-tag) and testing responsiveness:
<amp-img alt="An example of positioning an amp-story-shopping-tag and testing responsiveness" src="https://user-images.githubusercontent.com/3860311/155751130-558b5ab6-1db3-4ca7-b913-4be4761fdb29.gif" layout="intrinsic" width="840" height="543"></amp-img>

### `amp-story-shopping-tag` attributes

#### `data-product-id` {string} required

Associates the [`amp-story-shopping-tag`](#amp-story-shopping-tag) with product data.
Must be equal to the `productId` value of the associated product's JSON data.

### Customization

#### Custom icon

<amp-img alt="An example of a custom icon in an amp story shopping tag" src="https://user-images.githubusercontent.com/3860311/155755923-92261f23-0e23-4ec7-9d6c-c1c7b62882d7.png" layout="intrinsic" width="129" height="46"></amp-img>

A shopping tag icon renders by default.
You may replace the default shopping tag icon with a custom icon by specifying a url to a `jpg` or `png` as the `productIcon` value in the associated product's JSON data.
Recommended image size is 48 x 48px;

#### Custom text

<amp-img alt="An example of custom text in amp story shopping tag" src="https://user-images.githubusercontent.com/3860311/155756003-4f4b9967-d40d-452e-99f2-ca445ac65a3b.png" layout="intrinsic" width="182" height="54"></amp-img>

The item's price renders by default.
You may replace the default text with custom text by defining `productTagText` in the associated product's JSON data.
A maximum of two lines will display.
Ellipses will display if the text is too long.

Diagram demonstrating how product JSON renders within [`amp-story-shopping-tag`](#amp-story-shopping-tag):
<amp-img alt="A diagram of product data rendering in amp story shopping tag" src="https://user-images.githubusercontent.com/3860311/155763007-92858806-44df-41fa-8804-f0767741e28a.jpg" layout="intrinsic" width="806" height="411"></amp-img>

## amp-story-shopping-attachment

<amp-img alt="An example of opening the attachment and navigating through an amp story shopping attachment" src="https://user-images.githubusercontent.com/3860311/155758474-3fa4e666-c1a9-44d3-bbf6-61dc3fe16498.gif" layout="intrinsic" width="338" height="548"></amp-img>

The [`amp-story-shopping-attachment`](#amp-story-shopping-attachment) renders a tappable CTA button with the text "Shop now" that opens an inline shopping experience.
Product JSON data must be configured and at least one [`amp-story-shopping-tag`](#amp-story-shopping-tag) must be on the same page.

### Product JSON configuration

Product JSON is configured inline as a child script tag. An optional `src` attribute will fetch data from an endpoint at render time. If `src` is defined it overrides the inline configuration.

Using `src` with inline JSON as a fallback is recommended.
Inline data may be served from cache which may take time to propogate. `src` JSON is fetched at time of render which ensurs it is up-to-date.

```html
{
   items: [
      {
         productUrl: "...", // Required. String. Links to the products website.
         productId: "..." // Required. Keys to amp-story-shopping-tag nodes.
         productBrand: "...", // Optional. String.
         productIcon: "...", // Optional. Links to an image. Defaults to a shopping bag icon.
         productTitle: "...", // Required. String.
         productPrice: 100, // Required. Number.
         productPriceCurrency: "..." // Required. String. ISO 4217 currency code used to display the correct currency symbol.
         productImages: [ // Required. Must have at least one entry. Array of objects.
            {
               url: "..." // Required. String.
               altText: "..." // Required. String.
            }
         ],
         productDetails: "...", // Required. String.
         aggregateRating: { // Optional. All sub fields are required if defined.
            "ratingValue": 4.4, // Required. Number.
            "reviewCount": 89, // Required. Number.
            "reviewUrl": // Required. String. Links to page where user can read reviews.
         }
      }
   ]
}
```

### Product JSON schema

See the schema for product JSON validation in [product.schema.json](https://github.com/ampproject/amphtml/blob/main/examples/amp-story/shopping/product.schema.json).
If validation fails on one or more of the shopping tags, an error message will be displayed, and the tag and product details / listing associated with the product(s) that have errors will not be rendered.
Validation is performed with [ajv](https://ajv.js.org/json-schema.html) using the default ajv JSON schema draft.

### amp-story-shopping-attachment attributes

#### `src` {string} optional

A url for remote product JSON configuration. When defined it overrides inline JSON configuration.

#### `theme` {string} optional

Sets the color of the CTA button and drawer.
"light" (default) and "dark" values are accepted.
<amp-img alt="An example of color themed buttons" src="https://user-images.githubusercontent.com/3860311/164291421-b2ec3044-0867-4dca-84a1-01985e9dc958.png" layout="intrinsic" width="920" height="141"></amp-img>

#### `cta-text` {string} optional

String that customizes the call to action button text. The default is "Shop now".

### amp-story-shopping-attachment templates

Two types of templated pages render within the shopping attachment. They automatically populate with the product data from the configured JSON. the Product listing page (PLP) is a list of all products on the active story page. The Product details page (PDP) displays in-depth detail about the product such as images, text and a "Buy now" button.

#### Product listing page (PLP)

<amp-img alt="An example of a product listing page" src="https://user-images.githubusercontent.com/3860311/155760155-a27dfeed-0ae4-4e95-b043-cab1a47ec4e4.png" layout="intrinsic" width="335" height="547"></amp-img>

The PLP template renders a list of products on the active [`amp-story-page`](https://amp.dev/documentation/components/amp-story-page/?format=stories).
Open it by tapping the "Shop now" CTA button that automatically displays on the bottom of the page when the shopping experience is configured.
At least two associated [`amp-story-shopping-tag`](#amp-story-shopping-tag) elements must be on the page for the PLP render.

Diagram demonstrating how product JSON renders within the PLP template:
<amp-img alt="A diagram of product data rendering in the PLP template" src="https://user-images.githubusercontent.com/3860311/160697611-f0e8cfd3-5470-4d0b-b24c-003b9ddec860.jpg" layout="intrinsic" width="806" height="633"></amp-img>

#### Product details page (PDP)

<amp-img alt="An example of a product details page" src="https://user-images.githubusercontent.com/3860311/161086888-9ac081c2-642d-466c-bf36-1ac6169ce764.png" layout="intrinsic" width="335" height="536"></amp-img>

The PDP template displays detailed information about a product.
Tapping an [`amp-story-shopping-tag`](#amp-story-shopping-tag) or the product's card within the PLP will open the product's PDP.
If only one product is on the page the PDP will render by default when tapping the "Shop now" CTA button.

Diagram demonstrating how product JSON renders within the PDP template:
<amp-img alt="A diagram of product data rendering in the PDP template" src="https://user-images.githubusercontent.com/3860311/160697640-44bb55c5-3e26-48fd-b2ae-d16a05f71038.jpg" layout="intrinsic" width="3580" height="3222"></amp-img>

## Validation

See validation rules in [amp-story-shopping validator](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story-shopping/validator-amp-story-shopping.protoascii).
