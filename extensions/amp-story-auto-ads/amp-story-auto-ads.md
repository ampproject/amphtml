---
$category@: presentation
formats:
  - stories
teaser:
  text: Dynamically inserts ads into a Story.
---

# amp-story-auto-ads

Dynamically inserts ads into a Story.

# Getting Started

For information on how to include ads in your AMP Stories, [refer to our guide](https://amp.dev/documentation/guides-and-tutorials/develop/advertise_amp_stories).

# Best practices for creating an AMP Story ad

If you are interested in creating an ad for the AMP Story platform, [refer to our best practices guide](https://amp.dev/documentation/guides-and-tutorials/develop/story_ads_best_practices).

## Behavior

`amp-story-auto-ads` extension dynamically inserts ads (implemented as `amp-ad`)
into the story while content is being consumed by the user. The current algorithm expects at least a story containing 7 pages.

Each `amp-ad` is inserted as a full screen story page. To prevent showing
blank/unloaded ads, the ad is pre-rendered completely in the background before
making it visible to the user. Based on user interactions, the extension decides when
and where to insert ads.

Ad in story can be skipped the same way as normal story pages by tapping on the
right part of the screen.

## Configuration

There are two ways of configuring an ad:
**Inline**
and
**Remote**

### Inline Ad Config

In the `<amp-story-auto-ads>` element, you specify a JSON configuration object
that contains the details for how ads should be fetched and displayed, which
looks like the following:

```html
<amp-story>
  <amp-story-auto-ads>
    <script type="application/json">
      {
        "ad-attributes": {
          "type": "doubleclick",
          "data-slot": "/30497360/a4a/amp_story_dfp_example"
        }
      }
    </script>
  </amp-story-auto-ads>
  ...
</amp-story>
```

`ad-attributes` is a map of key-value pairs, which are the attributes of the
`amp-ad` element to be inserted.

The above example will insert the following `amp-ad` element, which represents
a [ad served by doubleclick](../../extensions/amp-ad-network-doubleclick-impl/amp-ad-network-doubleclick-impl-internal.md):

```html
<amp-ad type="doubleclick" data-slot="/30497360/a4a/amp_story_dfp_example">
</amp-ad>
```

Unlike normal `amp-ad`, no `<fallback>` or `<placeholder>` needs to be specified
here, as ads in stories will only be displayed once fully rendered.

### Remote Ad Config

Instead of adding in the JSON configuration file inside a script tag (as shown in the Inline Ad Config section),
One may also host the remote URL using a

[Remote JSON ad configuration file](https://github.com/ampproject/amphtml/blob/main/examples/amp-story/ads/remote.json)

```json
{
  "ad-attributes": {
    "type": "doubleclick",
    "data-slot": "/30497360/a4a/amp_story_dfp_example"
  }
}

```

Once you have your JSON configuration file setup, simply use the

[html ad config code to retrive the remote URL:](https://github.com/ampproject/amphtml/blob/main/examples/amp-story/story-ad-remote-config.html)

in the `<amp-story-auto-ads>` element as shown here:

```html
<amp-story standalone supports-landscape>
    <!--
      This is an example of JSON retrieved from a source file.
    -->
    <amp-story-auto-ads src="/examples/amp-story/ads/remote.json" ></amp-story-auto-ads>
    <amp-story-page id="page-1">
    .
    .
    .
</amp-story>
```

### Passing additional attributes (RTC, Targeting, etc.)

If you wish to pass any additional data (e.g. targeting information) as
attributes to the created `<amp-ad>` tag, simply add the additional key value
pairs to the `ad-attributes` JSON object.

A common use case is to pass targeting data or RTC configuration to the underlying `amp-ad` element. A more complex configuration may look something like this:

```html
<amp-story-auto-ads>
  <script type="application/json">
    {
      "ad-attributes": {
        "type": "doubleclick",
        "data-slot": "/30497360/a4a/amp_story_dfp_example",
        "rtc-config": {
          "urls": ["https://rtcEndpoint.biz/"]
        },
        "json": {
          "targeting": {
            "loc": "usa",
            "animal": "cat"
          },
          "categoryExclusions": ["sports", "food", "fun"]
        }
      }
    }
  </script>
</amp-story-auto-ads>
```

This would result in creation of the following `amp-ad` element.

```html
<amp-ad
  type="doubleclick"
  data-slot="/30497360/a4a/amp_story_dfp_example"
  rtc-config='{"urls": ["https://rtcEndpoint.biz/"}'
  json='{"targeting":{"loc": "usa", "animal": "cat"}, "categoryExclusions":["sports", "food", "fun"]}'
>
</amp-ad>
```

## Validation

`amp-story-auto-ads` must be a direct child of `amp-story` element.

## Insertion Control

If there is a specific position in a story that you wish to never show an ad,
you can add the `next-page-no-ad` attribute an `<amp-story-page>`. The insertion
algorithm will then skip the slot after this page when trying to insert an ad.

```html
<amp-story-page next-page-no-ad id="page-7">
  ...
</amp-story-page>

<!-- No ad will ever be inserted here. -->

<amp-story-page next-page-no-ad id="page-8">
  ...
</amp-story-page>
```

## Analytics

When using `amp-story-auto-ads` several new [analytics triggers](../../extensions/amp-analytics/amp-analytics.md)
and [variables] will be available for your analytics configuration.

### Triggers

| Name               | Event                                            |
| ------------------ | ------------------------------------------------ |
| `story-ad-request` | An ad is requested.                              |
| `story-ad-load`    | An ad is loaded.                                 |
| `story-ad-insert`  | An ad is inserted.                               |
| `story-ad-view`    | An ad is viewed.                                 |
| `story-ad-click`   | An ad's CTA button has been clicked.             |
| `story-ad-exit`    | A user stops looking at an ad.                   |
| `story-ad-discard` | An ad is discarded due to invalid configuration. |

### Variables

The following variables will be avaiable in roughly sequential order. The variables
can then be used in any following pings. For instance, a request using the
`story-ad-load` trigger will not have access to the `viewTime` variable as it has
not happened yet (this will resolve to an empty string). Whereas a request sent
using the `story-ad-exit` trigger would be able to get the value of all the previous
events (`requestTime`, `loadTime`, `insertTime` etc.)

| Name          | Definition                                                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `adIndex`     | Index of the ad generating the trigger (available for all triggers)                                                              |
| `adUniqueId`  | Id that should be unique for every ad (available for all triggers)                                                               |
| `requestTime` | Timestamp when ad is requested                                                                                                   |
| `loadTime`    | Timestamp when ad emits `INI_LOAD` signal                                                                                        |
| `insertTime`  | Timestamp when ad is inserted into story                                                                                         |
| `viewTime`    | Timestamp when ad-page becomes active page                                                                                       |
| `clickTime`   | Timestamp when ad is clicked                                                                                                     |
| `exitTime`    | Timestamp when ad page moves from active => inactive                                                                             |
| `discardTime` | Timestamp when ad is discared due to bad metadata etc.                                                                           |
| `position`    | Position in the parent story. Number of page before ad + 1. Does not count previously inserted ad pages. (avaiable at insertion) |
| `ctaType`     | Given cta-type of inserted ad (avaiable at insertion)                                                                            |
