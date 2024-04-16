---
$category@: ads-analytics
formats:
  - stories
teaser:
  text: Automatically generates analytics configs for stories.
---

# Usage

The `amp-story-auto-analytics` component configures [`amp-analytics`](https://amp.dev/documentation/components/amp-analytics/) on a story with useful analytics events for a Google Analytics gtag.

```html
<amp-story>
  <amp-story-auto-analytics gtag-id="G-12345678"></amp-story-auto-analytics>
</amp-story>
```

# Attributes

## gtag-id (required)

Google Analytics ID used to link the story to the analytics account.

# Triggers

The following analytics triggers are dispatched when using the `amp-story-auto-analytics` component:

## `storyPageCount`

Fired once per story view. It includes the following parameters:

| Parameter             | Value                                                           |
| --------------------- | --------------------------------------------------------------- |
| `ea` (event_action)   | `story_page_count`                                              |
| `ec` (event_category) | Title of the story (`<title>` tag in the HTML of the Web Story) |
| `el` (event_label)    | Length of the story in number of pages                          |

## `storyEnd`

Fired once the last page of the story has been viewed. It includes the following parameters:

| Parameter             | Value                                                           |
| --------------------- | --------------------------------------------------------------- |
| `ea` (event_action)   | `story_complete`                                                |
| `ec` (event_category) | Title of the story (`<title>` tag in the HTML of the Web Story) |
| `el` (event_label)    | Title of the story (`<title>` tag in the HTML of the Web Story) |

## `storyPageIndex`

Fired once a page has been viewed. It includes the following parameters:

| Parameter             | Value                                                           |
| --------------------- | --------------------------------------------------------------- |
| `ea` (event_action)   | `story_pages_viewed`                                            |
| `ec` (event_category) | Title of the story (`<title>` tag in the HTML of the Web Story) |
| `el` (event_label)    | Index of the page viewed (starting with index 0)                |
