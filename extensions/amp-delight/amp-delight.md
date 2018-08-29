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

# `amp-delight`

## Description
Displays a cloud-hosted [Delight Player](https://delight-vr.com/).

## Required script
``` html
<script async custom-element="amp-delight" src="https://cdn.ampproject.org/v0/amp-delight-0.1.js"></script>
```

## Supported layouts
- fill
- fixed
- fixed-height
- flex-item
- nodisplay
- responsive


## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.
The `data-content-id` attribute is required to load the correct video.

Example:

```html
<amp-delight
    data-content-id="-LJmX7wyfNmRe5LHw7Hy"
    layout="responsive" 
    width="16" 
    height="9">    
</amp-delight>
```

Non-responsive layout is also supported.

Example:

```html
<amp-delight
    data-content-id="-LJmX7wyfNmRe5LHw7Hy"
    width="460" 
    height="200">    
</amp-delight>
```

## Attributes

##### data-content-id

The video's content ID. (**Required**)

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Actions
`amp-delight` exposes four self-explanatory actions: `play`, `pause`, `mute` and `unmute`.

## Events
`amp-delight` exposes the following events:

* **play** Emitted whenever the player is set to playing.
* **pause** Emitted whenever the player is paused.
* **load** Emitted whenever the player's iframe is loaded.
* **end** Emitted whenever the iframe's video has ended.
* **mute** Emitted whenever the player is muted.
* **unmute** Emitted whenever the player is unmuted.
* **timeupdate** Emitted whenever the player is playing.

These events can be used through the [`on` attribute](https://www.ampproject.org/docs/fundamentals/spec#on) and are compatible with `amp-analytics`.
For example, the following listens to both `play` and `pause` and displays different divs depending on the event.

```html
<amp-delight
    ... 
    on="
        play:play-div.show, pause-div.hide;
        pause:pause-div.show, play-div.hide;
    ">
</amp-delight>

<div id="play-div"> ... </div>
<div id="pause-div"> ... </div>
```

## Validation
See [amp-delight rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-delight/validator-amp-delight.protoascii) in the AMP validator specification.
