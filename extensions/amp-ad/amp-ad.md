---
$category@: ads-analytics
formats:
  - websites
teaser:
  text: A container to display an ad.
---

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

# amp-ad / amp-embed

## Usage

The `amp-embed` is an alias to the `amp-ad` tag, deriving all of its functionality with a different tag name. Use `amp-embed` when semantically more accurate. AMP documents only support ads/embeds served via HTTPS.

[tip type="note"]
The specification of `amp-ad` / `amp-embed` is likely to significantly
evolve over time. The current approach is designed to bootstrap the format to be
able to show ads.
[/tip]

Ads are loaded like all other resources in AMP documents, with a special
custom element called `<amp-ad>`. No ad network-provided JavaScript is allowed to run inside the AMP document. Instead, the AMP runtime loads an iframe from a
different origin (via iframe sandbox) as the AMP document and executes the ad
network’s JS inside that iframe sandbox.

The `<amp-ad>` requires width and height values to be specified according to the [rule](<https://amp.dev/documentation/guides-and-tutorials/learn/amp-html-layout/#(tl;dr)-summary-of-layout-requirements-&-behaviors>) of its layout type. It requires a `type` argument that select what ad network is displayed. All `data-*` attributes on the tag are automatically passed as arguments to the code that eventually renders the ad. What `data-` attributes are required for a given type of network depends and must be documented with the ad network.

**Example: Displaying a few ads**

[example preview="inline" playground="true" imports="amp-ad"]

```html
<amp-ad
  type="a9"
  data-amzn_assoc_ad_mode="auto"
  data-divid="amzn-assoc-ad-fe746097-f142-4f8d-8dfb-45ec747632e5"
  data-recomtype="async"
  data-adinstanceid="fe746097-f142-4f8d-8dfb-45ec747632e5"
  width="300"
  height="250"
  data-aax_size="300x250"
  data-aax_pubname="test123"
  data-aax_src="302"
>
</amp-ad>
<amp-ad
  width="300"
  height="250"
  type="industrybrains"
  data-width="300"
  data-height="250"
  data-cid="19626-3798936394"
>
</amp-ad>
<amp-embed
  type="taboola"
  width="400"
  height="300"
  layout="responsive"
  data-publisher="amp-demo"
  data-mode="thumbnails-a"
  data-placement="Ads Example"
  data-article="auto"
>
</amp-embed>
```

[/example]

### Placeholder

Optionally, `amp-ad` supports a child element with the `placeholder` attribute. If supported by the ad network, this element is shown until the ad is available for viewing. Learn more in [Placeholders & Fallbacks](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/placeholders).

```html
<amp-ad width="300" height="250" type="foo">
  <div placeholder>Loading ...</div>
</amp-ad>
```

### No ad available

If no ad is available for the slot, AMP attempts to collapse the `amp-ad` element (that is, set to `display: none`). AMP determines that this operation can be performed without affecting the user's scroll position. If the ad is in the current viewport, the ad will not be collapsed because it affects the user's scroll position; however, if the ad is outside of the current viewport, it will be collapsed.

In the case that the attempt to collapse fails. The `amp-ad` component supports a child element with the `fallback` attribute. If there is a fallback element in presence, the customized fallback element is shown. Otherwise AMP will apply a default fallback.

**Example with fallback:**

```html
<amp-ad width="300" height="250" type="foo">
  <div fallback>No ad for you</div>
</amp-ad>
```

### Serving video ads

There are 3 ways to monetize videos in AMP with video ads:

1. AMP natively supports a number video players like BrightCove, DailyMotion, etc. that can monetize ads. For a full list, see the [media](https://amp.dev/documentation/components/?referrer=ampproject.org#media) components.

2. Use the [amp-ima-video](https://amp.dev/documentation/components/amp-ima-video.html) component that comes with a built-in IMA SDK and HTML5 video player

3. If you use a video player that is not supported in AMP, you can serve your custom player using [amp-iframe](https://amp.dev/documentation/examples/components/amp-iframe/).
   When using `amp-iframe` approach:
   _ Make sure there is a poster if loading the player in the first viewport. [Details](https://amp.dev/documentation/components/amp-iframe#iframe-with-placeholder).
   _ Video and poster must be served over HTTPS.

### Running ads from a custom domain

AMP supports loading the bootstrap iframe that is used to load ads from a custom domain such as your own domain.

To enable this, copy the file [remote.html](../../3p/remote.html) to your web server. Next up add the following meta tag to your AMP file(s):

```html
<meta
  name="amp-3p-iframe-src"
  content="https://assets.your-domain.com/path/to/remote.html"
/>
```

The `content` attribute of the meta tag is the absolute URL to your copy of the remote.html file on your web server. This URL must use a "https" schema. It cannot reside on the same origin as your AMP files. For example, if you host AMP files on `www.example.com`, this URL must not be on `www.example.com` but `something-else.example.com` is OK. See ["Iframe origin policy"](../../spec/amp-iframe-origin-policy.md) for further details on allowed origins for iframes.

#### Security

**Validate incoming data** before passing it on to the `draw3p` function, to make sure your iframe only does things it expects to do. This is true, in particular, for ad networks that allow custom JavaScript injection.

Iframes should also enforce that they are only iframed into origins that they expect to be iframed into. The origins would be:

-   your own origins
-   `https://cdn.ampproject.org` for the AMP cache

In the case of the AMP cache you also need to check that the "source origin" (origin of the document served by cdn.ampproject.org) is one of your origins.

Enforcing origins can be done with the 3rd argument to `draw3p` and must additionally be done using the [allow-from](https://developer.mozilla.org/en-US/docs/Web/HTTP/X-Frame-Options) directive for full browser support.

#### Enhance incoming ad configuration

This is completely optional: It is sometimes desired to enhance the ad request before making the ad request to the ad server.

If your ad network supports [fast fetch](https://amp.dev/documentation/guides-and-tutorials/contribute/adnetwork_integration#creating-an-amp-ad-implementation), then please use [Real Time Config](https://github.com/ampproject/amphtml/blob/master/extensions/amp-a4a/rtc-documentation.md) (RTC). (e.g. DoubleClick and AdSense integrations both support fast fetch and RTC)

If your ad network uses delayed fetch, you can pass a callback to the `draw3p` function call in the [remote.html](../../3p/remote.html) file. The callback receives the incoming configuration as first argument and then receives another callback as second argument (Called `done` in the example below). This callback must be called with the updated config in order for ad rendering to proceed.

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

## Attributes

### `type` (required)

Specifies an identifier for the
[ad network](#supported-ad-networks).
The `type` attribute selects the template to use for the ad tag.

### `data-foo-bar`

Most ad networks require further configuration, which can be passed to the
network by using HTML `data–` attributes. The parameter names are subject to
standard data attribute dash to camel case conversion. For example,
"data-foo-bar" is send to the ad for configuration as "fooBar". See the
documentation for the
[ad network](#supported-ad-networks)
on which attributes can be used.

### `data-vars-foo-bar`

Attributes starting with `data-vars–` are reserved for
[`amp-analytics` vars](https://github.com/ampproject/amphtml/blob/master/extensions/amp-analytics/analytics-vars.md#variables-as-data-attribute).

### `src` (optional)

Use this attribute to load a script tag for the specified ad network. This can
be used for ad networks that require exactly a single script tag to be inserted
in the page. The `src` value must have a prefix that is allow-listed for the
specified ad network, and the value must use `https` protocol.

### `json` (optional)

Use this attribute to pass a configuration to the ad as an arbitrarily complex
JSON object. The object is passed to the ad as-is with no mangling done on the
names.

### `data-consent-notification-id` (optional)

If provided, requires confirming the
[amp-user-notification](https://amp.dev/documentation/components/amp-user-notification.html)
with the given HTML-id until the "AMP client id" for the user (similar to a
cookie) is passed to the ad. This means that ad rendering is delayed until the
user confirms the notification.

### `data-loading-strategy` (optional)

Instructs the ad to start loading when the ad is within the given number of
viewports away from the current viewport. Without the `data-loading-strategy`
attribute, the number is 3 by default. You can specify a float value in the
range of \[0, 3\] (If the value is not specified the value is set to 1.25).

Use a smaller value to gain a higher degree of viewability (i.e., increase the
chance that an ad, once loaded, will be seen) but with the risk of generating
fewer impressions (i.e., fewer ads loaded). If the attribute is specified but
the value is left blank, the system assigns a float value, which optimizes for
viewability without drastically impacting the impressions. Note, specifying
`prefer-viewability-over-views` as the value also automatically optimizes
viewability.

### `data-ad-container-id` (optional)

Informs the ad of the container component id in the case of attempting to
collapse. The container component must be an `<amp-layout>` component that's
parent of the ad. When the `data-ad-container-id` is specified, and such a
`<amp-layout>` container component is found, AMP runtime will try to collapse
the container component instead of the ad component during no fill. This feature
can be useful when an ad indicator is in presence.

### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"Advertisement"`.

### common attributes

This element includes
[common attributes extended](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes/)
to AMP components.

## Styling

`<amp-ad>` elements may not themselves have or be placed in containers that have CSS `position: fixed` set (with the exception of `amp-lightbox`).
This is due to the UX implications of full page overlay ads. It may be considered to allow similar ad formats in the future inside of AMP controlled containers that maintain certain UX invariants.

## Validation

See [amp-ad rules](validator-amp-ad.protoascii) in the AMP validator specification.

## Supported ad networks

-   [A8](../../ads/a8.md)
-   [A9](../../ads/a9.md)
-   [AccessTrade](../../ads/accesstrade.md)
-   [Adblade](../../ads/adblade.md)
-   [AdButler](../../ads/adbutler.md)
-   [Adform](../../ads/adform.md)
-   [Adfox](../../ads/adfox.md)
-   [Ad Generation](../../ads/adgeneration.md)
-   [AdGlare](../../ads/adglare.md)
-   [Adhese](../../ads/adhese.md)
-   [Adincube](../../ads/adincube.md)
-   [ADITION](../../ads/adition.md)
-   [Adman](../../ads/adman.md)
-   [AdmanMedia](../../ads/admanmedia.md)
-   [Admixer](../../ads/admixer.md)
-   [AdOcean](../../ads/adocean.md)
-   [Adop](../../ads/adop.md)
-   [AdPicker](../../ads/adpicker.md)
-   [AdPlugg](../../ads/adplugg.md)
-   [Adpon](../../ads/adpon.md)
-   [AdReactor](../../ads/adreactor.md)
-   [AdSense](../../ads/google/adsense.md)
-   [AdSensor](../../ads/adsensor.md)
-   [AdServSolutions](../../ads/adservsolutions.md)
-   [AdsLoom](../../ads/adsloom.md)
-   [AdsNative](../../ads/adsnative.md)
-   [AdSpeed](../../ads/adspeed.md)
-   [AdSpirit](../../ads/adspirit.md)
-   [AdStir](../../ads/adstir.md)
-   [AdStyle](../../ads/adstyle.md)
-   [AdTech](../../ads/adtech.md)
-   [Adtelligent](../../ads/adtelligent.md)
-   [AdThrive](../../ads/adthrive.md)
-   [AdUnity](../../ads/adunity.md)
-   [AdUp Technology](../../ads/aduptech.md)
-   [Adventive](../../ads/adventive.md)
-   [Adverline](../../ads/adverline.md)
-   [Adverticum](../../ads/adverticum.md)
-   [AdvertServe](../../ads/advertserve.md)
-   [Adyoulike](../../ads/adyoulike.md)
-   [Affiliate-B](../../ads/affiliateb.md)
-   [AJA](../../ads/aja.md)
-   [AMoAd](../../ads/amoad.md)
-   [Aniview](../../ads/aniview.md)
-   [AnyClip](../../ads/anyclip.md)
-   [AppNexus](../../ads/appnexus.md)
-   [AppVador](../../ads/appvador.md)
-   [Atomx](../../ads/atomx.md)
-   [Baidu](../../ads/baidu.md)
-   [BeaverAds](../../ads/beaverads.md)
-   [BeOpinion](../amp-beopinion/amp-beopinion.md)
-   [Bidtellect](../../ads/bidtellect.md)
-   [Blade](../../ads/blade.md)
-   [brainy](../../ads/brainy.md)
-   [Broadstreet Ads](../../ads/broadstreetads.md)
-   [ByPlay](../../ads/byplay.md)
-   [CA A.J.A. Infeed](../../ads/caajainfeed.md)
-   [CA-ProFit-X](../../ads/caprofitx.md)
-   [Cedato](../../ads/cedato.md)
-   [Colombia](../../ads/colombia.md)
-   [Connatix](../../ads/connatix.md)
-   [Conative](../../ads/conative.md)
-   [Content.ad](../../ads/contentad.md)
-   [Criteo](../../ads/criteo.md)
-   [CSA](../../ads/google/csa.md)
-   [CxenseDisplay](../../ads/eas.md)
-   [Directadvert](../../ads/directadvert.md)
-   [DistroScale](../../ads/distroscale.md)
-   [Dot and Media](../../ads/dotandads.md)
-   [Doubleclick](../../ads/google/doubleclick.md)
-   [DynAd](../../ads/dynad.md)
-   [eADV](../../ads/eadv.md)
-   [E-Planning](../../ads/eplanning.md)
-   [Empower](../../ads/empower.md)
-   [Ezoic](../../ads/ezoic.md)
-   [FeedAd](../../ads/feedad.md)
-   [Felmat](../../ads/felmat.md)
-   [FlexOneELEPHANT](../../ads/f1e.md)
-   [FlexOneHARRIER](../../ads/f1h.md)
-   [Flite](../../ads/flite.md)
-   [fluct](../../ads/fluct.md)
-   [Fork Media](../../ads/forkmedia.md)
-   [FreeWheel](../../ads/freewheel.md)
-   [Fusion](../../ads/fusion.md)
-   [GenieeSSP](../../ads/genieessp.md)
-   [Giraff](../../ads/giraff.md)
-   [Glomex](../../ads/glomex.md)
-   [GMOSSP](../../ads/gmossp.md)
-   [GumGum](../../ads/gumgum.md)
-   [Holder](../../ads/holder.md)
-   [iBillboard](../../ads/ibillboard.md)
-   [Idealmedia](../../ads/idealmedia.md)
-   [I-Mobile](../../ads/imobile.md)
-   [Imonomy](../../ads/imonomy.md)
-   [Imedia](../../ads/imedia.md)
-   [Improve Digital](../../ads/improvedigital.md)
-   [Insticator](../../ads/insticator.md)
-   [Index Exchange](../../ads/ix.md)
-   [Industrybrains](../../ads/industrybrains.md)
-   [InMobi](../../ads/inmobi.md)
-   [Innity](../../ads/innity.md)
-   [Invibes](../../ads/invibes.md)
-   [Iprom](../../ads/iprom.md)
-   [Kargo](../../ads/kargo.md)
-   [Kiosked](../../ads/kiosked.md)
-   [Kixer](../../ads/kixer.md)
-   [Kuadio](../../ads/kuadio.md)
-   [Lentainform](../../ads/lentainform.md)
-   [Ligatus](../../ads/ligatus.md)
-   [LockerDome](../../ads/lockerdome.md)
-   [LOGLY](../../ads/logly.md)
-   [LOKA](../../ads/loka.md)
-   [LuckyAds](../../ads/luckyads.md)
-   [Macaw](../../ads/macaw.md)
-   [MADS](../../ads/mads.md)
-   [MANTIS](../../ads/mantis.md)
-   [Mediaad.org](../../ads/mediaad.md)
-   [Marfeel](../../ads/marfeel.md)
-   [Media.net](../../ads/medianet.md)
-   [Mediavine](../../ads/mediavine.md)
-   [Medyanet](../../ads/medyanet.md)
-   [Meg](../../ads/meg.md)
-   [Mgid](../../ads/mgid.md)
-   [MicroAd](../../ads/microad.md)
-   [MixiMedia](../../ads/miximedia.md)
-   [Mixpo](../../ads/mixpo.md)
-   [Monetizer101](../../ads/monetizer101.md)
-   [mox](../../ads/mox.md)
-   [my6Sense](../../ads/my6sense.md)
-   [MyOffrz](../../ads/myoffrz.md)
-   [myTarget](../../ads/mytarget.md)
-   [myWidget](../../ads/mywidget.md)
-   [NativeRoll](../../ads/nativeroll.md)
-   [Nativery](../../ads/nativery.md)
-   [Nativo](../../ads/nativo.md)
-   [Navegg](../../ads/navegg.md)
-   [Nend](../../ads/nend.md)
-   [NETLETIX](../../ads/netletix.md)
-   [Noddus](../../ads/noddus.md)
-   [Nokta](../../ads/nokta.md)
-   [Newsroom AI](../../ads/nws.md)
-   [Oblivki](../../ads/oblivki.md)
-   [OneAD](../../ads/onead.md)
-   [OnNetwork](../../ads/onnetwork.md)
-   [Open AdStream (OAS)](../../ads/openadstream.md)
-   [OpenX](../../ads/openx.md)
-   [opinary](../../ads/opinary.md)
-   [Pixels](../../ads/pixels.md)
-   [plista](../../ads/plista.md)
-   [polymorphicAds](../../ads/polymorphicads.md)
-   [popin](../../ads/popin.md)
-   [PPStudio](../../ads/ppstudio.md)
-   [Pressboard](../../ads/pressboard.md)
-   [PromoteIQ](../../ads/promoteiq.md)
-   [PubGuru](../../ads/pubguru.md)
-   [PubMatic](../../ads/pubmatic.md)
-   [Pubmine](../../ads/pubmine.md)
-   [Pulse](../../ads/pulse.md)
-   [PulsePoint](../../ads/pulsepoint.md)
-   [PuffNetwork](../../ads/puffnetwork.md)
-   [Purch](../../ads/purch.md)
-   [Rakuten Unified Ads](../../ads/rakutenunifiedads.md)
-   [Rambler&Co](../../ads/capirs.md)
-   [RbInfoxSg](../../ads/rbinfox.md)
-   [Realclick](../../ads/realclick.md)
-   [recomAD](../../ads/recomad.md)
-   [recreativ](../../ads/recreativ.md)
-   [Red for Publishers](../../ads/rfp.md)
-   [Relap](../../ads/relap.md)
-   [RelapPro](../../ads/relappro.md)
-   [Remixd](../../ads/remixd.md)
-   [Revcontent](../../ads/revcontent.md)
-   [RevJet](../../ads/revjet.md)
-   [rnetplus](../../ads/rnetplus.md)
-   [Rubicon Project](../../ads/rubicon.md)
-   [RUNative](../../ads/runative.md)
-   [SAS CI 360 Match](../../ads/sas.md)
-   [Seeding Alliance](../../ads/seedingalliance.md)
-   [Sekindo](../../ads/sekindo.md)
-   [Sharethrough](../../ads/sharethrough.md)
-   [SHE Media](../../ads/shemedia.md)
-   [Sklik](../../ads/sklik.md)
-   [SSP](../../ads/ssp.md)
-   [SlimCut Media](../../ads/slimcutmedia.md)
-   [Smart AdServer](../../ads/smartadserver.md)
-   [smartclip](../../ads/smartclip.md)
-   [SmileWanted](../../ads/smilewanted.md)
-   [sogou Ad](../../ads/sogouad.md)
-   [Sortable](../../ads/sortable.md)
-   [SOVRN](../../ads/sovrn.md)
-   [Speakol](../../ads/speakol.md)
-   [SpotX](../../ads/spotx.md)
-   [SpringAds](../../ads/springAds.md)
-   [Sulvo](../../ads/sulvo.md)
-   [SunMedia](../../ads/sunmedia.md)
-   [Swoop](../../ads/swoop.md)
-   [TcsEmotion](../../ads/tcsemotion.md)
-   [Teads](../../ads/teads.md)
-   [torimochi](../../ads/torimochi.md)
-   [Tracdelight](../../ads/tracdelight.md)
-   [TripleLift](../../ads/triplelift.md)
-   [Trugaze](../../ads/trugaze.md)
-   [UZOU](../../ads/uzou.md)
-   [ValueCommerce](../../ads/valuecommerce.md)
-   [video intelligence](../../ads/videointelligence.md)
-   [Videonow](../../ads/videonow.md)
-   [Viralize](../../ads/viralize.md)
-   [UAS](../../ads/uas.md)
-   [ucfunnel](../../ads/ucfunnel.md)
-   [Unruly](../../ads/unruly.md)
-   [VMFive](../../ads/vmfive.md)
-   [Webediads](../../ads/webediads.md)
-   [Weborama](../../ads/weborama.md)
-   [Widespace](../../ads/widespace.md)
-   [Wisteria](../../ads/wisteria.md)
-   [WPMedia](../../ads/wpmedia.md)
-   [Xlift](../../ads/xlift.md)
-   [Yahoo](../../ads/yahoo.md)
-   [YahooJP](../../ads/yahoojp.md)
-   [Yandex](../../ads/yandex.md)
-   [Yektanet](../../ads/yektanet.md)
-   [Yengo](../../ads/yengo.md)
-   [Yieldbot](../../ads/yieldbot.md)
-   [Yieldmo](../../ads/yieldmo.md)
-   [Yieldone](../../ads/yieldone.md)
-   [Yieldpro](../../ads/yieldpro.md)
-   [Zedo](../../ads/zedo.md)
-   [Zucks](../../ads/zucks.md)

## Supported embed types

-   [1wo](../../ads/1wo.md)
-   [24smi](../../ads/24smi.md)
-   [AdsLoom](../../ads/adsloom.md)
-   [Bringhub](../../ads/bringhub.md)
-   [Dable](../../ads/dable.md)
-   [Engageya](../../ads/engageya.md)
-   [Epeex](../../ads/epeex.md)
-   [Insticator](../../ads/insticator.md)
-   [Jubna](../../ads/jubna.md)
-   [Outbrain](../../ads/outbrain.md)
-   [Postquare](../../ads/postquare.md)
-   [PubExchange](../../ads/pubexchange.md)
-   [ReadMo](../../ads/readmo.md)
-   [Smi2](../../ads/smi2.md)
-   [SVK-Native](../../ads/svknative.md)
-   [Strossle](../../ads/strossle.md)
-   [Taboola](../../ads/taboola.md)
-   [TE Medya](../../ads/temedya.md)
-   [vlyby](../../ads/vlyby.md)
-   [Whopa InFeed](../../ads/whopainfeed.md)
-   [Yahoo Native-Display Ads Federation](../../ads/yahoofedads.md)
-   [Yahoo Native Ads](../../ads/yahoonativeads.md)
-   [Zen](../../ads/zen.md)
-   [ZergNet](../../ads/zergnet.md)
