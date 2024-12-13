# Auto-lightbox

The standard AMP runtime finds elligible [`amp-img`](https://amp.dev/documentation/components/amp-img)
elements and automatically makes them clickable in order to open an [`amp-lightbox-gallery`](https://amp.dev/documentation/components/amp-lightbox-gallery)
for enhanced user experience that includes panning and pinch-to-zoom.

Including the [`amp-lightbox-gallery` extension script](https://amp.dev/documentation/components/amp-lightbox-gallery/) and [using it explicitly](https://amp.dev/documentation/components/amp-lightbox-gallery/#usage) (by setting the `lightbox` attribute on a valid element) disables the auto-lightbox treatment on a document.

Otherwise, it's applied only on documents that contain either of the following:

-   **a.** an [OpenGraph](http://ogp.me/) `<meta property="og:type" content="article">` tag
-   **b.** ...or a `@type` field declared in [JSON+LD schema](https://amp.dev/documentation/guides-and-tutorials/optimize-and-measure/discovery#use-schema.org-for-most-search-engines)
    that's any of the following:
    -   `Article`
    -   `NewsArticle`
    -   `BlogPosting`
    -   `LiveBlogPosting`
    -   `DiscussionForumPosting`

## Excluded images

Images are clickable by default and should not be automatically lightboxed in any of the following cases:

-   the image or any of its ancestors has an [`on="tap: ..."` action](./amp-actions-and-events.md)
-   any of its ancestors is `a[href]`, `amp-selector [option]` or `button`

They're also excluded when they're inside any of the following:

-   `amp-script`
-   `amp-story`
-   `amp-lightbox`
-   `amp-carousel` will likely be treated specially in the future, but as of now, it's excluded.

## Disabling treatment explicitly

The runtime uses certain criteria to determine whether an `amp-img` can be lightboxed. By default, some
sizing constraints have to be met, and the `amp-img` should not already be clickable.

However, if you find this treatment undesirable, you can disable it on any element from `<body>` down by setting
the `data-amp-auto-lightbox-disable` attribute.

For example, if you'd like to disable it on a particular image, you can do:

```html
<amp-img src="my-image.png" ... data-amp-auto-lightbox-disable> </amp-img>
```

To disable it on a particular document section:

```html
<section data-amp-auto-lightbox-disable>
  <!-- No elements inside this tree will be automatically lightboxed -->
</section>
```

To disable it for your entire document altogether:

```html
<body data-amp-auto-lightbox-disable>
  <!-- No elements in the document will be automatically lightboxed -->
</body>
```

Or to prevent automatically loading of `amp-auto-lightbox` script on page load:

```html
<html ⚡ lang="en" data-amp-auto-lightbox-disable>
  <!-- Prevent automatically loading of `amp-auto-lightbox` script on page-load -->
</html>
```

If you'd like manual tuning of disabled/enabled images and/or grouping, please use
[`amp-lightbox-gallery`](https://amp.dev/documentation/components/amp-lightbox-gallery)
directly.
