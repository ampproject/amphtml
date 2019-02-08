<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# AMP Carousel and Analytics

## Carousel (slides) triggers

`<amp-carousel type="slides">` issues events for major states . These events can be reported through the analytics configuration by using triggers.

See [amp-analytics.md](../amp-analytics/amp-analytics.md) for details on *amp-analytics* configuration.

### Change trigger (`"on": "amp-carousel-change"`)

The `amp-carousel-change` event is issued when there is any change in the slide that is curently visible. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "ampCarouselChange": {
    "on": "amp-carousel-change",
    "request": "event"
  }
}
```

### Next trigger (`"on": "amp-carousel-next"`)

The `amp-carousel-next` event is issued when there is a travesal to the next slide. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "ampCarouselNext": {
    "on": "amp-carousel-next",
    "request": "event"
  }
}
```

### Previous trigger (`"on": "amp-carousel-prev"`)

The `amp-carousel-prev` event is issued when there is a travesal to the previous slide. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "ampCarouselPrev": {
    "on": "amp-carousel-prev",
    "request": "event"
  }
}
```

### Vars

Description of the variables can be found in the [analytics-vars.md](../amp-analytics/analytics-vars.md#fromslide) file.
