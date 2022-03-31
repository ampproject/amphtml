---
$category@: presentation
formats:
  - stories
teaser:
  text: A configurable, templated shopping experience in AMP story pages.
tags:
  - shopping
author: philipbell
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

<amp-img alt="An example of amp story shopping tag in each type of configuration" src="https://user-images.githubusercontent.com/3860311/152416815-61a63a88-76c0-4ae8-9300-a7ad277dbe7a.jpg" layout="intrinsic" width="806" height="428">

The `amp-story-shopping` component creates configurable, templated shopping experiences within [amp-story](https://amp.dev/documentation/components/amp-story/?format=stories).

Specify an shopping experience by defining one `amp-story-shopping-attachment` and `amp-story-shopping-tag` elements for each product on the [`amp-story-page`](https://amp.dev/documentation/components/amp-story-page/?format=stories).

## amp-story-shopping-tag

<amp-img alt="An example of amp story shopping tag in each type of configuration" src="https://user-images.githubusercontent.com/3860311/155754637-3403a9dd-c4c9-44f3-ad6d-e4d166d30ad2.gif" layout="intrinsic" width="844" height="102">

Use `amp-story-shopping-tag` elements to indicate shop-able elements within [`amp-story-page`](https://amp.dev/documentation/components/amp-story-page/?format=stories).
Tapping them opens a product description page (PDP) within the `amp-story-shopping-attachment`.

-   They must be a child of [`amp-story-grid-layer`](https://amp.dev/documentation/components/amp-story-grid-layer/).
-   They are (positioned `absolute`)[https://developer.mozilla.org/en-US/docs/Web/CSS/position#values]. Use custom CSS to place them on the page.
-   Use `top` and `left` CSS rules with percentage based units for responsive placement.

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

Example of positioning a amp-story-shopping-tag and testing responsiveness:
<amp-img alt="An example of positioning an amp story shopping tag and teseting responsiveness" src="https://user-images.githubusercontent.com/3860311/155751130-558b5ab6-1db3-4ca7-b913-4be4761fdb29.gif" layout="intrinsic" width="840" height="543">

### Attributes

#### `data-product-id` {string} required

Used to associate the tag with product data.
It should be equal to the `productId` value of the associated product's JSON data.

### Customization

#### Custom Icon

<amp-img alt="An example of a custom icon in an amp story shopping tag" src="https://user-images.githubusercontent.com/3860311/155755923-92261f23-0e23-4ec7-9d6c-c1c7b62882d7.png" layout="intrinsic" width="129" height="46">

A shopping tag icon renders by default.
Render a custom icon by specifying a url to a `jpg` or `png` as the `productIcon` value in the associated product's JSON data.
Recommended image size is 48 x 48px;

#### Custom Text

<amp-img alt="An example of custom text in amp story shopping tag" src="https://user-images.githubusercontent.com/3860311/155756003-4f4b9967-d40d-452e-99f2-ca445ac65a3b.png" layout="intrinsic" width="182" height="54">

By default the item's price renders.
Render custom text by defining `productTagText` in the associated product's JSON data.
A maximum of two lines will display.
Ellipses will display if the text is too long.

Diagram demonstrating how product JSON renders within `amp-story-shopping-tag`.

<amp-img alt="A diagram of product data rendering in amp story shopping tag" src="https://user-images.githubusercontent.com/3860311/155763007-92858806-44df-41fa-8804-f0767741e28a.jpg" layout="intrinsic" width="806" height="411">

## amp-story-shopping-attachment

<amp-img alt="A short video showing opening and navigating through an amp story shopping attachment" src="https://user-images.githubusercontent.com/3860311/155758474-3fa4e666-c1a9-44d3-bbf6-61dc3fe16498.gif" layout="intrinsic" width="338" height="548">

The `amp-story-shopping-attachment` renders a tap-able CTA that opens an inline shopping experience.
Product JSON data must be configured and at least one `amp-story-shopping-tag` must be on the same page.

### Product JSON configuration

Product data JSON is configured by either:

-   inline JSON as a child script tag (required)
-   a `src` attribute (will override inline JSON)

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

### Attributes

#### `src` {string} optional

A url for remote product JSON data. When defined it will override inline JSON.

#### theme {string} optional

"light" (default) and "dark" values are accepted.

### Templates

Two types of templates render within the shopping attachment.

-   Product Listing Page (PLP)
-   Product Details Page (PDP)

#### Product Listing Page (PLP)

<amp-img alt="An example of a product listing page" src="https://user-images.githubusercontent.com/3860311/155760155-a27dfeed-0ae4-4e95-b043-cab1a47ec4e4.png" layout="intrinsic" width="335" height="547">

The PLP template renders a list of products on the active [`amp-story-page`](https://amp.dev/documentation/components/amp-story-page/?format=stories).
Open it by tapping the "Shop Now" CTA.
At least two associated `amp-story-shopping-tag` elements must be on the page for the PLP render.
If only one product is on the page the Product Description Page will render when tapping the "Shop Now" CTA.

Diagram demonstrating how product JSON renders within the PLP template.
<amp-img alt="A diagram of product data rendering in the PLP template" src="https://user-images.githubusercontent.com/3860311/160697611-f0e8cfd3-5470-4d0b-b24c-003b9ddec860.jpg" layout="intrinsic" width="806" height="633">

#### Product Details Page (PDP)

<amp-img alt="An example of a product details page" src="https://user-images.githubusercontent.com/3860311/161086888-9ac081c2-642d-466c-bf36-1ac6169ce764.png" layout="intrinsic" width="335" height="536">

The PDP template displays detailed information about the active product.
Tapping an `amp-story-shopping-tag` will open the product's PDP.
It can also be accessed by tapping the product's card within the PLP.

Diagram demonstrating how product JSON renders within the PDP template.
<amp-img alt="A diagram of product data rendering in the PDP template" src="https://user-images.githubusercontent.com/3860311/160697640-44bb55c5-3e26-48fd-b2ae-d16a05f71038.jpg" layout="intrinsic" width="806" height="425">

## Validation

See validation rules in [amp-story-shopping validator](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story-shopping/validator-amp-story-shopping.protoascii).
