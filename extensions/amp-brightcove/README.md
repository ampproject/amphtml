<!---
Copyright 2015 Brightcove. All Rights Reserved.

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

### <a name="amp-brightcove"></a> `amp-brightcove`

An `amp-brightcove` component displays a Brightcove [Video Cloud](https://www.brightcove.com/en/online-video-platform) or [Perform](https://www.brightcove.com/en/perform) player.

Example:
```html
<amp-brightcove
    data-account="12345"
    data-player="default"
    data-embed="default"
    data-video-id="1234"
    layout="responsive"
    width="480" height="270">
</amp-brightcove>
```

The width and height will determine the aspect ratio of the player embed in responsive layouts.

#### Attributes

**data-account**

The Brightcove Video Cloud or Perform account id

**data-player**

The Brightcove player id. This is a GUID or "default". The default value is "default".

**data-embed**

The Brightcove player id. This is a GUID or "default". The default value and most common value is "default".

**data-video-id**

The Video Cloud video id. Most Video Cloud players will need this.
This is not used for Perform players.

**data-playlist-id**

The Video Cloud playlist id. For AMP HTML uses a video id will normally be used instead. If both a playlist and a video are specified, the playlist takes precedence.
This is not used for Perform players.

#### Player configuration

This script should be added to the configuration of Brightcove Players used with this component. This allows the AMP document to pause the player. Only the script need be added, no plugin name or JSON are needed.

* http://players.brightcove.net/906043040001/plugins/postmessage_pause.js
