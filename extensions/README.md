# AMP HTML Extensions

AMP Extensions are either extended components or extended templates.

## AMP HTML Extended Components

Extended components must be explicitly included into the document as custom elements.

For example, to include a youtube video in your page
include the following script in the `<head>`:

```html
<script async custom-element="amp-youtube" src="https://cdn.ampproject.org/v0/amp-youtube-0.1.js"></script>
```

Current list of extended components:

| Component | Description |
| --------- | ----------- |
| [`amp-access`](amp-access/amp-access.md) | Provides AMP paywall and subscription support.  |
| [`amp-accordion`](amp-accordion/amp-accordion.md) | Provides a way for viewers to have a glance at the outline of the content and jump to a section of their choice at will. |
| [`amp-analytics`](amp-analytics/amp-analytics.md) | Captures analytics data from an AMP document. |
| [`amp-anim`](amp-anim/amp-anim.md) | Manages an animated image, typically a GIF. |
| [`amp-audio`](amp-audio/amp-audio.md) | Replaces the HTML5 `audio` tag. |
| [`amp-brid-player`](amp-brid-player/amp-brid-player.md) | Displays a Brid.tv player. |
| [`amp-brightcove`](amp-brightcove/amp-brightcove.md) | Displays a Brightcove Video Cloud or Perform player. |
| [`amp-carousel`](amp-carousel/amp-carousel.md) | Displays multiple similar pieces of content along a horizontal axis. |
| [`amp-dailymotion`](amp-dailymotion/amp-dailymotion.md) | Displays a [Dailymotion](https://www.dailymotion.com) video. |
| [`amp-dynamic-css-classes`](amp-dynamic-css-classes/amp-dynamic-css-classes.md) | Adds several dynamic CSS class names onto the HTML element. |
| [`amp-facebook`](amp-facebook/amp-facebook.md) | Displays a Facebook post or video. |
| [`amp-fit-text`](amp-fit-text/amp-fit-text.md) | Expands or shrinks font size to fit the content within the space given. |
| [`amp-font`](amp-font/amp-font.md) | Triggers and monitors the loading of custom fonts. |
| [`amp-fx-flying-carpet`](amp-fx-flying-carpet/amp-fx-flying-carpet.md) | Wraps its children in a unique full-screen scrolling container allowing you to display a full-screen ad without taking up the entire viewport. |
| [`amp-iframe`](amp-iframe/amp-iframe.md) | Displays an iframe. |
| [`amp-image-lightbox`](amp-image-lightbox/amp-image-lightbox.md) | Allows for an “image lightbox” or similar experience. |
| [`amp-instagram`](amp-instagram/amp-instagram.md) | Displays an Instagram embed. |
| [`amp-install-serviceworker`](amp-install-serviceworker/amp-install-serviceworker.md) | Installs a ServiceWorker. |
| [`amp-jwplayer`](amp-jwplayer/amp-jwplayer.md) | Displays a cloud-hosted [JW Player](https://www.jwplayer.com/). |
| [`amp-kaltura-player`](amp-kaltura-player/amp-kaltura-player.md) | Displays the Kaltura Player as used in [Kaltura's Video Platform](https://corp.kaltura.com/). |
| [`amp-lightbox`](amp-lightbox/amp-lightbox.md) | Allows for a “lightbox” or similar experience. |
| [`amp-list`](amp-list/amp-list.md) | Dynamically downloads data and creates list items using a template. |
| [`amp-mustache`](amp-mustache/amp-mustache.md) | Allows rendering of [`Mustache.js`](https://github.com/janl/mustache.js/) templates. |
| [`amp-pinterest`](amp-pinterest/amp-pinterest.md) | Displays a Pinterest widget or Pin It button. |
| [`amp-reach-player`](amp-reach-player/amp-reach-player.md) | Displays a [Beachfront Reach](https://beachfrontreach.com/) video player. |
| [`amp-sidebar`](amp-sidebar/amp-sidebar.md) | Provides a way to display meta content intended for temporary access such as navigation, links, buttons, menus. |
| [`amp-social-share`](amp-social-share/amp-social-share.md) | Displays a social share button. |
| [`amp-soundcloud`](amp-soundcloud/amp-soundcloud.md) | Displays a [Soundcloud](https://soundcloud.com/) clip. |
| [`amp-springboard-player`](amp-springboard-player/amp-springboard-player.md) | Displays a [Springboard Platform](http://publishers.springboardplatform.com/users/login) video player |
| [`amp-twitter`](amp-twitter/amp-twitter.md) | Displays a Twitter tweet. |
| [`amp-user-notification`](amp-user-notification/amp-user-notification.md) | Displays a dismissable notification to the user. |
| [`amp-vimeo`](amp-vimeo/amp-vimeo.md) | Displays a Vimeo video. |
| [`amp-vine`](amp-vine/amp-vine.md) | Displays a Vine simple embed. |
| [`amp-youtube`](amp-youtube/amp-youtube.md) | Displays a YouTube video. |


## AMP HTML Extended Templates

NOT LAUNCHED YET

Extended templates must be explicitly included into the document as custom templates.

For example, to include an amp-mustache template in your page
include the following script in the `<head>`:

```html
<script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.1.js"></script>
```

Current list of extended templates:

| Component                                     | Description                                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------------------------------
| [`amp-mustache`](amp-mustache/amp-mustache.md) | Mustache template.                                       |
