# amp-ad-network-nws-impl

Newsroom AI fast fetch implementation for serving AMP story ads via `<amp-story-auto-ads>`:

https://amp.dev/documentation/guides-and-tutorials/develop/advertise_amp_stories/

### Example configuration:

```html
<amp-story-auto-ads>
  <script type="application/json">
    {
      "ad-attributes": {
        "type": "nws",
        "data-slot": "<slot_id>"
      }
    }
  </script>
</amp-story-auto-ads>
```
