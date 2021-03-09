---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: TODO
experimental: true
---

# `amp-google-assistant-assistjs`

Assist.js is a javascript library third party developers can include on their website to bring Assistant capabilities to their users. This extension embeds most of the assist.js library to make it accessible to AMP pages.

In the regular html world, the third-party site imports assist.js script, and embedded several assist.js widgets tags like `<google-assistant-link-group>`. The imported assist.js runtime will initialize and render those tags with Google-owned iframes, and also an invisible bottom sheet which shows as the assistant dialog plate when widgets are triggered. In AMP world, the assist.js library would be contained in this extension with its responsibilities unchanged, which is to coordinate communication between Google-owned iframes and bring up dialog plate for third-party site users to interact with.

Here is the [live example](https://developers.google.com/assistant/engagement/assistant-links#rich_assistant_links) of one of the assist.js functionalities.
