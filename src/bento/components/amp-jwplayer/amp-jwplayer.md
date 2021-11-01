---
$category@: media
formats:
  - websites
teaser:
  text: Displays a cloud-hosted JW Player.
---

# amp-jwplayer

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
<amp-jwplayer
  data-player-id="aBcD1234"
  data-media-id="5678WxYz"
  layout="responsive"
  width="16"
  height="9"
>
</amp-jwplayer>
```

Non-responsive layout is also supported.

Example:

```html
<amp-jwplayer
  data-player-id="aBcD1234"
  data-playlist-id="5678WxYz"
  width="160"
  height="90"
>
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
    <td>The JW Platform media id. This is an 8-digit alphanumeric sequence that can be found in the <a href="https://dashboard.jwplayer.com/#/content">Content</a> section in your JW Player Dashboard. (<strong>Required if <code>data-playlist-id</code> is not defined.</strong>). Note: <code>outstream</code> is also a valid value.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlist-id</strong></td>
    <td>The JW Platform playlist id. This is an 8-digit alphanumeric sequence that can be found in the <a href="https://dashboard.jwplayer.com/#/content/playlists">Playlists</a> section in your JW Player Dashboard. If both <code>data-playlist-id</code> and <code>data-media-id</code> are specified, <code>data-playlist-id</code> takes precedence. (<strong>Required if <code>data-media-id</code> is not defined.</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-content-search</strong></td>
    <td>Denotes the type of the playlist. If contextual article matching is desired, use the value <code>`__CONTEXTUAL__`</code>. If a search playlist is desired, input a keyword or phrase used to generate the search playlist.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-content-backfill</strong></td>
    <td>Ensures that a search or contextual playlist always returns a result. If there are no relevant results for the given query, this parameter ensures that a list of trending videos are served instead. (Boolean with default: <code>true</code>)</td>
  </tr>
  <tr>
    <td  width="40%"><strong>data-player-querystring</strong></td>
    <td>A querystring of parameters that will be added to the player iframe src. This can be used for things like token signing.</td>
  </tr>
  <tr>
    <td  width="40%"><strong>data-player-param-*</strong></td>
    <td>An attribute that will be added as a query parameter to the player iframe src. 
    <br />
    <br />
    Keys and values will be URI encoded. Keys will be camel cased.
    <ul>
      <li><code>data-player-param-token="abc"</code> becomes <code>&token=abc</code></li>
      <li><code>data-player-param-custom-data="key:value;key2:value2"</code> becomes <code>&customData=key%3Avalue%3Bkey2%3Avalue2</code></li>
    </ul>
    An alternative to using <code>data-player-querystring</code>.
    </td>
  </tr>
  <tr>
    <td  width="40%"><strong>data-ad-cust-params</strong></td>
    <td>A JSON string of custom parameters to add to ad tags.
    <pre><code>data-ad-cust-params='{
      "key1": "value"
    }'
    </code></pre>
    </td>
  </tr>
  <tr>
    <td  width="40%"><strong>data-ad-macro-*</strong></td>
    <td>An attribute used to override the default value of macros in ad tags. Supported macros include:
    <ul>
      <li>domain</li>
      <li>referrer</li>
      <li>page-url</li>
      <li>item-{custparam}</li>
      <li>item-{custparam}-list</li>
    </ul>
    <code>data-ad-macro-domain="jwplayer.com"</code> would instead substitute "jwplayer.com" in for the <code>__domain__</code> macro.
    <br />
    <br />
    See JW Player's <a href="https://support.jwplayer.com/articles/ad-tag-targeting-macro-reference">Ad Tag Targeting Macros</a> for more information.</td>
  </tr>
  <tr>
    <td  width="40%"><strong>data-config-plugin-url</strong></td>
    <td>A url string used to pass external JS plugins to the player.</td>
  </tr>
  <tr>
    <td  width="40%"><strong>data-config-skin-url</strong></td>
    <td>A url string used to pass external CSS skins to the player. See JW Player's <a href="https://developer.jwplayer.com/jwplayer/docs/jw8-css-skin-reference">CSS Skin Reference</a> for more information.</td>
  </tr>
  <tr>
    <td  width="40%"><strong>data-config-json</strong></td>
    <td>A JSON string of a player config. This can be used to set specific configuration properties on the player.
    <pre><code>data-config-json='{"playbackRateControls":true,"displaytitle":false}'
    </code></pre>
    Advertising configurations can also be specified using this.
    <pre><code>data-config-json='{
      "advertising": {
        "client": "vast",
        "schedule": [
          {
            "tag": "http://adserver.com/vastTag.xml",
            "offset": "pre"
          }
        ]
      }
    }'
    </code></pre>
    <strong>Media and Float on Scroll properties cannot be configured with this attribute</strong>. Update media properties in your JW Player Dashboard. See JW Player's <a href="https://developer.jwplayer.com/jwplayer/docs/jw8-player-configuration-reference">Player Configuration Reference</a> for more information.</td>
  </tr>
  <tr>
    <td  width="40%"><strong>data-block-on-consent</strong></td>
    <td><strong>Requires <code>amp-consent</code> extension.</strong> If this attribute is present, player loading will be delayed until the consent state is resolved. The consent data will then be passed to the player's iframe as query parameters for use with advertising implementations.
    <br />
    For more details, see <a  href="https://amp.dev/documentation/components/amp-consent/">amp-consent</a> documentation.</td>
  </tr>
  <tr>
    <td width="40%"><strong>autoplay</strong></td>
    <td>If this attribute is present, and the browser supports autoplay, the video will be automatically played as soon as it becomes visible. There are some conditions that the component needs to meet to be played, <a href="https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-video-interface.md#autoplay">which are outlined in the Video in AMP spec</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>dock</strong></td>
    <td><strong>Requires <code>amp-video-docking</code> extension.</strong> If this attribute is present and the video is playing manually, the video will be "minimized" and fixed to a corner or an element when the user scrolls out of the video component's visual area.
    <br />
    For more details, see <a href="https://amp.dev/documentation/components/amp-video-docking">documentation on the docking extension itself.</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-jwplayer rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-jwplayer/validator-amp-jwplayer.protoascii) in the AMP validator specification.
