---
$category@: media
formats:
  - websites
teaser:
  text: Displays a cloud-hosted JW Player.
---
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

# amp-jwplayer

Displays a cloud-hosted <a href="https://www.jwplayer.com/">JW Player</a>.

<table>
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

<table>
  <tr>
    <td width="40%"><strong>data-player-id</strong></td>
    <td>JW Platform player id. This is an 8-digit alphanumeric sequence that can be found in the <a href="https://dashboard.jwplayer.com/#/players">Players</a> section in your JW Player Dashboard. (<strong>Required</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-media-id</strong></td>
    <td>The JW Platform media id. This is an 8-digit alphanumeric sequence that can be found in the <a href="https://dashboard.jwplayer.com/#/content">Content</a> section in your JW Player Dashboard. (<strong>Required if <code>data-playlist-id</code> is not defined.</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlist-id</strong></td>
    <td>The JW Platform playlist id. This is an 8-digit alphanumeric sequence that can be found in the <a href="https://dashboard.jwplayer.com/#/content/playlists">Playlists</a> section in your JW Player Dashboard. If both <code>data-playlist-id</code> and <code>data-media-id</code> are specified, <code>data-playlist-id</code> takes precedence. (<strong>Required if <code>data-media-id</code> is not defined.</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-content-search</strong></td>
    <td>Denotes the type of the playlist. This is a search playlist that takes in a keyword or phrase as the search query and generates a playlist based on that search query. If contextual article matching is desired, use the value <code>__CONTEXTUAL__</code> (data-content-contextual must also be <code>true</code>).)</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-content-contextual</strong></td>
    <td>Enables the Player to grab the OG title (or HTML title if there is no OG title) of a given webpage and use that as the search query (required to do Contextual Article Matching). (<strong>'true' or 'false'</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-content-recency</strong></td>
    <td>Limits the videos added into the playlist based on their age (i.e. the playlist includes videos that are max [xx] days old). Specified in the format <code>xD</code>, where x is a numerical value (i.e. <code>'9D'</code>).</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-content-backfill</strong></td>
    <td>Ensures that there is always a search result. If there are no search results for the given query, this parameter ensures that a list of trending videos are served. (<strong>'true' or 'false'</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>


## Validation
See [amp-jwplayer rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-jwplayer/validator-amp-jwplayer.protoascii) in the AMP validator specification.
