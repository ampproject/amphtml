# Vendor-specific (3p) video player components

The generic [`amp-video`](https://go.amp.dev/c/amp-video) component plays videos directly on a page, much like a `<video>` tag.

Unfortunately, not all videos can be embedded this way. For these specialized cases, AMP provides vendor-optimized components like [`amp-youtube`](https://go.amp.dev/c/amp-youtube), [`amp-ima-video`](https://go.amp.dev/c/amp-ima-video), and [others](./amp-video-interface.md).
Internally these players load an iframe whose page communicates with the outer document to coordinate playback.

**We would prefer to not have additional custom video implementations.** Instead we believe, [`amp-video-iframe`](https://go.amp.dev/c/amp-video-iframe) should be used instead, since it is a generic component that can load any video document to coordinate playback. Instead, new integrations should come in the form of [`amp-video-iframe` configurations](https://go.amp.dev/c/amp-video-iframe#vendors). _If you believe you're unable to integrate with `amp-video-iframe`, please [file a bug report](https://github.com/ampproject/amphtml/issues/new?assignees=&labels=Type%3A+Bug&template=bug-report.yml) mentioning `@alanorozco` and `@wassgha`._

## I want to contribute my vendor-specific player

You probably do **_not_** need to build your own player.

The `amp-video-iframe` playback interface supports the following methods, which we believe cover the vast majority of cases AMP documents necessitate:

-   `play`
-   `pause`
-   `mute`
-   `unmute`
-   `showcontrols`
-   `hidecontrols`
-   `fullscreenenter`
-   `fullscreenexit`

`amp-video-iframe` can also [send custom namespaced analytics signals](<https://amp.dev/documentation/components/amp-video-iframe/#postanalyticsevent(eventtype[,-vars])>).

(If there is a feature missing from this list that a custom player requires, we are happy to work on extending it as necessary.)

If this is enough for your use case, you'd only need to build a playback document hosted on your server that's able to communicate with `amp-video-iframe`.
For guidance on accomplishing this, [refer to the component documentation.](https://go.amp.dev/c/amp-video-iframe#vendors)

(If you _cannot_ support these playback methods, it's likely that a simple [`amp-iframe`](https://go.amp.dev/c/amp-iframe)
can embed a separate video document just fine.)

Once you host your integration document, you may provide a code sample for document authors to find your service [in the AMP documentation.](https://github.com/ampproject/amphtml/blob/main/extensions/amp-video-iframe/amp-video-iframe.md)

### When _should_ I build a vendor-specific player?

If the API you require for communication includes methods that are **_not_** part of the `amp-video-iframe` playback interface, you might want to build your own player. (Please note that most custom analytics signals are not considered in this case,
since `amp-video-iframe` [also has plumbing for that.](<https://amp.dev/documentation/components/amp-video-iframe/#postanalyticsevent(eventtype[,-vars])>))

For example, these are some of the features that justify specific players:

-   **`amp-youtube`** loads initial-frame placeholder images based on a URL scheme for perceived performance.
    Its underlying implementation also loads with lower-than-default priority, since it's rather large in binary size.

-   **`amp-ima-video`** embeds a generic host-less page that ships with the IMA SDK in order to transparently include standard IMA interface videos.

(Please note that most other 3p players historically exist before `amp-video-iframe` could fulfill their use case.)

## How can I build a player component?

### Understand the contribution process

You'll need to go through [the standard AMP contribution process](../contributing.md) when creating and submitting your component. For large features, such as a video player, you need to file an [I2I (intent-to-implement) issue](https://github.com/ampproject/amphtml/issues/new?assignees=&labels=INTENT+TO+IMPLEMENT&template=intent-to-implement.yml) that describes the overall workings of your component.

Your player component is also shipped as an extension, so you should [become familiar with the process of building one.](https://github.com/ampproject/amphtml/blob/main/docs/building-an-amp-extension.md)

### Write your implementation

#### The `VideoManager`

Every player component talks to a single [`VideoManager`](../../src/service/video-manager-impl.js) via standard methods (`VideoInterface`) and events (`VideoEvents`) defined in the [AMP video interface](../../src/video-interface.js).

This manager performs standard responsibilities for all videos, regardless of type:

-   accessible, managed autoplay
-   analytics tracking for playback
-   coordination with [`amp-story`](https://go.amp.dev/c/amp-story)
-   [docked video](https://amp.dev/documentation/components/amp-video-docking/)
-   rotate-to-fullscreen

#### Interface support

Component classes should implement the [`VideoInterface`](../../src/video-interface.js).
You can implement this interface entirely or partially, depending on [the video integration features you'd like to support](./amp-video-interface.md).

At the very least, you should implement `play()` and `pause()`. Likewise, playback
[actions](https://amp.dev/documentation/guides-and-tutorials/learn/amp-actions-and-events/) (like `my-element.play`) will not work when unimplemented.

Read through [the `VideoInterface` code to understand the individual effects of leaving each method unimplemented.](../../src/video-interface.js)

#### Reference

Existing implementations for [`amp-youtube.js`](../../extensions/amp-youtube/0.1/amp-youtube.js) and [`amp-video-iframe.js`](../../extensions/amp-video-iframe/0.1/amp-video-iframe.js) are good starter examples for implementation details. They use several standard utilities for creating the video frame and communicating with the `VideoManager`.
