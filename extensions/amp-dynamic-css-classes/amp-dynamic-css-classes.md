---
$category@: presentation
formats:
  - websites
teaser:
  text: Adds several dynamic CSS class names onto the <body> element.
---

# AMP Dynamic CSS Classes

## Behavior

The AMP Dynamic CSS Classes extension adds the following CSS classes
onto the `<body>` element:

**amp-referrer-\***

One or more referrer classes will be set, one for each level of
subdomain specificity. For example, `www.google.com` will add three
classes: `amp-referrer-www-google-com`, `amp-referrer-google-com`, and
`amp-referrer-com`.

We currently have a few special cases:

-   When the user came through a Twitter `t.co` short link, we instead use
    `twitter.com` as the referrer.
-   When the string "Pinterest" is present in the User Agent string and
    there is no referrer, we use `www.pinterest.com` as the referrer.

**amp-viewer**

The `amp-viewer` class will be set if the current document is being
displayed inside a Viewer.
