<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# AMP Story and Analytics

This document details triggers associated with AMP Stories. If you're looking for a guide to setting up analytics for your AMP pages, see [this blog post](https://blog.amp.dev/2019/08/28/analytics-for-your-amp-stories/)

## Story triggers

`amp-story` issues events for changes of state. These events can be reported through the analytics configuration by using triggers.

See [amp-analytics.md](../amp-analytics/amp-analytics.md) for details on _amp-analytics_ configuration.

### Visible trigger (`"on": "story-page-visible"`)

The `story-page-visible` event is issued when a story page becomes visible.

```javascript
"triggers": {
  "storyPageVisible": {
    "on": "story-page-visible",
    "request": "event"
  }
}
```

Because of the user experience of AMP story enables a user to traverse several "pages" without loading new HTML pages each time, one interesting consideration involving the `story-page-visible` event is how to record pageview events. One approach would be to count each `story-page-visible` event as a typical pageview (i.e. as if a user were visiting a new HTML page); another approach is to capture `story-page-visible` events specially as their own type of event.

Using `amp-analytics` you can re-assign the `story-page-visible` event to behave like a pageview event, which is a common vendor-specified event type:

```javascript
"triggers": {
  "storyPageVisible": {
    "on": "story-page-visible",
    "request": "pageview"
  }
}
```

Consult your vendor's documentation for more specific details on how to set this up.

### Last page visible trigger (`"on": "story-last-page-visible"`)

The `story-last-page-visible` trigger is fired when the last page in the story is shown to the user. This can be used to measure completion rate.

### Tooltip focus trigger (`"on": "story-focus"`)

The `story-focus` trigger is fired when clicking an element that opens a tooltip.

The current elements trackable by the `story-focus` and `story-click-through` triggers are:

-   `<a>`
-   `<amp-twitter>`

To use it, specify the trigger on your `"triggers"` property of your analytics configuration, accompanied by the `"tagName"` of the element you want to track.

Example:

```
<amp-analytics id="my-analytics">
  <script type="application/json">
    {
      "requests": {
        "click": "https://example.com/my-endpoint"
      },
      "triggers": {
        "trackFocusState": {
          "on": "story-focus",
          "tagName": "a",
          "request": "click"
        }
      }
    }
  </script>
</amp-analytics>

```

### Tooltip click through trigger (`"on": "story-click-through"`)

The `story-click-through` trigger is fired when clicking on a tooltip.

To use it, specify the trigger on your `"triggers"` property of your analytics configuration, accompanied by the `"tagName"` of the element you want to track.

Example:

```
<amp-analytics id="my-analytics">
  <script type="application/json">
    {
      "requests": {
        "click": "https://example.com/my-endpoint"
      },
      "triggers": {
        "trackClickThrough": {
          "on": "story-click-through",
          "tagName": "a",
          "request": "click"
        }
      }
    }
  </script>
</amp-analytics>

```

### Story open trigger (`"on": "story-open"`)

The `story-open` trigger is fired when opening a drawer or dialog inside a story. The components that are currently trackable by this are:

-   Page attachment
-   Bookend
-   Share dialog
-   Info dialog
-   Sidebar

### Story close trigger (`"on": "story-close"`)

The `story-close` trigger is fired when closing a drawer or dialog inside a story. The components that are currently trackable by this are the same as the [`story-open` trigger](#Story-open-trigger-"on":-"story-open").

### Bookend enter trigger (`"on": "story-bookend-enter"`)

The `story-bookend-enter` trigger is fired when the bookend is shown to the user, after the last page of the current story.

### Bookend exit trigger (`"on": "story-bookend-exit"`)

The `story-bookend-exit` trigger is fired when the bookend is dismissed by the user.

### Bookend click trigger (`"on": "story-bookend-click"`)

The `story-bookend-click` trigger is fired when a user clicks a link inside the bookend. This trigger can be tracked with the accompanying variables: [`storyBookendComponentPosition`](#storyBookendComponentPosition), [`storyBookendComponentType`](#storyBookendComponentType), and [`storyBookendTargetHref`](#storyBookendTargetHref) listed below.

### Mute trigger (`"on": "story-audio-muted"`)

The `story-audio-muted` trigger is fired when the user initiates an interaction to mute the audio for the current story.

### Unmute trigger (`"on": "story-audio-unmuted"`)

The `story-audio-unmuted` trigger is fired when the user initiates an interaction to unmute the audio for the current story.

### Page attachment enter trigger (`"on": "story-page-attachment-enter"`)

The `story-page-attachment-enter` trigger is fired when a page attachment is opened by the user.

### Page attachment exit trigger (`"on": "story-page-attachment-exit"`)

The `story-page-attachment-exit` trigger is fired when a page attachment is dismissed by the user.

## Variables as data attribute

For the following event types, variables can be passed as part of the element level data attribute

-   story-focus
-   story-click-through
-   story-open
-   story-close

The variables passed as data attributes should follow the format `data-vars-*`.

Example:

Given the following analytics config with the corresponding element

```
// amp-analytics config
"trackTooltipClicks": {
  "on": "story-focus",
  "request": "focusedState",
},

...

<amp-twitter width="375" data-tooltip-text="my twitter embed"
  height="472"
  layout="responsive"
  data-tweetid="1166723359696130049"
  data-vars-tooltip-click-id="tweet1"
  data-vars-tooltip-href="twitter.com"
  interactive>
</amp-twitter>

```

And in the request url the token would be of the format `${eventId}` (follows camelcase):

`"focusedState": "${base}&tooltipClickId=${tooltipClickId}&tooltipTargetHref=${tooltipHref}"`

## Story variables

AMP story contributes the following URL substitutions:

### `storyPageId`

The unique ID for an AMP story page, as provided by the `id` attribute of the current `amp-story-page`.

### `storyPageIndex`

A zero-based index value for an AMP story page determined by its ordering within `amp-story`.

### `storyPreviousPageId`

The unique ID for an AMP story page, as provided by the `id` attribute of the previous `amp-story-page`.

### `storyAdvancementMode`

Advancement mode through which the user navigated (i.e. manual or automatic).

### `storyPageCount`

The total number of pages available to the user in the story.

### `storyProgress`

The user's progress through the story, as a decimal in the range [0...1]. This represents how many pages the user has passed; for example, if the user is currently looking at the second page of ten, the progress will be reported as 0.1 (as the user has not yet finished the second page).

### `storyIsMuted`

A boolean representing whether the story was muted when the accompanying trigger was fired.

### `storyBookendComponentPosition`

A number representing the index of the bookend component that the user clicked when the accompanying trigger, [`story-bookend-click`](#bookend-click-trigger-"on":-"story-bookend-click") was fired.

### `storyBookendComponentType`

The type of component in the bookend that was clicked when the accompanying trigger, [`story-bookend-click`](#bookend-click-trigger-"on":-"story-bookend-click") was fired.

### `storyBookendTargetHref`

The url of the bookend component that was clicked when the accompanying trigger, [`story-bookend-click`](#bookend-click-trigger-"on":-"story-bookend-click") was fired.

### Additional Vars

Description of additional variables can be found in the [analytics-vars.md](../amp-analytics/analytics-vars.md) file.
