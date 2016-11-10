# AMP HTML Extensions

AMP Extensions are either extended components or extended templates.

## AMP HTML Extended Components

Extended components must be explicitly included into the document as custom elements.

For example, to include a YouTube video in your page
include the following script in the `<head>`:

```html
<script async custom-element="amp-youtube" src="https://cdn.ampproject.org/v0/amp-youtube-0.1.js"></script>
```

Current list of extended components by category:

- [Access](#access)
- [Ads](#ads)
- [Analytics](#analytics)
- [Audio/Video](#audiovideo)
- [Dynamic lists](#dynamic-lists)
- [Forms](#forms)
- [Frames](#frames)
- [Presentation](#presentation)
- [Scripts](#scripts)
- [Social](#social)

### Access

| Component | Description |
| --------- | ----------- |
| [`amp-access`](amp-access/amp-access.md) | Provides AMP paywall and subscription support.  |

### Ads

| Component | Description |
| --------- | ----------- |
| [`amp-ad`](amp-ad/amp-ad.md) | Container to display an ad. |
| [`amp-embed`](amp-ad/amp-embed.md) | An alias to the `amp-ad` tag. |

### Analytics

| Component | Description |
| --------- | ----------- |
| [`amp-analytics`](amp-analytics/amp-analytics.md) | Captures analytics data from an AMP document. |
| [`amp-experiment`](amp-experiment/amp-experiment.md) | Conducts user experience experiments on an AMP document. |

### Audio/Video

| Component | Description |
| --------- | ----------- |
| [`amp-audio`](amp-audio/amp-audio.md) | Replaces the HTML5 `audio` tag. |
| [`amp-o2-player`](amp-o2-player/amp-o2-player.md) | Displays a AOL O2Player. |
| [`amp-brid-player`](amp-brid-player/amp-brid-player.md) | Displays a Brid.tv player. |
| [`amp-brightcove`](amp-brightcove/amp-brightcove.md) | Displays a Brightcove Video Cloud or Perform player. |
| [`amp-dailymotion`](amp-dailymotion/amp-dailymotion.md) | Displays a [Dailymotion](https://www.dailymotion.com) video. |
| [`amp-gfycat`](amp-gfycat/amp-gfycat.md) | Displays a [Gfycat](https://gfycat.com) video GIF. |
| [`amp-jwplayer`](amp-jwplayer/amp-jwplayer.md) | Displays a cloud-hosted [JW Player](https://www.jwplayer.com/). |
| [`amp-kaltura-player`](amp-kaltura-player/amp-kaltura-player.md) | Displays the Kaltura Player as used in [Kaltura's Video Platform](https://corp.kaltura.com/). |
| [`amp-reach-player`](amp-reach-player/amp-reach-player.md) | Displays a [Beachfront Reach](https://beachfrontreach.com/) video player. |
| [`amp-soundcloud`](amp-soundcloud/amp-soundcloud.md) | Displays a [Soundcloud](https://soundcloud.com/) clip. |
| [`amp-springboard-player`](amp-springboard-player/amp-springboard-player.md) | Displays a [Springboard Platform](http://publishers.springboardplatform.com/users/login) video player |
| [`amp-vimeo`](amp-vimeo/amp-vimeo.md) | Displays a Vimeo video. |
| [`amp-vine`](amp-vine/amp-vine.md) | Displays a Vine simple embed. |
| [`amp-youtube`](amp-youtube/amp-youtube.md) | Displays a YouTube video. |

### Dynamic lists

| Component | Description |
| --------- | ----------- |
| [`amp-list`](amp-list/amp-list.md) | Dynamically downloads data and creates list items using a template. |
| [`amp-live-list`](amp-live-list/amp-live-list.md) | Provides a way to display and update content live. |

### Forms

| Component | Description |
| --------- | ----------- |
| [`amp-form`](amp-form/amp-form.md) | Provides form support. |

### Frames

| Component | Description |
| --------- | ----------- |
| [`amp-iframe`](amp-iframe/amp-iframe.md) | Displays an iframe. |

### Presentation

| Component | Description |
| --------- | ----------- |
| [`amp-accordion`](amp-accordion/amp-accordion.md) | Provides a way for viewers to have a glance at the outline of the content and jump to a section of their choice at will. |
| [`amp-anim`](amp-anim/amp-anim.md) | Manages an animated image, typically a GIF. |
| [`amp-carousel`](amp-carousel/amp-carousel.md) | Displays multiple similar pieces of content along a horizontal axis. |
| [`amp-dynamic-css-classes`](amp-dynamic-css-classes/amp-dynamic-css-classes.md) | Adds several dynamic CSS class names onto the HTML element. |
| [`amp-fit-text`](amp-fit-text/amp-fit-text.md) | Expands or shrinks font size to fit the content within the space given. |
| [`amp-font`](amp-font/amp-font.md) | Triggers and monitors the loading of custom fonts. |
| [`amp-fx-flying-carpet`](amp-fx-flying-carpet/amp-fx-flying-carpet.md) | Wraps its children in a unique full-screen scrolling container allowing you to display a full-screen ad without taking up the entire viewport. |
| [`amp-image-lightbox`](amp-image-lightbox/amp-image-lightbox.md) | Allows for an “image lightbox” or similar experience. |
| [`amp-lightbox`](amp-lightbox/amp-lightbox.md) | Allows for a “lightbox” or similar experience. |
| [`amp-mustache`](amp-mustache/amp-mustache.md) | Allows rendering of [`Mustache.js`](https://github.com/janl/mustache.js/) templates. |
| [`amp-sidebar`](amp-sidebar/amp-sidebar.md) | Provides a way to display meta content intended for temporary access such as navigation, links, buttons, menus. |
| [`amp-sticky-ad`](amp-sticky-ad/amp-sticky-ad.md) | Provides a way to display and stick ad content at the bottom of the page.|
| [`amp-user-notification`](amp-user-notification/amp-user-notification.md) | Displays a dismissable notification to the user. |

### Scripts

| Component | Description |
| --------- | ----------- |
| [`amp-install-serviceworker`](amp-install-serviceworker/amp-install-serviceworker.md) | Installs a ServiceWorker. |

### Social

| Component | Description |
| --------- | ----------- |
| [`amp-facebook`](amp-facebook/amp-facebook.md) | Displays a Facebook post or video. |
| [`amp-gfycat`](amp-gfycat/amp-gfycat.md) | Displays a [Gfycat](https://gfycat.com) video GIF. |
| [`amp-instagram`](amp-instagram/amp-instagram.md) | Displays an Instagram embed. |
| [`amp-pinterest`](amp-pinterest/amp-pinterest.md) | Displays a Pinterest widget or Pin It button. |
| [`amp-reddit`](amp-reddit/amp-reddit.md) | Displays a Reddit post or comment. |
| [`amp-social-share`](amp-social-share/amp-social-share.md) | Displays a social share button. |
| [`amp-twitter`](amp-twitter/amp-twitter.md) | Displays a Twitter tweet. |
| [`amp-vine`](amp-vine/amp-vine.md) | Displays a Vine simple embed. |


## AMP HTML Extended Templates

See the [AMP template spec](../spec/amp-html-templates.md) for details about supported templates.
