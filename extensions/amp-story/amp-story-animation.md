---
$category@: presentation
formats:
  - stories
tags:
  - animation
teaser:
  text: A component for configuring custom animations in amp-story.
---

<!--
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

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

# amp-story-animation

If an animation is needed outside of the [presets](https://amp.dev/documentation/components/amp-story/?format=stories#animations), custom animations can be configured using the `<amp-story-animation>` component. It lets you create [`<amp-animation>`](https://amp.dev/documentation/components/amp-animation/?format=websites)-type animations inside your Web Story.

To use it, add a `<amp-story-animation layout="nodisplay" trigger="visibility">` tag under your `<amp-story-page>` with a child `<script type="application/json">` containing the JSON configuration describing your animation. In the following example, the "Custom animation" text will be animated using the json configuration in `<amp-story-animation>`:

```html
...
      <amp-story-page id="cover">
        <amp-story-grid-layer template="vertical">
          <strong class="custom-animation">Custom animation</strong>
        </amp-story-grid-layer>

        <amp-story-animation layout="nodisplay" trigger="visibility">
          <script type="application/json">
            {
              "selector": ".custom-animation",
              "duration": "1s",
              "easing": "ease-in-out",
              "keyframes": [
                {"transform": "translateY(10px)", "opacity": 0},
                {"transform": "translateY(-5px)", "opacity": 1},
                {"transform": "translateX(0)"}
              ]
            }
          </script>
        </amp-story-animation>
      </amp-story-page>
```

## Related resources

-   [`<amp-animation> docs`](https://amp.dev/documentation/components/amp-animation/?format=websites)
-   [animatoin configuration examples](https://amp.dev/documentation/guides-and-tutorials/start/visual_story/animating_elements/?format=stories)
