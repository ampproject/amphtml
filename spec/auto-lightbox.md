# Auto-lightbox

**This feature is experimental and activated by the `amp-auto-lightbox` experiment.**
This will be gradually rolled out to production in the upcoming weeks.

The standard AMP runtime finds elligible [`amp-img`](https://www.ampproject.org/docs/reference/components/amp-img)
elements and automatically makes them clickable in order to open an [`amp-lightbox-gallery`](https://www.ampproject.org/docs/reference/components/amp-lightbox-gallery)
for enhanced user experience that includes panning and pinch-to-zoom.

Please note that this treatment is only applied on documents loaded from `http://*.cdn.ampproject.org`,
effectively only for those that come from Google Search results. 

Documents also need to contain either of the following:

- an [OpenGraph](http://ogp.me/) `<meta property="og:type" content="article">` tag
- or a `@type` field declared in [JSON+LD schema](https://www.ampproject.org/docs/fundamentals/discovery#use-schema.org-for-most-search-engines)
  that's any of the following:
  - `Article`
  - `NewsArticle`
  - `BlogPosting`
  - `LiveBlogPosting`
  - `DiscussionForumPosting`
  
Documents that explicitly use `amp-lightbox-gallery` are excluded from this treatment.

## Excluded images

Images are clickable by default and should not be automatically lightboxed in any of the following cases:

- the image or any of its ancestors has an [`on="tap: ..."` action](./amp-actions-and-events.md)
- any of its ancestors is `a[href]`, `amp-selector [option]` or `button`

They're also excluded when they're inside any of the following:

- `amp-script`
- `amp-story`
- `amp-lightbox`
- `amp-carousel` will likely be treated specially in the future, but as of now, it's excluded.

## Disabling treatment explicitly

The runtime uses certain criteria to determine whether an `amp-img` can be lightboxed. By default, some
sizing constraints have to be met, and the `amp-img` should not already be clickable.

However, if you find this treatment undesirable, you can disable it on any element from `<body>` down by setting
the `data-amp-auto-lightbox-disable` attribute.

For example, if you'd like to disable it on a particular image, you can do:

```html
<amp-img src="my-image.png" ... data-amp-auto-lightbox-disable>
</amp-img>
```

To disable it on a particular document section:

```html
<section data-amp-auto-lightbox-disable>
  <!-- No elements inside this tree will be automatically lightboxed -->
</section>
```

Or to disable it for your entire document altogether:

```html
<body data-amp-auto-lightbox-disable>
  <!-- No elements in the document will be automatically lightboxed -->
</body>
```

If you'd like manual tuning of disabled/enabled images and/or grouping, please use
[`amp-lightbox-gallery`](https://www.ampproject.org/docs/reference/components/amp-lightbox-gallery)
directly.
