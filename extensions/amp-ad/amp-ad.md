---
$category@: ads-analytics
formats:
  - websites
teaser:
  text: A container to display an ad.
---

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
  sticky="bottom"
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

If this is a sticky ad unit (`sticky` attribute is set), the entire sticky ad will not be displayed without regards to `fallback` attribute.

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

The `content` attribute of the meta tag is the absolute URL to your copy of the remote.html file on your web server. This URL must use a "https" schema. It cannot reside on the same origin as your AMP files. For example, if you host AMP files on `www.example.com`, this URL must not be on `www.example.com` but `something-else.example.com` is OK. See ["Iframe origin policy"](../../docs/spec/amp-iframe-origin-policy.md) for further details on allowed origins for iframes.

#### Security

**Validate incoming data** before passing it on to the `draw3p` function, to make sure your iframe only does things it expects to do. This is true, in particular, for ad networks that allow custom JavaScript injection.

Iframes should also enforce that they are only iframed into origins that they expect to be iframed into. The origins would be:

-   your own origins
-   `https://cdn.ampproject.org` for the AMP cache

In the case of the AMP cache you also need to check that the "source origin" (origin of the document served by cdn.ampproject.org) is one of your origins.

Enforcing origins can be done with the 3rd argument to `draw3p` and must additionally be done using the [allow-from](https://developer.mozilla.org/en-US/docs/Web/HTTP/X-Frame-Options) directive for full browser support.

#### Enhance incoming ad configuration

This is completely optional: It is sometimes desired to enhance the ad request before making the ad request to the ad server.

If your ad network supports [fast fetch](https://amp.dev/documentation/guides-and-tutorials/contribute/adnetwork_integration#creating-an-amp-ad-implementation), then please use [Real Time Config](https://github.com/ampproject/amphtml/blob/main/extensions/amp-a4a/rtc-documentation.md) (RTC). (e.g. DoubleClick and AdSense integrations both support fast fetch and RTC)

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

### `sticky` (optional)

Use to denote that this is a sticky ad unit and specify the position of this unit. Its value must be one of:

-   top
-   bottom
-   bottom-right
-   left
-   right

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
[`amp-analytics` vars](https://github.com/ampproject/amphtml/blob/main/extensions/amp-analytics/analytics-vars.md#variables-as-data-attribute).

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

`<amp-ad>` elements may not themselves have or be placed in containers that have CSS `position: fixed` set (with the exception of `amp-lightbox` and sticky ad unit).
This is due to the UX implications of full page overlay ads. It may be considered to allow similar ad formats in the future inside of AMP controlled containers that maintain certain UX invariants.

## Validation

See [amp-ad rules](validator-amp-ad.protoascii) in the AMP validator specification.

## Supported ad networks

-   [A8](../../ads/vendors/a8.md)
-   [A9](../../ads/vendors/a9.md)
-   [AccessTrade](../../ads/vendors/accesstrade.md)
-   [Adblade](../../ads/vendors/adblade.md)
-   [AdButler](../../ads/vendors/adbutler.md)
-   [Adform](../../ads/vendors/adform.md)
-   [Adfox](../../ads/vendors/adfox.md)
-   [Ad Generation](../../ads/vendors/adgeneration.md)
-   [AdGlare](../../ads/vendors/adglare.md)
-   [Adhese](../../ads/vendors/adhese.md)
-   [Adincube](../../ads/vendors/adincube.md)
-   [ADITION](../../ads/vendors/adition.md)
-   [Adman](../../ads/vendors/adman.md)
-   [AdmanMedia](../../ads/vendors/admanmedia.md)
-   [Admixer](../../ads/vendors/admixer.md)
-   [Adnuntius](../../ads/vendors/adnuntius.md)
-   [AdOcean](../../ads/vendors/adocean.md)
-   [Adop](../../ads/vendors/adop.md)
-   [AdPicker](../../ads/vendors/adpicker.md)
-   [AdPlugg](../../ads/vendors/adplugg.md)
-   [Adpon](../../ads/vendors/adpon.md)
-   [Adpushup](../../ads/vendors/adpushup.md)
-   [AdReactor](../../ads/vendors/adreactor.md)
-   [Ads2Bid](../../ads/vendors/ads2bid.md)
-   [AdSense](../../ads/google/adsense.md)
-   [AdSensor](../../ads/vendors/adsensor.md)
-   [AdServSolutions](../../ads/vendors/adservsolutions.md)
-   [AdsLoom](../../ads/vendors/adsloom.md)
-   [AdsNative](../../ads/vendors/adsnative.md)
-   [AdSpeed](../../ads/vendors/adspeed.md)
-   [AdSpirit](../../ads/vendors/adspirit.md)
-   [AdStir](../../ads/vendors/adstir.md)
-   [AdStyle](../../ads/vendors/adstyle.md)
-   [Adsviu](../../ads/vendors/adsviu.md)
-   [AdTech](../../ads/vendors/adtech.md)
-   [Adtelligent](../../ads/vendors/adtelligent.md)
-   [AdThrive](../../ads/vendors/adthrive.md)
-   [AdUnity](../../ads/vendors/adunity.md)
-   [AdUp Technology](../../ads/vendors/aduptech.md)
-   [Adventive](../../ads/vendors/adventive.md)
-   [Adverline](../../ads/vendors/adverline.md)
-   [Adverticum](../../ads/vendors/adverticum.md)
-   [AdvertServe](../../ads/vendors/advertserve.md)
-   [Adyoulike](../../ads/vendors/adyoulike.md)
-   [Affiliate-B](../../ads/vendors/affiliateb.md)
-   [Affinity](../../ads/vendors/affinity.md)
-   [AJA](../../ads/vendors/aja.md)
-   [AMoAd](../../ads/vendors/amoad.md)
-   [Andbeyond](../../ads/vendors/andbeyond.md)
-   [Aniview](../../ads/vendors/aniview.md)
-   [AnyClip](../../ads/vendors/anyclip.md)
-   [AppNexus](../../ads/vendors/appnexus.md)
-   [AppVador](../../ads/vendors/appvador.md)
-   [Atomx](../../ads/vendors/atomx.md)
-   [AvantisVideo](../../ads/vendors/avantisvideo.md)
-   [Baidu](../../ads/vendors/baidu.md)
-   [BeaverAds](../../ads/vendors/beaverads.md)
-   [BeOpinion](../amp-beopinion/amp-beopinion.md)
-   [Bidtellect](../../ads/vendors/bidtellect.md)
-   [Blade](../../ads/vendors/blade.md)
-   [brainy](../../ads/vendors/brainy.md)
-   [Broadstreet Ads](../../ads/vendors/broadstreetads.md)
-   [Broadbandy](../../ads/vendors/broadbandy.md)
-   [ByPlay](../../ads/vendors/byplay.md)
-   [CA A.J.A. Infeed](../../ads/vendors/caajainfeed.md)
-   [CA-ProFit-X](../../ads/vendors/caprofitx.md)
-   [Cedato](../../ads/vendors/cedato.md)
-   [Clever](../../ads/vendors/clever.md)
-   [Cognativex](../../ads/vendors/cognativex.md)
-   [Colombia](../../ads/vendors/colombia.md)
-   [Colombiafeed](../../ads/vendors/colombiafeed.md)
-   [Connatix](../../ads/vendors/connatix.md)
-   [Conative](../../ads/vendors/conative.md)
-   [Content.ad](../../ads/vendors/contentad.md)
-   [Criteo](../../ads/vendors/criteo.md)
-   [CSA](../../ads/vendors/csa.md)
-   [Digital exchange](../../ads/vendors/dex.js)
-   [Digiteka](../../ads/vendors/digiteka.md)
-   [Directadvert](../../ads/vendors/directadvert.md)
-   [DistroScale](../../ads/vendors/distroscale.md)
-   [Dot and Media](../../ads/vendors/dotandads.md)
-   [Doubleclick](../../ads/google/doubleclick.md)
-   [DynAd](../../ads/vendors/dynad.md)
-   [eADV](../../ads/vendors/eadv.md)
-   [E-Planning](../../ads/vendors/eplanning.md)
-   [EXCO](../../ads/vendors/exco.md)
-   [Empower](../../ads/vendors/empower.md)
-   [Ezoic](../../ads/vendors/ezoic.md)
-   [FeedAd](../../ads/vendors/feedad.md)
-   [Felmat](../../ads/vendors/felmat.md)
-   [finative](../../ads/vendors/finative.md)
-   [FlexOneELEPHANT](../../ads/vendors/f1e.md)
-   [FlexOneHARRIER](../../ads/vendors/f1h.md)
-   [Flite](../../ads/vendors/flite.md)
-   [fluct](../../ads/vendors/fluct.md)
-   [Fork Media](../../ads/vendors/forkmedia.md)
-   [FreeWheel](../../ads/vendors/freewheel.md)
-   [Fusion](../../ads/vendors/fusion.md)
-   [GenieeSSP](../../ads/vendors/genieessp.md)
-   [Geozo](../../ads/vendors/geozo.md)
-   [Giraff](../../ads/vendors/giraff.md)
-   [Glomex](../../ads/vendors/glomex.md)
-   [GMOSSP](../../ads/vendors/gmossp.md)
-   [GumGum](../../ads/vendors/gumgum.md)
-   [Holder](../../ads/vendors/holder.md)
-   [iBillboard](../../ads/vendors/ibillboard.md)
-   [I-Mobile](../../ads/vendors/imobile.md)
-   [Imonomy](../../ads/vendors/imonomy.md)
-   [Imedia](../../ads/vendors/imedia.md)
-   [Improve Digital](../../ads/vendors/improvedigital.md)
-   [IncrementX](../../ads/vendors/incrementx.md)
-   [Insticator](../../ads/vendors/insticator.md)
-   [InsurAds](../../ads/vendors/insurads.md)
-   [Index Exchange](../../ads/vendors/ix.md)
-   [Industrybrains](../../ads/vendors/industrybrains.md)
-   [InMobi](../../ads/vendors/inmobi.md)
-   [Innity](../../ads/vendors/innity.md)
-   [Invibes](../../ads/vendors/invibes.md)
-   [Iprom](../../ads/vendors/iprom.md)
-   [Jioads](../../ads/vendors/jioads.md)
-   [Jixie](../../ads/vendors/jixie.md)
-   [Kargo](../../ads/vendors/kargo.md)
-   [Ketshwa](../../ads/vendors/ketshwa.md)
-   [Kiosked](../../ads/vendors/kiosked.md)
-   [Kixer](../../ads/vendors/kixer.md)
-   [Kuadio](../../ads/vendors/kuadio.md)
-   [Ligatus](../../ads/vendors/ligatus.md)
-   [LockerDome](../../ads/vendors/lockerdome.md)
-   [LOGLY](../../ads/vendors/logly.md)
-   [LOKA](../../ads/vendors/loka.md)
-   [LuckyAds](../../ads/vendors/luckyads.md)
-   [Macaw](../../ads/vendors/macaw.md)
-   [MADS](../../ads/vendors/mads.md)
-   [MANTIS](../../ads/vendors/mantis.md)
-   [Mediaad.org](../../ads/vendors/mediaad.md)
-   [Marfeel](../../ads/vendors/marfeel.md)
-   [Media.net](../../ads/vendors/medianet.md)
-   [Mediavine](../../ads/vendors/mediavine.md)
-   [Medyanet](../../ads/vendors/medyanet.md)
-   [Meg](../../ads/vendors/meg.md)
-   [MicroAd](../../ads/vendors/microad.md)
-   [MixiMedia](../../ads/vendors/miximedia.md)
-   [Mixpo](../../ads/vendors/mixpo.md)
-   [Monetizer101](../../ads/vendors/monetizer101.md)
-   [mox](../../ads/vendors/mox.md)
-   [my6Sense](../../ads/vendors/my6sense.md)
-   [myFinance](../../ads/vendors/myfinance.md)
-   [MyOffrz](../../ads/vendors/myoffrz.md)
-   [myTarget](../../ads/vendors/mytarget.md)
-   [myWidget](../../ads/vendors/mywidget.md)
-   [NativeRoll](../../ads/vendors/nativeroll.md)
-   [Nativery](../../ads/vendors/nativery.md)
-   [Nativo](../../ads/vendors/nativo.md)
-   [Navegg](../../ads/vendors/navegg.md)
-   [Nend](../../ads/vendors/nend.md)
-   [NETLETIX](../../ads/vendors/netletix.md)
-   [Noddus](../../ads/vendors/noddus.md)
-   [Nokta](../../ads/vendors/nokta.md)
-   [Newsroom AI](../../ads/vendors/nws.md)
-   [Oblivki](../../ads/vendors/oblivki.md)
-   [OneAD](../../ads/vendors/onead.md)
-   [OnNetwork](../../ads/vendors/onnetwork.md)
-   [Open AdStream (OAS)](../../ads/vendors/openadstream.md)
-   [OpenX](../../ads/vendors/openx.md)
-   [opinary](../../ads/vendors/opinary.md)
-   [Pixels](../../ads/vendors/pixels.md)
-   [plista](../../ads/vendors/plista.md)
-   [polymorphicAds](../../ads/vendors/polymorphicads.md)
-   [popin](../../ads/vendors/popin.md)
-   [PPStudio](../../ads/vendors/ppstudio.md)
-   [Pressboard](../../ads/vendors/pressboard.md)
-   [PromoteIQ](../../ads/vendors/promoteiq.md)
-   [Pubfuture](../../ads/vendors/pubfuture.md)
-   [PubGuru](../../ads/vendors/pubguru.md)
-   [PubMatic](../../ads/vendors/pubmatic.md)
-   [Pubmine](../../ads/vendors/pubmine.md)
-   [PubScale](../../ads/vendors/pubscale.md)
-   [Pulse](../../ads/vendors/pulse.md)
-   [PulsePoint](../../ads/vendors/pulsepoint.md)
-   [PuffNetwork](../../ads/vendors/puffnetwork.md)
-   [Purch](../../ads/vendors/purch.md)
-   [R9x](../../ads/vendors/r9x.md)
-   [Rakuten Unified Ads](../../ads/vendors/rakutenunifiedads.md)
-   [Rambler&Co](../../ads/vendors/capirs.md)
-   [RbInfoxSg](../../ads/vendors/rbinfox.md)
-   [Rcmwidget](../../ads/vendors/rcmwidget.md)
-   [Realclick](../../ads/vendors/realclick.md)
-   [recomAD](../../ads/vendors/recomad.md)
-   [recreativ](../../ads/vendors/recreativ.md)
-   [Red for Publishers](../../ads/vendors/rfp.md)
-   [Relap](../../ads/vendors/relap.md)
-   [RelapPro](../../ads/vendors/relappro.md)
-   [Remixd](../../ads/vendors/remixd.md)
-   [Revcontent](../../ads/vendors/revcontent.md)
-   [RevJet](../../ads/vendors/revjet.md)
-   [rnetplus](../../ads/vendors/rnetplus.md)
-   [Rubicon Project](../../ads/vendors/rubicon.md)
-   [RUNative](../../ads/vendors/runative.md)
-   [Sabavision](../../ads/vendors/sabavision.md)
-   [SAS CI 360 Match](../../ads/vendors/sas.md)
-   [Seeding Alliance](../../ads/vendors/seedingalliance.md)
-   [Sekindo](../../ads/vendors/sekindo.md)
-   [Sharethrough](../../ads/vendors/sharethrough.md)
-   [SHE Media](../../ads/vendors/shemedia.md)
-   [Sklik](../../ads/vendors/sklik.md)
-   [Skoiy](../../ads/vendors/skoiy.md)
-   [SSP](../../ads/vendors/ssp.md)
-   [SlimCut Media](../../ads/vendors/slimcutmedia.md)
-   [Smart AdServer](../amp-ad-network-smartadserver-impl/amp-ad-network-smartadserver-impl-internal.md)
-   [smartclip](../../ads/vendors/smartclip.md)
-   [SmileWanted](../../ads/vendors/smilewanted.md)
-   [sogou Ad](../../ads/vendors/sogouad.md)
-   [Sortable](../../ads/vendors/sortable.md)
-   [SOVRN](../../ads/vendors/sovrn.md)
-   [Speakol](../../ads/vendors/speakol.md)
-   [SpotX](../../ads/vendors/spotx.md)
-   [SpringAds](../../ads/vendors/springAds.md)
-   [Sulvo](../../ads/vendors/sulvo.md)
-   [SunMedia](../../ads/vendors/sunmedia.md)
-   [Swoop](../../ads/vendors/swoop.md)
-   [Tagon](../../ads/vendors/tagon.md)
-   [Tail](../../ads/vendors/tail.md)
-   [TcsEmotion](../../ads/vendors/tcsemotion.md)
-   [Teads](../../ads/vendors/teads.md)
-   [torimochi](../../ads/vendors/torimochi.md)
-   [Tracdelight](../../ads/vendors/tracdelight.md)
-   [TrafficStars](../../ads/vendors/trafficstars.md)
-   [TripleLift](../../ads/vendors/triplelift.md)
-   [Trugaze](../../ads/vendors/trugaze.md)
-   [UZOU](../../ads/vendors/uzou.md)
-   [ValueCommerce](../../ads/vendors/valuecommerce.md)
-   [video intelligence](../../ads/vendors/videointelligence.md)
-   [Videonow](../../ads/vendors/videonow.md)
-   [Viralize](../../ads/vendors/viralize.md)
-   [UAS](../../ads/vendors/uas.md)
-   [ucfunnel](../../ads/vendors/ucfunnel.md)
-   [Unruly](../../ads/vendors/unruly.md)
-   [VMFive](../../ads/vendors/vmfive.md)
-   [vox](../../ads/vendors/vox.md)
-   [Webediads](../../ads/vendors/webediads.md)
-   [Weborama](../../ads/vendors/weborama.md)
-   [Widespace](../../ads/vendors/widespace.md)
-   [Wisteria](../../ads/vendors/wisteria.md)
-   [WPMedia](../../ads/vendors/wpmedia.md)
-   [Wunderkind](../../ads/vendors/wunderkind.md)
-   [Xlift](../../ads/vendors/xlift.md)
-   [Yahoo](../../ads/vendors/yahoo.md)
-   [YahooJP](../../ads/vendors/yahoojp.md)
-   [Yandex](../../ads/vendors/yandex.md)
-   [Yektanet](../../ads/vendors/yektanet.md)
-   [Yengo](../../ads/vendors/yengo.md)
-   [Yieldbot](../../ads/vendors/yieldbot.md)
-   [Yieldmo](../../ads/vendors/yieldmo.md)
-   [Yieldone](../../ads/vendors/yieldone.md)
-   [Yieldpro](../../ads/vendors/yieldpro.md)
-   [Zedo](../../ads/vendors/zedo.md)
-   [Zucks](../../ads/vendors/zucks.md)

## Supported embed types

-   [1wo](../../ads/vendors/1wo.md)
-   [24smi](../../ads/vendors/24smi.md)
-   [AdsKeeper](../../ads/vendors/adskeeper.md)
-   [AdsLoom](../../ads/vendors/adsloom.md)
-   [Bringhub](../../ads/vendors/bringhub.md)
-   [Dable](../../ads/vendors/dable.md)
-   [Engageya](../../ads/vendors/engageya.md)
-   [Epeex](../../ads/vendors/epeex.md)
-   [Fairground](../../ads/vendors/fairground.md)
-   [Gecko](../../ads/vendors/gecko.md)
-   [Idealmedia](../../ads/vendors/idealmedia.md)
-   [Insticator](../../ads/vendors/insticator.md)
-   [Jubna](../../ads/vendors/jubna.md)
-   [Lentainform](../../ads/vendors/lentainform.md)
-   [Mgid](../../ads/vendors/mgid.md)
-   [Myua](../../ads/vendors/myua.md)
-   [Outbrain](../../ads/vendors/outbrain.md)
-   [Postquare](../../ads/vendors/postquare.md)
-   [PubExchange](../../ads/vendors/pubexchange.md)
-   [ReadMo](../../ads/vendors/readmo.md)
-   [Smi2](../../ads/vendors/smi2.md)
-   [SVK-Native](../../ads/vendors/svknative.md)
-   [Strossle](../../ads/vendors/strossle.md)
-   [Taboola](../../ads/vendors/taboola.md)
-   [TE Medya](../../ads/vendors/temedya.md)
-   [vlyby](../../ads/vendors/vlyby.md)
-   [Whopa InFeed](../../ads/vendors/whopainfeed.md)
-   [Yahoo Native-Display Ads Federation](../../ads/vendors/yahoofedads.md)
-   [Yahoo Native Ads](../../ads/vendors/yahoonativeads.md)
-   [Zen](../../ads/vendors/zen.md)
-   [ZergNet](../../ads/vendors/zergnet.md)
