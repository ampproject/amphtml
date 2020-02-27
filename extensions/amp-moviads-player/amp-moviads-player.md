---
$category@: media
formats:
  - websites
teaser:
  text: Embeds a video player for instream video ads that are integrated with the IMA SDK.
---

<!---
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

# amp-moviads-player

Embeds a video player for instream video ads that are integrated with
the
<a href="https://developers.google.com/interactive-media-ads/docs/sdks/html5/">IMA SDK</a>.

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-moviads-player" src="https://cdn.ampproject.org/v0/amp-moviads-player-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fixed, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://amp.dev/documentation/examples/components/amp-moviads-player/">amp-moviads-player example</a>.</td></td>
  </tr>
</table>

## Overview

You can use the `amp-moviads-player` component to embed an [IMA SDK](https://developers.google.com/interactive-media-ads/docs/sdks/html5/) enabled video player.

The component requires an ad tag, provided in `data-tag`, which is a URL to a
VAST-compliant ad response (for examples, see
[IMA Sample Tags](https://developers.google.com/interactive-media-ads/docs/sdks/html5/tags)).

The component HTML accepts the following types of HTML nodes as children:

- `source` tags for content video, used in the same way as the standard `video` tag.
- `track` tags for subtitles, in the same way as the standard `video` tag. If the track is hosted on a different origin than the document, you must add the `data-crossorigin` attribute to the `<amp-moviads-player>` tag.
- a `script` tag of type `application/json` used to provide [ImaSdkSettings](https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.ImaSdkSettings). Provide the property-translation of the setters in the linked documentation (e.g. to call `setNumRedirects(4)`, provide `{"numRedirects": 4}`).

## Example

```html


<div style="max-width: 640px">
  <amp-moviads-player data-video-custom-conf="{"movieSrcs":["https://storage1.platform.moviads.pl/224/f/z/7/b/fz7bzymy23_480p.mp4","https://storage1.platform.moviads.pl/224/f/z/7/c/fz7c0oclop_480p.mp4","https://storage1.platform.moviads.pl/224/f/z/7/c/fz7c2lpnjb_480p.mp4"],"movieContenerId":"uniq123","movieSrc":"https://www.videvo.net/videvo_files/converted/2014_02/videos/Clock_Face_2Videvo.mov17947.mp4","moviePosterSrc":"https://img.platform.moviads.pl/9/4/c/c/img_94ccf9798646c9a17dfd8a12f7f7e602_640_360_0_0_0_0_ffffff__fe4a5.jpg","responsive":true,"playerIdConf":"test","masterDomain":"https://player1.platform.moviads.pl/","watermark":null,"maxWidth":"640px","maxHeight":"320px","UA":"UA-70993821-1","lang":"pl","autoplay":true,"volume":1,"uniqueContentId":"cont123","hideWhenNoAd":false,"hideWhenEnd":false,"adBlockInfo":"Test adblock Test adblock Test adblock Test adblock Test adblock Test adblock Test adblock","functionAfterEnded":null,"videoWall":[{"title":"„Obgryzaj, znajduj, wygrywaj” w loterii promującej Ptasie Mleczko od Wedla","poster":"http://tv.wirtualnemedia.pl/movie/11716y7f9cc0c18d0354d74a23cc93ce7482a4.jpg","uri":"http://tv.wirtualnemedia.pl/film/obgryzaj-znajduj-wygrywaj-w-loterii-promujacej-ptasie-mleczko-od-wedla"},{"title":"Zebra zamiast zajączka w wielkanocnej reklamie Czekotubki od Wedla","poster":"http://tv.wirtualnemedia.pl/movie/11487y6a6b921bfe931951e59678eaf9e16739.jpg","uri":"http://tv.wirtualnemedia.pl/film/zebra-zamiast-zajaczka-w-wielkanocnej-reklamie-czekotubki-od-wedla"},{"title":"Zebra i dziecko ze strażnikiem miejskim w bożonarodzeniowym spocie Wedla","poster":"http://tv.wirtualnemedia.pl/movie/11189y231a696f82f6396b5b24c31343c1d9ea.jpg","uri":"http://tv.wirtualnemedia.pl/film/zebra-i-dziecko-ze-straznikiem-miejskim-w-bozonarodzeniowym-spocie-wedla"},{"title":"Czekolada Cookie Wedel - w spocie chłopiec na zebrze odwiedza nauczycielkę","poster":"http://tv.wirtualnemedia.pl/movie/11005y4b447b4d8df80eeadc09d89a1f4627b0.jpg","uri":"http://tv.wirtualnemedia.pl/film/czekolada-cookie-wedel-w-spocie-chlopiec-na-zebrze-odwiedza-nauczycielke"},{"title":"Chłopiec na gadającej zebrze w reklamie Wedla","poster":"http://tv.wirtualnemedia.pl/movie/10798y188278b9fe259dec1b1652d21d61fa02.jpg","uri":"http://tv.wirtualnemedia.pl/film/chlopiec-na-gadajacej-zebrze-w-reklamie-wedla"},{"title":"Jogurt Fantasia z czekoladą Wedel - reklama","poster":"http://tv.wirtualnemedia.pl/movie/10431yc0b2b4614ecc29e5a5101d5fd1b493f9.jpg","uri":"http://tv.wirtualnemedia.pl/film/jogurt-fantasia-z-czekolada-wedel-reklama"},{"title":"Impreza u Wargorra w urodzinowej kampanii batonów Pawełek","poster":"http://tv.wirtualnemedia.pl/movie/10415y36cba8833a8c1f55bba182f8ab5f3009.jpg","uri":"http://tv.wirtualnemedia.pl/film/impreza-u-wargorra-w-urodzinowej-kampanii-batonow-pawelek"},{"title":"Wedlanoc w wielkanocnej reklamie słodyczy Wedel","poster":"http://tv.wirtualnemedia.pl/movie/10288y2a277682900aea116f4c1947339444f0.jpg","uri":"http://tv.wirtualnemedia.pl/film/wedlanoc-w-wielkanocnej-reklamie-slodyczy-wedel"}]}" height="1" width="2" layout="responsive" responsive></amp-moviads-player>
</div>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>movieSrcs (optional)</strong></td>
    <td>An array image for the frame to be displayed before video playback has started. By default, the first frame is displayed</td>
  </tr>
  <tr>
    <td width="40%"><strong>movieSrc</strong> (optional)</td>
    <td>An image for the frame to be displayed before video playback has started. By default, the first frame is displayed.
</td>
  </tr>
  <tr>
    <td width="40%"><strong>movieContenerId (optional)</strong></td>
    <td>Required This is a unique container id.</td>
  </tr>
  <tr>
    <td width="40%"><strong>masterDomain</strong></td>
    <td>Requires This is the primary domain</td>
  </tr>
  <tr>
    <td width="40%"><strong>watermark (optional)</strong></td>
    <td>Embeded logo in screen</td>
  </tr>
  <tr>
  <tr>
      <td width="40%"><strong>UA (optional)</strong></td>
      <td>Google analytic, send message events</td>
  </tr>
  <tr>
    <td width="40%"><strong>lang (optional)</strong></td>
    <td>Language dictionary, replaced with the current ad number in the sequence and the total number of ads</td>
  </tr>
  <tr>
      <td width="40%"><strong>autoplay (optional)</strong></td>
      <td>true is autoplay player and ads</td>
  </tr>
  <tr>
      <td width="40%"><strong>scrollOnlyDownPlayer (optional)</strong></td>
      <td>Scroll only down, create a display:</td>
  </tr>
    <tr>
        <td width="40%"><strong>volume (optional)</strong></td>
        <td>volume video</td>
    </tr>
    <tr>
        <td width="40%"><strong>volumeOnOver (optional)</strong></td>
        <td>volume on over container video</td>
    </tr>
    <tr>
        <td width="40%"><strong>hideWhenNoAd (optional)</strong></td>
        <td>Hide container when not loaded ad</td>
    </tr>
    <tr>
        <td width="40%"><strong>hideWhenEnd (optional)</strong></td>
        <td>Hide container when end video</td>
    </tr>
    <tr>
        <td width="40%"><strong>scrollPlayer (optional)</strong></td>
        <td>Scroll container player, position:fixed, bottom:0</td>
    </tr>
    <tr>
        <td width="40%"><strong>debug (optional)</strong></td>
        <td>Show info in console.log</td>
    </tr>
    <tr>
        <td width="40%"><strong>adBlockInfo (optional)</strong></td>
        <td>Detected adblock and show info with parameter</td>
    </tr>
    <tr>
        <td width="40%"><strong>functionAfterEnded (optional)</strong></td>
        <td>Run method with parameter when end video</td>
    </tr>
    <tr>
        <td width="40%"><strong>videoWall (optional)</strong></td>
        <td>Show recommended article</td>
    </tr>   
</table>

## Validation

See [amp-moviads-player](https://github.com/ampproject/amphtml/blob/master/extensions/amp-moviads-player/validator-amp-moviads-player.protoascii) in the AMP validator specification.
