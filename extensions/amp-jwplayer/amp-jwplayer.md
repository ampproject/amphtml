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

# <a name="amp-jwplayer"></a> `amp-jwplayer`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a cloud-hosted <a href="https://www.jwplayer.com/">JW Player</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-jwplayer" src="https://cdn.ampproject.org/v0/amp-jwplayer-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-jwplayer/">Annotated code example for amp-jwplayer</a></td>
  </tr>
</table>

[TOC]

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
<amp-jwplayer
    data-player-id="aBcD1234"
    data-media-id="5678WxYz"
    layout="responsive"
    width="16" height="9">
</amp-jwplayer>
```

Non-responsive layout is also supported.

Example:

```html
<amp-jwplayer
    data-player-id="aBcD1234"
    data-playlist-id="5678WxYz"
    width="160" height="90">
</amp-jwplayer>
```

## Attributes

##### data-player-id
Type: String

JW Platform player id. This is an 8-digit alphanumeric sequence that can be found in the [Players](https://dashboard.jwplayer.com/#/players) section in your JW Player Dashboard. (**Required**)


##### data-media-id
Type: String

The JW Platform media id. This is an 8-digit alphanumeric sequence that can be found in the [Content](https://dashboard.jwplayer.com/#/content) section in your JW Player Dashboard. (**Required if `data-playlist-id` is not defined.**)


##### data-playlist-id
Type: String

The JW Platform playlist id. This is an 8-digit alphanumeric sequence that can be found in the [Playlists](https://dashboard.jwplayer.com/#/content/playlists) section in your JW Player Dashboard.  If both `data-playlist-id` and `data-media-id` are specified, `data-playlist-id` takes 
precedence.  (**Required if `data-media-id` is not defined.**)


##### data-content-search
Type: String
Denotes the type of the playlist. This is a search playlist that takes in a keyword or phrase as the search query and generates a playlist based on that search query. If contextual article matching is desired, use the value `_CONTEXTUAL_` (data-content-contextual must also be true).


##### data-content-contextual
Type: Boolean

Enables the Player to grab the OG title (or HTML title if there is no OG title) of a given webpage and use that as the search query (required to do Contextual Article Matching).


##### data-content-recency
Type: String

Limits the videos added into the playlist based on their age (i.e. the playlist includes videos that are max [xx] days old). In the format, `xD`, where x is a numerical value,


##### data-content-backfill
Type: Boolean

Ensures that there is always a search result. If there are no search results for the given query, this parameter ensures that a list of trending videos are served.


##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation
See [amp-jwplayer rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-jwplayer/validator-amp-jwplayer.protoascii) in the AMP validator specification.
