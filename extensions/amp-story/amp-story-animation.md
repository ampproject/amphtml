---
$category@: presentation
formats:
  - stories
tags:
  - animation
teaser:
  text: A component for configuring custom animations in amp-story.
---

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
-   [animation configuration examples](https://amp.dev/documentation/guides-and-tutorials/start/visual_story/animating_elements/?format=stories)
