---
$category@: presentation
formats:
  - websites
teaser:
  text: Embeds a WordPress post.
experimental: true
bento: true
---

# amp-wordpress-embed

## Behavior

This extension creates an iframe and displays the [excerpt](https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/) of a WordPress post or page.

### Standalone use outside valid AMP documents

Bento AMP allows you to use AMP components in non-AMP pages without needing to commit to fully valid AMP. You can take these components and place them in implementations with frameworks and CMSs that don't support AMP. Read more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/). To find the standalone version of `amp-my-element`, see [`bento-wordpress-embed`](./1.0/README.md).

#### Example: Embedding a WordPress post

```html
<amp-wordpress-embed
  data-url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
  layout="fixed"
  height="400"
  width="600"
>
  <button overflow>Load more</button>
</amp-wordpress-embed>
```

## Attributes

##### data-url (required)

The URL of the post to embed.

##### common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Validation

See [amp-wordpress-embed rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-wordpress-embed/validator-amp-wordpress-embed.protoascii) in the AMP validator specification.
