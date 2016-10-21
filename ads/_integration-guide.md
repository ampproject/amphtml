If you are an ad technology provider looking to integrate with AMP HTML, please see guidelines below.
In order to ensure minimum latency and quality, please follow the instructions listed [here](../3p/README.md#ads) before submitting a pull request to the AMP open source project. For general guidance on how to get started with contributing to the AMP project, please see [here](../CONTRIBUTING.md).

#### Ad Server

*Examples : DFP, A9*

As an adserver, publishers you support include a javascript library provided by you and place various ‘ad snippets’ that rely on the javascript library to fetch ads and render them on the publisher’s website.

Since AMP doesn’t allow publishers to execute arbitrary JavaScript (like the library above), you will need to contribute to the AMP open source code to allow the amp-ad built-in tag to request ads from your ad server.

For example : Amazon A9 server can be invoked using following syntax :

```html
<amp-ad width=300 height=250
    type="a9"
    data-aax_size="300x250"
    data-aax_pubname="test123"
    data-aax_src="302">
</amp-ad>
```

Also note that each of the attributes that follow ‘type’ are dependent on the parameters that Amazon’s A9 server expects in order to deliver an ad. The file [a9.js](./a9.js) shows you how the parameters are mapped to making a JavaScript call which will invoke the server by invoking the URL : https://c.amazon-adsystem.com/aax2/assoc.js  and appending the corresponding parameters being passed in by the AMP ad tag  and return the ad.

##### Server Side Platform (SSP) or an Ad Exchange

*Examples : Rubicon, Criteo OR Appnexus, Ad-Exchange*

If you are a sell side platform that wants to get called directly from a publisher’s webpage, you will need to follow the same directions as listed integrating with an Ad Server. Adding your own ‘type’ value to the amp-ad tag will allow you to distribute your tag directly to the publisher, so they can insert your tags directly into their AMP pages.

More commonly, SSPs work with the publisher to traffick the SSP’s ad tags in their ad server. In this case, ensure that all assets being loaded by your script in the ad server’s creative are being made over HTTPS. There are some restrictions around some ad formats like expandables, so we recommend that you test out the most commonly delivered creative formats with your publishers.

#### Ad Agency
*Examples : Essence, Omnicom*

Work with your publisher to ensure that the creatives you develop are AMP compliant. Since all creatives are served into iframes whose size is determined when the ad is called, ensure that your creative doesn't try to modify the size of the iframe.

Ensure that all assets that are part of the creative are requested using HTTPS.
Some ad formats are not fully supported at the moment and we recommend testing the creatives in an AMP environment. Some examples are : Rich Media Expandables, Interstitials, Page Level Ads

#### Video Player

*Examples : Brightcove, Ooyala*

A video player that works in regular HTML pages will not work in AMP and therefore a specific tag needs to be created that will allow the AMP runtime to load your player.
Brightcove has created a custom [amp-brightcove](https://github.com/ampproject/amphtml/blob/master/extensions/amp-brightcove/amp-brightcove.md) tag that allows media and ads to be played in AMP pages.

A brightcove player can be invoked by the following:

```html
<amp-brightcove
      data-account="906043040001"
      data-video-id="1401169490001"
      data-player="180a5658-8be8-4f33-8eba-d562ab41b40c"
      layout="responsive" width="480" height="270">
  </amp-brightcove>
```
For instructions on how to develop an amp tag like brightcove, please see pull request [here](https://github.com/ampproject/amphtml/pull/1052).

#### Video Ad Network

*Examples : Tremor, Brightroll*

If you are a video ad network, please work with your publisher to ensure that :

- All video assets are being served over HTTPS
- The publisher’s video player has AMP support

#### Data Management Platform (DMP)
*Examples : KRUX, Bluekai*

[See how to enhance custom ad configuration](https://github.com/ampproject/amphtml/blob/master/builtins/amp-ad.md#enhance-incoming-ad-configuration)

You can use a similar approach to enrich the ad call by passing in audience segments that you get from the user cookie into the ad call.

#### Viewability Provider

*Examples : MOAT, Integral Ad Science*

Viewability providers typically integrate with publishers via the ad server’s creative wrappers. If that is the case, ensure that the creative wrapper loads all assets over HTTPS.

For e.g. for MOAT, make sure http://js.moatads.com is switched to  https://z.moatads.com

Also see approach to using the [intersection observer pattern](https://github.com/ampproject/amphtml/blob/master/ads/README.md#ad-viewability).

#### Content-Recommendation Platform

*Examples : Taboola, Outbrain*

Useful if you have some piece of JavaScript embeded on the publisher website today but the approach will not work in AMP pages. If you would like to recommend content on an AMP page, we suggest that you use the [`amp-embed` extension](https://www.ampproject.org/docs/reference/components/amp-ad) to request the content details. Please see the [Taboola](https://github.com/ampproject/amphtml/blob/master/ads/taboola.md) example.
