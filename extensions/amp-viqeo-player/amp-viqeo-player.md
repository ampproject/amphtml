---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Viqeo video player.
---
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

# amp-viqeo-player

Displays a <a href="https://viqeo.tv/">Viqeo</a> video player.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-viqeo-player" src="https://cdn.ampproject.org/v0/amp-viqeo-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td>
    <ul>
    <li>Viqeo WordPress embedding demo: <a href="http://demo.viqeo.tv/2018/04/04/%D0%BF%D0%BE%D0%B4%D0%B2%D0%BE%D0%B4%D0%BD%D1%8B%D0%B9-%D1%81%D0%BA%D1%83%D1%82%D0%B5%D1%80-%D0%B4%D0%BB%D1%8F-%D0%B4%D0%B0%D0%B9%D0%B2%D0%B8%D0%BD%D0%B3%D0%B0-%D0%BA%D0%BE%D1%82%D0%BE%D1%80%D1%8B-2/">Aqua Scooter</a></li>
    <li>The-Village: <a href="https://www.the-village.ru/village/food/place/316257-mesto">Pizza Resto Review</a></li>
    <li>Kanobu.ru: <a href="https://kanobu.ru/reviews/retsenziya-na-deadpool-372034/">Deadpool game review</a></li>
    </ul>
    </td>
  </tr>
</table>

[TOC]

## Example

The `width` and `height` attributes determine the aspect ratio of the Viqeo embedded in responsive layouts.

```html
<amp-viqeo-player
    data-profileid="184"
    data-videoid="b51b70cdbb06248f4438"
    width="640"
    height="360"
    layout="responsive">
</amp-viqeo-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>autoplay</strong></td>
    <td><p>If this attribute is present, and the browser supports autoplay:</p>
<ul>
  <li>the video is automatically muted before autoplay starts</li>
  <li>when the video is scrolled out of view, the video is paused</li>
  <li>when the video is scrolled into view, the video resumes playback</li>
  <li>when the user taps the video, the video is unmuted</li>
  <li>if the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it. For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused.</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-profileid</strong></td>
    <td><p>Viqeo is a registration only video platform for Publishers to add videos as illustrations. All videos are played automaticaly without sound and only when fully visible (minimum visible area possible is 50%).
  Detailed description of Viqeo is in presentation: https://docs.google.com/presentation/d/1P6DJTPJtfeMmPozv1pPz7Wner7NCcJ_DmlPOcVclgLE/present?slide=id.p</p>
<p>To get data-profileid you need to login to Viqeo account (https://viqeo.tv) and press 'Get code' near the video you want to paste to website. You will get a code with data-profileid, data-videoid &amp; width and height.</p></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-videoid</strong></td>
    <td>The identifier of the video. All videos have unique id, and can be found in Viqeo account after authorisation. Viqeo do not let embed videos by 3rd party websites so only one way to get a data-videoid and other attributes to sign in to Viqeo account.</td>
  </tr>
  <tr>
    <td width="40%"><strong>width and height</strong></td>
    <td>The width and height attributes are special for the Viqeo embed. Viqeo supports any proportions of videos. Basically Viqeo generates an unique code for each video depending on video size and proportions, but Viqeo user may change proportions in interface. Anyway after pressing 'Get code' button an unique code will be generated.</td>
  </tr>
</table>
