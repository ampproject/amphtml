---
$category@: presentation
formats:
  - websites
  - stories
teaser:
  text: A rich, visual storytelling format.
---
<!--
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# <a name="`amp-story`"></a> `amp-story`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>A rich, visual storytelling format.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>none</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><ul>
      <li>See AMP By Example's <a href="https://amp.dev/documentation/examples/introduction/stories_in_amp/">Hello World</a> sample.</li>
      <li>Learn from the <a href="https://amp.dev/documentation/guides-and-tutorials/start/visual_story/">Create a visual AMP story</a> tutorial.</li>
    </ul></td>
  </tr>
</table>

{% call callout('Important', type='caution') %}
This component is under active development. For any issues, please [file a GitHub issue](https://github.com/ampproject/amphtml/issues/new).
{% endcall %}

[TOC]

## Version notes

| Version | Description                                                            |
| ------- | ---------------------------------------------------------------------- |
| 1.0     | Current version, since 2018-07-16.                                     |
| 0.1     | Initial implementation.  Deprecated, and will be removed on 2019-03-19 |

## Migrating from 0.1 to 1.0

As of 2018-07-16, version 0.1 is considered deprecated, and will be removed on 2019-03-19.  This may cause minor breaking changes, as your stories will automatically be upgraded to use version 1.0.  We recommend manually migrating your pages to version 1.0 before this date to ensure functionality and proper design.

### New bookend capabilities

We've added new capabilities to the amp-stories bookend, enabling richer component support and visual layouts. Some of the changes include:

* Share providers are sorted according to the JSON configuration.
* New bookend components:
  * Call to action links
  * Text box
  * Portrait and landscape cards

To use these new capabilities, add an `<amp-story-bookend>` tag as the last child of your `<amp-story>` with the required attributes like so:

```html
<amp-story standalone>
  <amp-story-page id="cover">
    ...
  </amp-story-page>
  <!-- `src` and `layout=nodisplay` are required. -->
  <amp-story-bookend src="bookendv1.json" layout="nodisplay">
  </amp-story-bookend>
<amp-story>
```

Learn more about the new components and how to specify them in the JSON configuration in the [amp-story-bookend](#bookend-amp-story-bookend) section.

### New metadata requirements

We've added new metadata attributes to the `<amp-story>` element. These metadata attributes will be used for displaying a preview of the story across the AMP stories ecosystem. For example, these attributes can be used to render an engaging preview link in the bookend of a related story. Providing these attributes will also help ensure your story is future-proof for rich, embedded experiences in AMP stories surfaces to come.

```html
<!-- `title`, `publisher`, `publisher-logo-src` and `poster-portrait-src` will soon be required. -->
<amp-story standalone title="My Story"
    publisher="The AMP Team"
    publisher-logo-src="https://example.com/logo/1x1.png"
    poster-portrait-src="https://example.com/my-story/poster/3x4.jpg">

<!-- `poster-square-src` and `poster-landscape-src` are optional, but strongly recommended. -->
<amp-story standalone title="My Story"
    publisher="The AMP Team"
    publisher-logo-src="https://example.com/logo/1x1.png"
    poster-portrait-src="https://example.com/my-story/poster/3x4.jpg"
    poster-square-src="https://example.com/my-story/poster/1x1.jpg"
    poster-landscape-src="https://example.com/my-story/poster/4x3.jpg">
```

Note that these metadata attributes supplement and do not replace any Structured Data (e.g. JSON-LD) on the page. We still recommend adding [Structured Data](https://developers.google.com/search/docs/data-types/article#amp-sd) to all your AMP pages, including AMP stories.

The new attributes:

| ATTRIBUTE | DESCRIPTION |
| -- | -- |
| `title` [required] | The title of the story. |
| `publisher` [required] | The name of the story's publisher. |
| `publisher-logo-src` [required] | The publisher's logo in square format (1x1 aspect ratio). |
| `poster-portrait-src` [required] | The story poster in portrait format (3x4 aspect ratio). |
| `poster-square-src` | The story poster in square format (1x1 aspect ratio). |
| `poster-landscape-src` | The story poster in landscape format (4x3 aspect ratio). |

#### `publisher-logo-src` guidelines

The following guidelines apply to the image for the publisher logo:

- The file should be a raster file, such as `.jpg`, `.png`, or `.gif`.  Avoid vector files, such as `.svg` or `.eps`.
- Avoid animated images, such as animated gifs.
- The graphic part of the logo should be legible on the background color.

<table>
  <tr>
    <td>
      <amp-img alt="Logo with blue text on white background"
          layout="fixed"
          width="107" height="112"
          src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/publisher-logo-1.png" >
        <noscript>
          <img alt="Logo with blue text on white background" src="img/publisher-logo-1.png" />
        </noscript>
      </amp-img>
      Preferred
    </td>
    <td>
      <amp-img alt="Logo with white text on blue background"
          layout="fixed"
          width="107" height="101"
          src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/publisher-logo-2.png" >
        <noscript>
          <img alt="Logo with white text on blue background" src="img/publisher-logo-2.png" />
        </noscript>
      </amp-img>
      Preferred
    </td>
    <td>
      <amp-img alt="Logo with blue text on blue background"
          layout="fixed"
          width="103" height="102"
          src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/publisher-logo-3.png" >
        <noscript>
          <img alt="Logo with blue text on blue background" src="img/publisher-logo-3.png" />
        </noscript>
      </amp-img>
      Avoid this
    </td>
  </tr>
</table>

- The logo shape should be a square, not a rectangle.
- The background color should not be transparent.
- Use one logo per brand that is consistent across AMP stories.
- The logo should be at least 96x96 pixels.

#### Poster guidelines (for `poster-portrait-src`, `poster-landscape-src`, and `poster-square-src`)

The following guidelines apply to the image for the story poster image(s):

- The poster image should be representative of the entire AMP story.
- The poster image should be visible to the user when the user begins the AMP story.  However, the image file URL used in the metadata does not have to match exactly the URL used on the first page of the story.  The URL used in the metadata can include sizing, cropping, or minor styling changes for the preview purpose.
- The poster image should be a raster file, such as `.jpg`, `.png`, or `.gif`.  Avoid vector files, such as `.svg` or `.eps`.
- The poster image should be in 3x4 aspect ratio for portrait, 4x3 for landscape, and 1x1 for square.
- If the poster image is derived from a frame in a video, the thumbnail should be representative of the video. For example, the first frame in a video is often not representative.
- Each poster image should meet the recommended minimium size:
  - Portrait: 696px x 928px
  - Landscape: 928px x 696px
  - Square: 928px x 928px

## Overview

The `amp-story` extension provides a new format for displaying visual content that you can assemble into a story-telling experience. With an AMP story, you can provide users with bite-sized, visually rich information and content.

<figure class="centered-fig">
  <amp-anim width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/amp-story.gif">
    <noscript>
    <img alt="AMP Story Example" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/amp-story.gif" />
  </noscript>
  </amp-anim>
</figure>

## AMP story format

An [AMP story](#story:-amp-story) is a complete AMP HTML document that is comprised of [pages](#pages:-amp-story-page), within the pages are [layers](#layers:-amp-story-grid-layer), within the layers are AMP & HTML elements, like media, analytics, text, and so on.

<amp-img alt="AMP story tag hierarchy" layout="fixed" src="https://github.com/ampproject/docs/raw/master/assets/img/docs/amp-story-tag-hierarchy.png" width="591" height="358">
  <noscript>
    <img alt="AMP story tag hierarchy" src="https://github.com/ampproject/docs/raw/master/assets/img/docs/amp-story-tag-hierarchy.png" />
  </noscript>
</amp-img>


### Boilerplate

The following markup is a decent starting point or boilerplate. Copy this and save it to a file with a `.html` extension.

```html
<!doctype html>
<html amp lang="en">
  <head>
    <meta charset="utf-8">
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <script async custom-element="amp-story"
        src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
    <title>Hello, amp-story</title>
    <link rel="canonical" href="http://example.ampproject.org/my-story.html" />
    <meta name="viewport"
        content="width=device-width,minimum-scale=1,initial-scale=1">
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  </head>
  <body>
    <amp-story standalone>
      <amp-story-page id="my-first-page">
        <amp-story-grid-layer template="fill">
          <amp-img src="https://example.ampproject.org/helloworld/bg1.jpg"
              width="900" height="1600">
          </amp-img>
        </amp-story-grid-layer>
        <amp-story-grid-layer template="vertical">
          <h1>Hello, amp-story!</h1>
        </amp-story-grid-layer>
      </amp-story-page>
      <amp-story-page id="my-second-page">
        <amp-story-grid-layer template="fill">
          <amp-img src="https://example.ampproject.org/helloworld/bg2.gif"
              width="900" height="1600">
          </amp-img>
        </amp-story-grid-layer>
        <amp-story-grid-layer template="vertical">
          <h1>The End</h1>
        </amp-story-grid-layer>
      </amp-story-page>
      <amp-story-bookend src="bookendv1.json" layout="nodisplay">
      </amp-story-bookend>
    </amp-story>
  </body>
</html>
```

The content in the body creates a story with two pages.  Each page has a full bleed background image, with a simple string of text on top of it.

### Required markup for amp-story

The AMP story HTML format follows the [same markup requirements as a valid AMP HTML document](https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#required-markup), along with the following additional requirements:


| RULE | DESCRIPTION |
| ---- | --- |
| The `<amp-story standalone>` element is the only child element of `<body>`. | Identifies that the document is an AMP story. |
| Contain a `<script async src="https://cdn.ampproject.org/v0/amp-story-1.0.js" custom-element="amp-story"></script>` tag as the third child of the `<head>` tag. | Includes and loads the amp-story JS library. |
| Contain a `<link rel="canonical" href="$STORY_URL">` tag inside the `<head>`. | The link points to the story itself, identifying the story as the canonical document. |

## Story: `amp-story`

The `amp-story` component represents an entire story.  The component itself  implements the UI shell, including handling gestures and navigation, and inserting the application shell UI (controls, progress bar, etc).

<figure class="centered-fig">
  <amp-anim alt="amp-story example" width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/amp-story.gif">
    <noscript>
    <img alt="amp-story example" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/amp-story.gif" />
  </noscript>
  </amp-anim>
</figure>

### Example

```html
<amp-story
    standalone
    title="My Story"
    publisher="The AMP Team"
    publisher-logo-src="https://example.com/logo/1x1.png"
    poster-portrait-src="https://example.com/my-story/poster/3x4.jpg"
    poster-square-src="https://example.com/my-story/poster/1x1.jpg"
    poster-landscape-src="https://example.com/my-story/poster/4x3.jpg"
    background-audio="my.mp3">
  <amp-story-page>[...]</amp-story-page>
  <amp-story-page>[...]</amp-story-page>
  <amp-story-page>[...]</amp-story-page>
  <amp-story-bookend src="./related.json"></amp-story-bookend>
</amp-story>
```

### Attributes

##### standalone [required]

Identifies that the AMP document is a story.

##### title [required]

The title of the story.

##### publisher [required]

The name of the story's publisher.

##### publisher-logo-src [required]

A URL to the story publisher's logo in square format (1x1 aspect ratio). For example `publisher-logo-src="https://example.com/logo/1x1.png"`, where 1x1.png is a 96x96 px logo.

##### poster-portrait-src [required]

A URL to the [story poster](#posters) in portrait format (3x4 aspect ratio).

##### supports-landscape [optional]

Enables landscape orientation support on mobile devices and a full bleed landscape experience on desktop devices.

##### background-audio [optional]

A URL to an audio file that plays throughout the story.

##### poster-square-src [optional]

A URL to the [story poster](#posters) in square format (1x1 aspect ratio).

##### poster-landscape-src [optional]

A URL to the [story poster](#posters) in landscape format (4x3 aspect ratio).

##### live-story [optional]

Enables the [Live story](#Live-story) functionality.

##### live-story-disabled [optional]

Disables the [Live story](#Live-story) functionality.

##### data-poll-interval [optional]

Used with the live-story attribute. Time interval (in milliseconds) between checks for new content. If no `data-poll-interval` is provided it with default to the 15000 millisecond minimum. A value under 15000 milliseconds is invalid.

### Posters

A "poster" is an image that displays in the UI until your story is loaded. The poster can generally be the first screen of your story, although you can use any image that is representative of the story.

### Landscape orientation and full bleed desktop experience opt in

If the `supports-landscape` attribute is specified on the `<amp-story>` element, it will:

  * Allow the story to be seen when a mobile device is held in a landscape orientation.
  * Change the desktop experience to an immersive full bleed mode, replacing the default three portrait panels experience.

Usage: `<amp-story ... supports-landscape>...</amp-story>`

<figure class="centered-fig">
  <span class="special-char">Before:</span>
  <amp-anim alt="Desktop three panels experience" layout="flex-item" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/amp-story-desktop-three-panels.gif" width="400" height="299">
  <noscript><img width="400" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/amp-story-desktop-three-panels.gif" /></noscript>
  </amp-anim>
  <span class="special-char">After:</span>
  <amp-anim alt="Desktop full bleed experience" layout="flex-item" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/amp-story-desktop-full-bleed.gif" width="400" height="299">
  <noscript><img width="400" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/amp-story-desktop-full-bleed.gif" /></noscript>
  </amp-anim>
</figure>

### Live story

<figure class="centered-fig">
  <amp-anim alt="Live story example" width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/live-stories-gif.gif">
  <noscript>
    <img alt="Live story example" width="200" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/live-stories-gif.gif" />
  </noscript>
  </amp-anim>
</figure>

Use the `live-story` attribute to append new pages to a story for users to see in real-time.

This attribute shows a notification of new pages to users on the last page, and updates the progress bar.

Core use cases for live-story include coverage for breaking news or live events, enabling real-time updates to users without exiting the story. Award shows, sporting events, and elections are some examples.

#### How it works

In the background, while an AMP Story using `live-story` is displayed on the client, the AMP runtime polls the origin document on the host for updates. When the client receives a response, it then filters and dynamically inserts those updates back into the story on the client. Publishers can customize the polling rate in order to control the number of incoming requests, and AMP caches like the Google AMP Cache can perform optimizations to reduce the server response payload, saving client bandwidth and CPU cycles.

#### Polling

In most implementations for live blogs, content is either pushed by the server to the client instance of a page, or the client polls a JSON endpoint to receive updates. The implementation here is different, in that the client instance of the story polls the server copy of the story document for updates inside the `<amp-story>` element. For instance: if the user is viewing a story served from an AMP cache, the client will poll that document hosted on that AMP cache for updates; if the user is viewing a document served from a web publisher's origin domain (e.g. "example.com"), then the client will poll the document hosted on that origin domain for updates.

This means that publishers of stories do not need to set up a JSON endpoint or push mechanism for this functionality to work.

Content is updated by publishing to the same URL with valid `<amp-story>` markup. The content is pulled into the user's client instance during the next poll. Poll intervals are configurable using the [`data-poll-interval`](#data-poll-interval-[optional]) attribute.

#### Stop polling

As long as the `live-story` attribute is present on the `<amp-story>` element, the client will make continuous polls to the server copy of the document. Make sure to set the `live-story-disabled` attribute to the `<amp-story>` element when you publish your last update to the story. This will make the polling stop.

#### Usage

* Specify an `id` on the `<amp-story>` element.
* Add the `live-story` attribute to the `<amp-story>` element.
* [Optional] Add the [`data-poll-interval`](#data-poll-interval-[optional]) attribute to the `<amp-story>` element to specify a time interval for checking for new updates.
* [Optional] When finishing the live broadcast, add the [`live-story-disabled`](#live-story-disabled-[optional]) attribute to the `<amp-story>` element to disable the polling.
* On each `<amp-story-page>`:
  * Specify a `data-sort-time` attribute with a valid value. This is a timestamp used for sorting the pages. Higher timestamps will be inserted after older page entries. We recommend using [Unix time](https://www.unixtimestamp.com/).

```html
<amp-story id="story1" live-story ...>
  <amp-story-page id="cover" data-sort-time="1552330790"> ... </amp-story-page>
  <amp-story-page id="page1" data-sort-time="1552330791"> ... </amp-story-page>
  <amp-story-page id="page2" data-sort-time="1552330792"> ... </amp-story-page>
</amp-story>
```

### Children (of amp-story)

The `<amp-story>` component contains one or more [`<amp-story-page>`](#pages:-amp-story-page) components, containing each of the individual screens of the story.  The first page specified in the document order is the first page shown in the story.

## Other components usable in AMP stories
The following are other components usable in AMP stories that require some story-specific caveats.

- [amp-consent](https://amp.dev/documentation/components/amp-consent#prompt-ui-for-stories)
- [amp-sidebar](https://amp.dev/documentation/components/amp-sidebar#sidebar-for-stories)
- [amp-twitter](https://amp.dev/documentation/components/amp-twitter)

For more generally usable components see the [list of allowed children](https://amp.dev/documentation/components/amp-story#children).

## Validation

See [amp-story rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-story/validator-amp-story.protoascii) in the AMP validator specification.

## Localization

To localize your story, include the language code in the `lang` attribute on the `<html>` tag of your story, such as `<html ⚡ lang="en">` for English.  The supported language codes are:

* ar (Arabic)
* de (German)
* en-GB (English, UK)
* en (English, US)
* es-419 (Spanish, Central/Latin America)
* es (Spanish, Spain)
* fr-CA (French, Canada)
* fr (French, France)
* hi (Hindi)
* id (Indonesian)
* it (Italian)
* ja (Japanese)
* ko (Korean)
* nl (Dutch)
* no (Norwegian)
* pt-BR (Portuguese, Brazil)
* pt (Portuguese, Portugal)
* ru (Russian)
* tr (Turkish)
* vi (Vietnamese)
* zh-TW (Traditional Chinese)
* zh (Simplified Chinese)

Additionally, for right-to-left languages, you may include the `dir="rtl"` attribute on the `<html>` tag of your story.  This may be used in conjunction with the language code as well, e.g. `<html ⚡ lang="ar" dir="rtl">`.

## Related resources

* [Tutorial: Create a visual AMP story](https://www.ampproject.org/docs/tutorials/visual_story)
* [Samples on AMP By Example](https://amp.dev/documentation/examples/?format=stories)
* [Best practices for creating an AMP story](https://amp.dev/documentation/guides-and-tutorials/develop/amp_story_best_practices)
