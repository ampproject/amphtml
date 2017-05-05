# <a name="amp-ad"></a> `amp-ad` / `amp-embed`

{% call callout('Note', type='note') %}
The specification of `amp-ad` / `amp-embed` is likely to significantly evolve over time. The current approach is designed to bootstrap the format to be able to show ads.
{% endcall %}

<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>A container to display an ad. The <code>amp-embed</code> is an alias to the <code>amp-ad</code> tag, deriving all of its functionality with a different tag name. Use <code>amp-embed</code> when semantically more accurate. AMP documents only support ads/embeds served via HTTPS.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js">&lt;/script></code> Note: amp-ad may still work without this script, but we highly recommend it for future compatibility</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-ad/">Annotated code example for amp-ad</a></td>
  </tr>
</table>

## Behavior

Ads are loaded like all other resources in AMP documents, with a special
custom element called `<amp-ad>`. No ad network provided JavaScript is allowed to run inside the AMP document. Instead the AMP runtime loads an iframe from a
different origin (via iframe sandbox) as the AMP document and executes the ad
network’s JS inside that iframe sandbox.

The `<amp-ad>` requires width and height values to be specified according to the [rule](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-layout.md#tldr-summary-of-layout-requirements--behaviors) of its layout type. It requires a `type` argument that select what ad network is displayed. All `data-*` attributes on the tag are automatically passed as arguments to the code that eventually renders the ad. What `data-` attributes are required for a given type of network depends and must be documented with the ad network.

```html
<amp-ad width=300 height=250
    type="a9"
    data-aax_size="300x250"
    data-aax_pubname="test123"
    data-aax_src="302">
</amp-ad>

<amp-ad width=320 height=140
    type="colombia"
    layout=responsive
    data-clmb_slot="129883"
    data-clmb_position="1"
    data-clmb_section="0">
</amp-ad>

<amp-embed width=400 height=300
    type="taboola"
    layout=responsive
    data-publisher=thepublisher
    data-mode=themode
    data-article=auto
    data-placement="Below Article Thumbnails">
</amp-embed>
```

## Supported ad networks

- [A8](../../ads/a8.md)
- [A9](../../ads/a9.md)
- [AccessTrade](../../ads/accesstrade.md)
- [Adblade](../../ads/adblade.md)
- [AdButler](../../ads/adbutler.md)
- [Adform](../../ads/adform.md)
- [Ad Generation](../../ads/adgeneration.md)
- [Adhese](../../ads/adhese.md)
- [ADITION](../../ads/adition.md)
- [Adman](../../ads/adman.md)
- [AdReactor](../../ads/adreactor.md)
- [AdSense](../../ads/google/adsense.md)
- [AdsNative](../../ads/adsnative.md)
- [AdSpirit](../../ads/adspirit.md)
- [AdSpeed](../../ads/adspeed.md)
- [AdStir](../../ads/adstir.md)
- [AdTech](../../ads/adtech.md)
- [AdThrive](../../ads/adthrive.md)
- [Ad Up Technology](../../ads/aduptech.md)
- [Adverline](../../ads/adverline.md)
- [Adverticum](../../ads/adverticum.md)
- [AdvertServe](../../ads/advertserve.md)
- [Affiliate-B](../../ads/affiliateb.md)
- [AMoAd](../../ads/amoad.md)
- [AppNexus](../../ads/appnexus.md)
- [Atomx](../../ads/atomx.md)
- [Bidtellect](../../ads/bidtellect.md)
- [brainy](../../ads/brainy.md)
- [CA A.J.A. Infeed](../../ads/caajainfeed.md)
- [CA-ProFit-X](../../ads/caprofitx.md)
- [Chargeads](../../ads/chargeads.md)
- [Colombia](../../ads/colombia.md)
- [Content.ad](../../ads/contentad.md)
- [Criteo](../../ads/criteo.md)
- [CSA](../../ads/google/csa.md)
- [CxenseDisplay](../../ads/eas.md)
- [Dianomi](../../ads/dianomi.md)
- [DistroScale](../../ads/distroscale.md)
- [Dot and Media](../../ads/dotandads.md)
- [Doubleclick](../../ads/google/doubleclick.md)
- [E-Planning](../../ads/eplanning.md)
- [Ezoic](../../ads/ezoic.md)
- [FlexOneELEPHANT](../../ads/f1e.md)
- [Felmat](../../ads/felmat.md)
- [Flite](../../ads/flite.md)
- [Fusion](../../ads/fusion.md)
- [GenieeSSP](../../ads/genieessp.md)
- [GMOSSP](../../ads/gmossp.md)
- [Holder](../../ads/holder.md)
- [I-Mobile](../../ads/imobile.md)
- [iBillboard](../../ads/ibillboard.md)
- [Improve Digital](../../ads/improvedigital.md)
- [Index Exchange](../../ads/ix.md)
- [Industrybrains](../../ads/industrybrains.md)
- [InMobi](../../ads/inmobi.md)
- [Kargo](../../ads/kargo.md)
- [Kiosked](../../ads/kiosked.md)
- [Kixer](../../ads/kixer.md)
- [Ligatus](../../ads/ligatus.md)
- [LOKA](../../ads/loka.md)
- [MADS](../../ads/mads.md)
- [MANTIS](../../ads/mantis.md)
- [MediaImpact](../../ads/mediaimpact.md)
- [Media.net](../../ads/medianet.md)
- [Mediavine](../../ads/mediavine.md)
- [Meg](../../ads/meg.md)
- [MicroAd](../../ads/microad.md)
- [Mixpo](../../ads/mixpo.md)
- [myWidget](../../ads/mywidget.md)
- [Nativo](../../ads/nativo.md)
- [Nend](../../ads/nend.md)
- [Nokta](../../ads/nokta.md)
- [Open AdStream (OAS)](../../ads/openadstream.md)
- [OpenX](../../ads/openx.md)
- [plista](../../ads/plista.md)
- [popin](../../ads/popin.md)
- [PubMatic](../../ads/pubmatic.md)
- [Pubmine](../../ads/pubmine.md)
- [PulsePoint](../../ads/pulsepoint.md)
- [Purch](../../ads/purch.md)
- [Rambler&Co](../../ads/capirs.md)
- [Relap](../../ads/relap.md)
- [Revcontent](../../ads/revcontent.md)
- [Rubicon Project](../../ads/rubicon.md)
- [Sharethrough](../../ads/sharethrough.md)
- [Sklik](../../ads/sklik.md)
- [SlimCut Media](../../ads/slimcutmedia.md)
- [Smart AdServer](../../ads/smartadserver.md)
- [smartclip](../../ads/smartclip.md)
- [Sortable](../../ads/sortable.md)
- [SOVRN](../../ads/sovrn.md)
- [SunMedia](../../ads/sunmedia.md)
- [Swoop](../../ads/swoop.md)
- [Teads](../../ads/teads.md)
- [TripleLift](../../ads/triplelift.md)
- [ValueCommerce](../../ads/valuecommerce.md)
- [Webediads](../../ads/webediads.md)
- [Weborama](../../ads/weborama.md)
- [Widespace](../../ads/widespace.md)
- [Xlift](../../ads/xlift.md)
- [Yahoo](../../ads/yahoo.md)
- [YahooJP](../../ads/yahoojp.md)
- [Yieldbot](../../ads/yieldbot.md)
- [Yieldmo](../../ads/yieldmo.md)
- [Yieldone](../../ads/yieldone.md)
- [Zedo](../../ads/zedo.md)
- [Zucks](../../ads/zucks.md)

## Supported embed types

- [Outbrain](../../ads/outbrain.md)
- [Taboola](../../ads/taboola.md)
- [ZergNet](../../ads/zergnet.md)

## Styling

`<amp-ad>` elements may not themselves have or be placed in containers that have CSS `position: fixed` set (with the exception of `amp-lightbox`).
This is due to the UX implications of full page overlay ads. It may be considered to allow similar ad formats in the future inside of AMP controlled containers that maintain certain UX invariants.

## Attributes

**type**

An identifier for the ad network. This selects the template that is used for the ad tag.

**src**

An optional src value for a script tag loaded for this ad network. This can be used with ad networks that require exactly a single script tag to be inserted in the page. The src value must have a prefix that is white-listed for this ad network.

**data-foo-bar**

Most ad networks require further configuration. This can be passed to the network using HTML `data-` attributes. The parameter names are subject to standard data attribute dash to camel case conversion. For example, "data-foo-bar" is send to the ad for configuration as "fooBar".

**json**

An optional attribute to pass a configuration to the ad as an arbitrarily complex JSON object. The object is passed to the ad as-is with no mangling done on the names.

**data-consent-notification-id**

An optional attribute. If provided, will require confirming the [amp-user-notification](../amp-user-notification/amp-user-notification.md) with the given HTML-id until the "AMP client id" for the user (similar to a cookie) is passed to the ad. The means ad rendering is delayed until the user confirmed the notification.

**data-loading-strategy**

An optional attribute that takes a float value in range of [0, 3], which instructs the ad to start loading when it's within the given number of viewports away from the current viewport. Use a smaller value to gain higher degree of viewability, with the risk of generating fewer views. If the attribute is not used, the default value is 3. If the attribute is used but the value is left blank, then a float value is assigned by the system which optimizes for viewability without drastically impacting the views.

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Placeholder

Optionally, `amp-ad` supports a child element with the `placeholder` attribute. If supported by the ad network, this element is shown until the ad is available for viewing.

```html
<amp-ad width=300 height=250
    type="foo">
  <div placeholder>Loading ...</div>
</amp-ad>
```

## No Ad available
- `amp-ad` supports a child element with the `fallback` attribute. If supported by the ad network, this element is shown if no ad is available for this slot.
- If there is no fallback element available, the amp-ad tag will be collapsed (set to `display: none`) if the ad sends a message that the ad slot cannot be filled and AMP determines that this operation can be performed without affecting the user's scroll position.

Example with fallback:

```html
<amp-ad width=300 height=250 type="foo">
  <div fallback>No ad for you</div>
</amp-ad>
```

## Serving video ads
AMP natively supports a number video players like BrightCove, DailyMotion etc that can monetize ads. For a full list, see [here](https://www.ampproject.org/docs/reference/components#audio-video).

If you use a player that is not supported in AMP, you can serve your custom player using [amp-iframe](https://ampbyexample.com/components/amp-iframe/).

When using `amp-iframe` approach:
 - Make sure there is a poster if loading the player in the first viewport. [Details](../amp-iframe/amp-iframe.md#iframe-with-placeholder).
 - Video and poster have to be served over HTTPS.


## Running ads from a custom domain

AMP supports loading the bootstrap iframe that is used to load ads from a custom domain such as your own domain.

To enable this, copy the file [remote.html](../../3p/remote.html) to your web server. Next up add the following meta tag to your AMP file(s):

```html
<meta name="amp-3p-iframe-src" content="https://assets.your-domain.com/path/to/remote.html">
```

The `content` attribute of the meta tag is the absolute URL to your copy of the remote.html file on your web server. This URL must use a "https" schema. It cannot reside on the same origin as your AMP files. For example, if you host AMP files on `www.example.com`, this URL must not be on `www.example.com` but `something-else.example.com` is OK. See ["Iframe origin policy"](../../spec/amp-iframe-origin-policy.md) for further details on allowed origins for iframes.

### Security

**Validate incoming data** before passing it on to the `draw3p` function, to make sure your iframe only does things it expects to do. This is true, in particular, for ad networks that allow custom JavaScript injection.

Iframes should also enforce that they are only iframed into origins that they expect to be iframed into. The origins would be:

- your own origins
- https://cdn.ampproject.org for the AMP cache

In the case of the AMP cache you also need to check that the "source origin" (origin of the document served by cdn.ampproject.org) is one of your origins.

Enforcing origins can be done with the 3rd argument to `draw3p` and must additionally be done using the [allow-from](https://developer.mozilla.org/en-US/docs/Web/HTTP/X-Frame-Options) directive for full browser support.

### Enhance incoming ad configuration

This is completely optional: It is sometimes desired to further process the incoming iframe configuration before drawing the ad using AMP's built-in system.

This is supported by passing a callback to the `draw3p` function call in the [remote.html](../../3p/remote.html) file. The callback receives the incoming configuration as first argument and then receives another callback as second argument (Called `done` in the example below). This callback must be called with the updated config in order for ad rendering to proceed.

Example:

```JS
draw3p(function(config, done) {
  config.targeting = Math.random() > 0.5 ? 'sport' : 'fashion';
  // Don't actually call setTimeout here. This should only serve as an
  // example that is OK to call the done callback asynchronously.
  setTimeout(function() {
    done(config);
  }, 100)
}, ['allowed-ad-type'], ['your-domain.com']);
```

## Validation

See [amp-ad rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-ad/0.1/validator-amp-ad.protoascii) in the AMP validator specification.

## Notes

To use `<amp-ad>` or `<amp-embed>`, the script to the `amp-ad` library is needed. It's recommended that you add the script manually; however, currently, it will be automatically fetched when `amp-ad` is used.


## Supported ad networks

- [A8](../../ads/a8.md)
- [A9](../../ads/a9.md)
- [AccessTrade](../../ads/accesstrade.md)
- [Adblade](../../ads/adblade.md)
- [AdButler](../../ads/adbutler.md)
- [Adform](../../ads/adform.md)
- [Ad Generation](../../ads/adgeneration.md)
- [Adhese](../../ads/adhese.md)
- [ADITION](../../ads/adition.md)
- [Adman](../../ads/adman.md)
- [AdReactor](../../ads/adreactor.md)
- [AdSense](../../ads/google/adsense.md)
- [AdsNative](../../ads/adsnative.md)
- [AdSpirit](../../ads/adspirit.md)
- [AdSpeed](../../ads/adspeed.md)
- [AdStir](../../ads/adstir.md)
- [AdTech](../../ads/adtech.md)
- [AdThrive](../../ads/adthrive.md)
- [Ad Up Technology](../../ads/aduptech.md)
- [Adverline](../../ads/adverline.md)
- [Adverticum](../../ads/adverticum.md)
- [AdvertServe](../../ads/advertserve.md)
- [Affiliate-B](../../ads/affiliateb.md)
- [AMoAd](../../ads/amoad.md)
- [AppNexus](../../ads/appnexus.md)
- [Atomx](../../ads/atomx.md)
- [brainy](../../ads/brainy.md)
- [CA A.J.A. Infeed](../../ads/caajainfeed.md)
- [CA-ProFit-X](../../ads/caprofitx.md)
- [Chargeads](../../ads/chargeads.md)
- [Colombia](../../ads/colombia.md)
- [Content.ad](../../ads/contentad.md)
- [Criteo](../../ads/criteo.md)
- [CSA](../../ads/google/csa.md)
- [CxenseDisplay](../../ads/eas.md)
- [Dianomi](../../ads/dianomi.md)
- [DistroScale](../../ads/distroscale.md)
- [Dot and Media](../../ads/dotandads.md)
- [Doubleclick](../../ads/google/doubleclick.md)
- [E-Planning](../../ads/eplanning.md)
- [Ezoic](../../ads/ezoic.md)
- [FlexOneELEPHANT](../../ads/f1e.md)
- [Felmat](../../ads/felmat.md)
- [Flite](../../ads/flite.md)
- [Fusion](../../ads/fusion.md)
- [GenieeSSP](../../ads/genieessp.md)
- [GMOSSP](../../ads/gmossp.md)
- [Holder](../../ads/holder.md)
- [I-Mobile](../../ads/imobile.md)
- [iBillboard](../../ads/ibillboard.md)
- [Improve Digital](../../ads/improvedigital.md)
- [Index Exchange](../../ads/ix.md)
- [Industrybrains](../../ads/industrybrains.md)
- [InMobi](../../ads/inmobi.md)
- [Kargo](../../ads/kargo.md)
- [Kiosked](../../ads/kiosked.md)
- [Kixer](../../ads/kixer.md)
- [Ligatus](../../ads/ligatus.md)
- [LOKA](../../ads/loka.md)
- [MADS](../../ads/mads.md)
- [MANTIS](../../ads/mantis.md)
- [MediaImpact](../../ads/mediaimpact.md)
- [Media.net](../../ads/medianet.md)
- [Mediavine](../../ads/mediavine.md)
- [Meg](../../ads/meg.md)
- [MicroAd](../../ads/microad.md)
- [Mixpo](../../ads/mixpo.md)
- [myWidget](../../ads/mywidget.md)
- [Nativo](../../ads/nativo.md)
- [Nend](../../ads/nend.md)
- [Nokta](../../ads/nokta.md)
- [Open AdStream (OAS)](../../ads/openadstream.md)
- [OpenX](../../ads/openx.md)
- [plista](../../ads/plista.md)
- [popin](../../ads/popin.md)
- [PubMatic](../../ads/pubmatic.md)
- [Pubmine](../../ads/pubmine.md)
- [PulsePoint](../../ads/pulsepoint.md)
- [Purch](../../ads/purch.md)
- [Rambler&Co](../../ads/capirs.md)
- [Relap](../../ads/relap.md)
- [Revcontent](../../ads/revcontent.md)
- [Rubicon Project](../../ads/rubicon.md)
- [Sharethrough](../../ads/sharethrough.md)
- [Sklik](../../ads/sklik.md)
- [SlimCut Media](../../ads/slimcutmedia.md)
- [Smart AdServer](../../ads/smartadserver.md)
- [smartclip](../../ads/smartclip.md)
- [Sortable](../../ads/sortable.md)
- [SOVRN](../../ads/sovrn.md)
- [SunMedia](../../ads/sunmedia.md)
- [Swoop](../../ads/swoop.md)
- [Teads](../../ads/teads.md)
- [TripleLift](../../ads/triplelift.md)
- [ValueCommerce](../../ads/valuecommerce.md)
- [Webediads](../../ads/webediads.md)
- [Weborama](../../ads/weborama.md)
- [Widespace](../../ads/widespace.md)
- [Xlift](../../ads/xlift.md)
- [Yahoo](../../ads/yahoo.md)
- [YahooJP](../../ads/yahoojp.md)
- [Yieldbot](../../ads/yieldbot.md)
- [Yieldmo](../../ads/yieldmo.md)
- [Yieldone](../../ads/yieldone.md)
- [Zedo](../../ads/zedo.md)
- [Zucks](../../ads/zucks.md)

## Supported embed types

- [Outbrain](../../ads/outbrain.md)
- [Taboola](../../ads/taboola.md)
- [ZergNet](../../ads/zergnet.md)
