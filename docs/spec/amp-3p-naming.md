# Naming third-party components

AMP differentiates between "first-party" and "third-party" [components](https://amp.dev/documentation/components/):

-   First-party components are those that work independently, regardless of a specific external service. These are generic. These are first-party components:

    -   `<amp-sidebar>`
    -   `<amp-list>`
    -   `<amp-iframe>`[<sup>[1]</sup>](#amp-iframe-first-party)
    -   etc.

-   Third-party components are those that embed functionality provided by a service separate from the AMP runtime, usually through an embedded [`<iframe>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe). These always depend on the same specific service. These are third-party components:

    -   `<amp-facebook>`
    -   `<amp-gfycat>`
    -   `<amp-subscriptions-google>`
    -   etc.

The goal of these guidelines is to **disambiguate between first and third-party components through their names**, so that a component provided by a third-party service is not confused with a generic one.

## Guideline 1: Third party components must contain a brand name

Since third-party services are usually bundled as a product, the component must contain its associated brand name:

-   ✅ This is **OK**: `<amp-facebook-comments>`
-   ❌ This is **not OK**: `<amp-comments>`

**Exception**: Brand name may be confused with a component that's generic

Let's imagine a service named **_Toast.io_**. Regardless of what the service provides, naming a component for this service "`<amp-toast>`" would be bad, since it can be confused for the generic term for [a "toast" component](https://google.com/search?q=toast+component). In this case, the name must communicate that it's a third-party embed:

-   ❌ This is **not OK**: `<amp-toast>`
-   ✅ This is **OK**: `<amp-embed-toast>`
-   ✅ This is **OK**: `<amp-toast-io>`

## Guideline 2: Media players must be named as such

Names for third-party products may fail to communicate their purpose, so all media player names (like a video or audio player) must end with `-player`. This provides an affordance by convention: third-party media player components are always annotated as such.[<sup>[2]</sup>](#no-player-suffix)

Let's imagine a video provider named **_UltraVideo_**:

-   ❌ This is **not OK**: `<amp-ultra-video>`
-   ✅ This is **OK**: `<amp-ultra-video-player>`
-   ✅ This is **even better**: `<amp-ultra-video-embed-player>`

---

### <a id="amp-iframe-first-party"></a> <sup>1</sup> Why are `<amp-iframe>` or `<amp-video-iframe>` considered first-party?

The URL that these components embed is interchangeable, since their src attribute is configurable by the page's author to point to any third-party endpoint, or the author's own endpoint.

### <a id="no-player-suffix"></a> <sup>2</sup> Why is `<amp-youtube>` not suffixed like `<amp-youtube-player>`?

Several media player components names lack the -player prefix, like `<amp-youtube>` and all those the apply in the [video player list](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-video-interface.md). These were historically created before this guideline.
