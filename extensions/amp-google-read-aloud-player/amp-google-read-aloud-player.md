---
$category@: media
formats:
  - websites
teaser:
  text: Embeds the Google Read Aloud Player.
---

# amp-google-read-aloud-player

## Behavior

Embeds the Google Read Aloud player. This player reads the content of your page out loud.

## Attributes

<table>
  <tr>
    <td width="20%"><strong>data-api-key (required)</strong></td>
    <td>API key identifies the publisher, and must be provided in order to use the player.
<br><br>
Each API Key is correlated to a closed list of domains that represent the publisher domains. Only
URLs that belong to one of these domains are able to be played by the web player.
<br><br>
During the piloting phase, the API Key will be provided to the publisher by Google. Other API Keys
that were generated using the Google Cloud Console won’t work.
</td>
  </tr>
    <tr>
    <td width="20%"><strong>data-tracking-ids (required)</strong></td>
    <td>The list of the <a href="https://support.google.com/analytics/answer/7372977">
Google Analytics tracking IDs</a> to send the player metrics to (comma separated).
<br><br>
You are required to have a Google Analytics tracking ID in order to use this player during the
pilot period. The tracking ID will be provided to you by Google.
<br><br>
If you want to send the player metrics also to your Google Analytics account, add your tracking ID 
(or IDs) to this list.
</td>
  </tr>
  <tr>
    <td width="20%"><strong>data-voice (required)</strong></td>
    <td>The voice to use for generating the Text-to-Speech audio. Publishers should use only
a single voice and only from the supported voices list (TBD).</td>
  </tr>
  <tr>
    <td width="20%"><strong>data-url</strong></td>
    <td>The canonical URL of the web page to read aloud. The URL must be publicly accessible and
free of any PII. The URL must be on a domain that was configured by Google and correlated with the
specific API key.
<br><br>
When the parameter isn’t provided, the player uses the Canonical URL link tag of the current page.
This is useful for reading aloud the content of the current page and only a single Read Aloud
player is embedded in the page (no infinite scroll).
<br><br>
This value overrides it, and publishers are required to set it only in these cases:
<ol>
  <li>Other page - When the player is embedded in a different page than the one that its content
should be read aloud. In this case, set this parameter to the canonical URL of the other page.</li>
  <li>Multiple players - When there are multiple players on the same page, see Multiple players
(infinite scroll). In this case, set this parameter to the canonical URL of the article that the
player should read aloud.</li>
  <li>Canonical URL tag is missing - When the Canonical URL link tag of the current page is missing
(and cannot be added). In this case, set this parameter to the canonical URL of the page.</td>
</li>
</ol>
  </tr>
  <tr>
    <td width="20%"><strong>data-speakable</strong></td>
    <td>Controls the contents to read aloud.
<br><br>
When present, uses text only from elements annotated with 
<a href="https://developers.google.com/search/docs/data-types/speakable">speakable markup</a>, otherwise, 
Google analyzes the document automatically to choose the suitable text parts.
  </tr>
  <tr>
    <td width="20%"><strong>data-call-to-action-label</strong></td>
    <td>The call to action label that is shown before the user pressed on <i>play</i> for the 
first time. Publishers can use it as a teaser to invite users to press the <i>play</i> button. 
If not present, "Listen to article" (localized) is shown. The string can be in any language.</td>
  </tr>
  <tr>
    <td width="20%"><strong>data-intro</strong></td>
    <td>The URL of the MP3 audio file which will be played before the player starts reading from 
the beginning. The intro can be used by publishers to create a unique opening for each playback. 
The intro is played whenever a listener starts playback from the beginning.</td>
  </tr>
  <tr>
    <td width="20%"><strong>data-outro</strong></td>
    <td>The URL of the MP3 audio file which will be played after the player ends reading. The 
outro can be used by publishers to create a unique ending for each playback.</td>
  </tr>
  <tr>
    <td width="20%"><strong>data-ad-tag-url</strong></td>
    <td>A complete <a href ="https://support.google.com/admanager/table/9749596">VAST ad tag URL</a> 
with parameters for playing pre-roll audio ads. When present, audio ads will be played before 
reading aloud page contents, after the user clicks on the play button for the first time. If not 
present, only page content will be played.<br/>
The ad tag URL must include the following parameters:

<ul>
  <li>iu=[Ad unit code]</li>
  <li>sz=1x1</li>
  <li>ad_type=audio</li>
  <li>output=vast</li>
  <li>unviewed_position_start=1</li>
  <li>env=instream</li>
  <li>vad_type=linear</li>
</ul></td>
  </tr>
</table>

## Usage

Include an `amp-google-read-aloud-player` on your AMP document:

```html
<amp-google-read-aloud-player
  height="65"
  data-api-key="<YOUR_API_KEY>"
  data-tracking-ids="<YOUR_TRACKING_IDS>"
  data-voice="<YOUR_VOICE>"
></amp-google-read-aloud-player>
```

## Validation

See [amp-google-read-aloud-player rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-google-read-aloud-player/validator-amp-google-read-aloud-player.protoascii)
in the AMP validator specification.
