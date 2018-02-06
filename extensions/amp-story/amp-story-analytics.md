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

# <a name="amp-story-analytics"></a>AMP Story and Analytics

## Story triggers

`amp-story` issues events for changes of state. These events can be reported through the analytics configuration by using triggers.

See [amp-analytics.md](../amp-analytics/amp-analytics.md) for details on *amp-analytics* configuration.

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


## Story variables

AMP story contributes the following URL substitutions:

### STORY_PAGE_ID

The unique ID for an AMP story page, as provided by the `id` attribute of the current `amp-story-page`.

### STORY_PAGE_INDEX

A zero-based index value for an AMP story page determined by its ordering within `amp-story`.

### Additional Vars

Description of additional variables can be found in the [analytics-vars.md](../amp-analytics/analytics-vars.md) file.
