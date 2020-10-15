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

# Analytics Vendors <a name="vendors"></a>

This document lists analytics vendors that have built-in configurations for use with the [`amp-analytics`](https://amp.dev/documentation/components/amp-analytics/) component.

Vendors that wish to integrate their service with [`<amp-analytics>`](https://amp.dev/documentation/components/amp-analytics/) should refer to the details in [Integrate your analytics tools with AMP](https://amp.dev/documentation/guides-and-tutorials/contribute/integrate-your-analytics-tools).

### Acquia Lift

Type attribute value: `acquialift`

Adds support for Acquia Lift. The `decisionApiUrl`, `accountId` and `siteId` must be specified. More information about Acquia Lift can be found at [https://docs.acquia.com/lift](https://docs.acquia.com/lift).

### Adobe Analytics

Type attribute value: `adobeanalytics`

Adds support for Adobe Analytics. More details for adding Adobe Analytics support can be found at [marketing.adobe.com](https://marketing.adobe.com/resources/help/en_US/sc/implement/accelerated-mobile-pages.html).

### AFS Analytics

Type attribute value: `afsanalytics`

Adds support for AFS Analytics. Additionally, the `websiteid` and `server` variables must be specified. More details for adding AFS Analytics support can be found at [afsanalytics.com](https://www.afsanalytics.com/articles/developers/).

### Alexa Internet

Type attribute value: `alexametrics`

<!-- markdown-link-check-disable -->

Adds support for Alexa Certified Site Metrics. The `atrk_acct` and `domain` variables must be specified. More information can be found at [Alexa’s Certified Metrics FAQ](https://support.alexa.com/hc/en-us/sections/200063374-Certified-Site-Metrics).

<!-- markdown-link-check-enable -->

### Amplitude

Type attribute value: `amplitude`

### AT Internet

Type attribute value: `atinternet`

Adds support for AT Internet. More details for adding AT Internet support can be found at [developers.atinternet-solutions.com](http://developers.atinternet-solutions.com/javascript-en/advanced-features-javascript-en/accelerated-mobile-pages-amp-javascript-en/).

### Baidu Analytics

Type attribute value: `baiduanalytics`

Adds support for Baidu Analytics. More details for adding Baidu Analytics support can be found at [tongji.baidu.com/](http://tongji.baidu.com/web/help/article?id=268&type=0).

### BlueConic

Type attribute value: `blueconic`

### Browsi

Type attribute value: `browsi`

### Burt

Type attribute value: `burt`

Adds support for Burt. Additionally, the `trackingKey` variable must be specified. It's also possible to specify the optional variables `category` and `subCategory`. More details can be found at [burtcorp.com](http://burtcorp.com).

### BySide

Type attribute value: `byside`

### Captain Metrics

Type attribute value: `captainmetrics`

### Chartbeat

Type attribute value: `chartbeat`

Adds support for Chartbeat. More details for adding Chartbeat support can be found at [support.chartbeat.com](http://support.chartbeat.com/docs/integrations.html#amp).

### Clicky Web Analytics

Type attribute value: `clicky`

Adds support for Clicky Web Analytics. More details for adding Clicky support can be found at [clicky.com](https://clicky.com/help/apps-plugins).

### comScore

Type attribute value: `comscore`

Adds support for comScore Unified Digital Measurement™ pageview analytics. Requires defining _var_ `c2` with comScore-provided _c2 id_. More information can be found at [comscore.com](http://www.comscore.com).

### Cxense

Type attribute value: `cxense`

Adds support for Cxense Insight analytics. Requires defining _var_ `siteId` with Cxense-provided _siteId_. More details can be found at [wiki.cxense.com](https://wiki.cxense.com/display/cust/Accelerated+Mobile+Pages+%28AMP%29+integration).

### Deep.BI

Type attribute value: `deepbi`

### Dynatrace

Type attribute value: `dynatrace`

Adds support for Dynatrace real user monitoring. Requires defining _var_ `app` with a Dynatrace provided _application id_ and _var_ `tenant` with a Dynatrace provided _environment identifier_. More details for adding Dynatrace real user monitoring can be found at [dynatrace.com](https://www.dynatrace.com/technologies/web/amp-monitoring/).

### EPICA

Type attribute value: `epica`

Adds support for EPICA page views and events.
More details can be found at [EPICA docs](https://www.epica.ai).

### Eulerian Analytics

Type attribute value: `euleriananalytics`

Adds support for Eulerian Technologies Analytics. Requires defining _var_ `analyticsHost` with Eulerian delegated domain. More details can be found at [eulerian.wiki](https://eulerian.wiki).

### Facebook Pixel

Type attribute value: `facebookpixel`

Adds support for the [Facebook Pixel](https://www.facebook.com/business/a/facebook-pixel). In your [`amp-analytics`](./amp-analytics.md) configuration, you must define your Pixel ID as `pixelId: YOUR-PIXEL-ID`. The events supported along with the corresponding event values that can be specified are detailed in the [Facebook Pixel developer documentation](https://developers.facebook.com/docs/ads-for-websites/pixel-events).

### Gemius

Type attribute value: `gemius`

Adds support for Gemius Audience/Prism analytics. Additionally, the gemius-provided `prefix` and `identifier` variables must be specified. It's also possible to specify the optional variable `extraparams` (key1=value1|key2=value2). More details can be found at [gemius.com](https://www.gemius.com).

### GfK Sensic

Type attribute value: `gfksensic`

Adds support for GfK Sensic audio stream usage analytics.
Please refer to our [client documentation](https://confluence-docu.gfk.com/display/SENSIC/AMP+Integration) for details.

### Google Ads

Type attribute value: `googleadwords`

Adds support for Google Ads conversion tracking and remarketing. See more details in the Google Ads help center for [conversion tracking](https://support.google.com/adwords/answer/1722054?hl=en) and [remarketing](https://support.google.com/adwords/answer/2453998?hl=en). Both tags can be used independent of each other.

### Google Analytics <a name="google-analytics"></a>

Type attribute value: `googleanalytics`

Adds support for Google Analytics. More details for adding Google Analytics support can be found at [developers.google.com](https://developers.google.com/analytics/devguides/collection/amp-analytics/).

### Google Tag Manager

Type attribute value: N/A

Unlike other analytics vendors, Google Tag Manager is a tag management service, and does not require the `type` attribute. Google Tag Manager is [supported](https://developers.google.com/google-ads/amp/landing-pages#google_tag_manager) in AMP. Consult the Google Tag Manager documentation for [supported tags](https://support.google.com/tagmanager/answer/6106924) and for instructions on [adding Google Tag Manager to your AMP page](https://support.google.com/tagmanager/answer/6103696).

### Ibeat Analytics

Type attribute value: `ibeatanalytics`

Adds support for Ibeat Analytics. More details for adding Ibeat support can be found at [Ibeat Integration Support](https://ibeat.indiatimes.com/support.html#h.a5rit14mwie1).

### INFOnline / IVW

Type attribute value: `infonline`

Adds support for [INFOnline](https://www.infonline.de) / [IVW](http://www.ivw.de). Requires a copy of [amp-analytics-infonline.html](https://3p.ampproject.net/custom/amp-analytics-infonline.html) on a different subdomain than the including AMP file ([why?](https://github.com/ampproject/amphtml/blob/master/spec/amp-iframe-origin-policy.md)). The file must be served via HTTPS. For example, if your AMP files are hosted on `www.example.com`, then `amp-analytics-infonline.html` needs to be on another subdomain such as `iframe.example.com` or `assets.example.com`.

Additionally, the following variables must be defined:

- `st`: offer ID
- `co`: comment
- `cp`: code
- `url`: HTTPS location of `amp-analytics-infonline.html`

More details for adding INFOnline / IVW support can be found at [www.infonline.de](https://www.infonline.de/).

### INFOnline anonymous

Type attribute value: `infonline-anonymous`

Adds support for the [anonymous INFOnline](https://www.infonline.de). Requires a copy of [infonline-anonymous.html](https://www.infonline.de/amp/infonline-anonymous.html) on a different subdomain than the including AMP file ([why?](https://github.com/ampproject/amphtml/blob/master/spec/amp-iframe-origin-policy.md)). The file must be served via HTTPS. For example, if your AMP files are hosted on `www.example.com`, then `infonline-anonymous.html` needs to be on another subdomain such as `iframe.example.com` or `assets.example.com`.

Additionally, the following variables must be defined:

- `st`: offer ID
- `co`: comment
- `cp`: code
- `url`: HTTPS location of `infonline-anonymous.html`
- `dn`: The relay domain name

More details for adding INFOnline anonymous support can be found at [www.infonline.de](https://www.infonline.de/).

### ip-label

Type attribute value: `iplabel`

### Keen

Type attribute value: `keen`

Adds support for Keen. Additionally, the following `vars` must be defined:

- `projectId`: your project id
- `writeKey`: your write key

Use `extraUrlParams` to add more data. Configuration details can be found at [keen.io/docs/api](https://keen.io/docs/api/).

### Kenshoo

Type attribute value: `kenshoo`

Adds support for Kenshoo. More information and configuration details can be found at [helpcenter.kenshoo.com](https://helpcenter.kenshoo.com/hc/en-us/articles/360025260592).

### Krux

Type attribute value: `krux`

<!-- markdown-link-check-disable -->

Adds support for Krux. Configuration details can be found at [help.krux.com](https://konsole.zendesk.com/hc/en-us/articles/216596608).

<!-- markdown-link-check-enable -->

### Linkpulse

Type attribute value: `linkpulse`

Adds support for Linkpulse. Configuration details can be found at [docs.linkpulse.com](http://docs.linkpulse.com).

### Lotame

Type attribute value: `lotame`

Adds support for Lotame. More information and configuration details can be found at [mylotame.force.com](https://mylotame.force.com/s/article/Google-AMP).

### Mapp Intelligence

Type attribute value: `mapp_intelligence`

Adds support for Mapp Intelligence tracking. More information and configuration details can be found at [docs.mapp.com](https://docs.mapp.com/pages/viewpage.action?pageId=10027966).

### Marin Software

Type attribute value: `marinsoftware`

### Médiamétrie

Type attribute value: `mediametrie`

Adds support for Médiamétrie tracking pages. Requires defining _var_ `serial`. Vars `level1` to `level4` are optional. More information can be found at [mediametrie.com](http://www.mediametrie.com/).

### mediarithmics

Type attribute value: `mediarithmics`

Adds support for mediarithmics. More information and configuration details can be found at `https://developer.mediarithmics.com`.

### Memo

Type attribute value: `memo`

### Metrika

Type attribute value: `metrika`

### Moat Analytics

Type attribute value: `moat`

Adds support for Moat. Please contact your Moat representative for configuration details. More information on Moat can be found at [moat.com/analytics](https://moat.com/analytics).

### Mobify

Type attribute value: `mobify`

Adds support for Mobify. More details for adding Mobify support can be found at [docs.mobify.com](https://docs.mobify.com/amp-sdk/latest/guides/amp-analytics/).

### MoEngage

Type attribute value: `moengage`

### mParticle

Type attribute value: `mparticle`

Adds support for mParticle. More details for adding mParticle support can be found at [docs.mparticle.com](http://docs.mparticle.com/?javascript#amp).

### Navegg

Type attribute value: `navegg`

### New Relic

Type attribute value: `newrelic`

Adds support for New Relic Browser to measure AMP throughput and performance. By adding the `newrelic` attribute value you’ll need to add your `app ID` and `license key` from your New Relic Browser account to start capturing data. More details can be found on the New Relic Browser AMP docs page at [docs.newrelic.com](https://docs.newrelic.com/docs/browser/new-relic-browser/installation/monitor-amp-pages-new-relic-browser).

### Nielsen

Type attribute value: `nielsen`

Adds support for Nielsen DCR. Please contact your Nielsen representative to get set up with your `apid` as well as assist in defining the remaining parameters in the `vars` section. For more information, see [Nielsen's support documentation](https://engineeringportal.nielsen.com/docs/DCR_Static_Google_AMP_Cloud_API).

### Nielsen Marketing Cloud

Type attribute value: `nielsen-marketing-cloud`

Adds support for Nielsen Marketing Cloud. More details can be found at [Nielsen Marketing Cloud](http://www.nielsen.com/us/en/solutions/capabilities/nielsen-marketing-cloud.html).

### OEWA

Type attribute value: `oewa`

Adds support for `[OEWA](https://www.oewa.at)`. Requires a copy of [amp-analytics-oewa.html](http://www.oewa.at/fileadmin/downloads/amp-analytics-oewa.html) on a different subdomain than the including AMP file ([why?](https://github.com/ampproject/amphtml/blob/master/spec/amp-iframe-origin-policy.md)). The file must be served via HTTPS. For example, if your AMP files are hosted on `www.example.com`, then `amp-analytics-oewa.html` needs to be on another subdomain such as `oewa-amp.example.com`. More details for adding OEWA support can be found [here](http://www.oewa.at/Implementierung).

Additionally, the following variables must be defined:

In the `vars` section:

- `s`: offer
- `cp`: category path

In the `requests` section:

- `url`: HTTPS location of `amp-analytics-oewa.html`

[tip type="note"]
**NOTE –** There is a variation named `oewadirect` that does not use the iframe-ping solution and has a better client detection by using `AMP CLIENT_ID`. This is currently EXPERIMENTAL, and prohibited by the OEWA because it does not use `oewa2.js`.
[/tip]

### Oracle Infinity Analytics

Type attribute value: `oracleInfinityAnalytics`

### Parsely

Type attribute value: `parsely`

Adds support for Parsely. Configuration details can be found at [parsely.com/docs](http://parsely.com/docs/integration/tracking/google-amp.html).

### Permutive

Type attribute value: `permutive`

Adds support for Permutive event collection. Additionally, the following `vars` must be defined:

- `namespace`: your Permutive AMP namespace
- `key`: your Permutive public API key

Use `extraUrlParams` to add additional event properties. Full configuration details can be found at [support.permutive.com](http://support.permutive.com).

### Pistats

Type attribute value: `piStats`

### Piano

Type attribute value: `piano`

Adds support for Piano. Configuration details can be found at `http://vx.piano.io/javascript-tracking-amp`

### Pinpoll

Type attribute value: `pinpoll`

Adds support for Pinpoll. Configuration details can be found at [pinpoll.com](https://pinpoll.com/).

### Pressboard

Type attribute value: `pressboard`

Adds support for Pressboard. Configuration details can be found at [help.pressboard.ca](http://help.pressboard.ca/publisher-resources/getting-started/implementing-google-amp).

### Quantcast Measurement

Type attribute value: `quantcast`

<!-- markdown-link-check-disable -->

Adds support for Quantcast Measurement. More details for adding Quantcast Measurement can be found at [quantcast.com](https://www.quantcast.com/help/guides/)

<!-- markdown-link-check-enable -->

### Rakam

Type attribute value: `rakam`

### reppublika

Type attribute value: `reppublika`

### Retargetly

Type attribute value: `retargetly`

### RudderStack

Type attribute value: `rudderstack`

Adds support for RudderStack page views and events.
Find out more on the implementation check our documentation at `https://docs.rudderstack.com/sdk-integration-guide/getting-started-with-javascript-sdk/amp-analytics`.

### Segment

Type attribute value: `segment`

Adds support for segment page views and events.
To see the full list of fields that you can send, see [Segment Spec](https://segment.com/docs/spec/).

### ShinyStat

Type attribute value: `shinystat`

### SOASTA mPulse

Type attribute value: `mpulse`

Adds support for [SOASTA mPulse](https://www.soasta.com/mPulse). Configuration details can be found at [docs.soasta.com](http://docs.soasta.com/).

### SimpleReach

Type attribute value: `simplereach`

Adds support for SimpleReach. Configuration details can be found at `http://docs.simplereach.com/dev-guide/implementation/google-amp-implementation`.

### Snowplow Analytics

Type attribute value: `snowplow`, `snowplow_v2`

Adds support for Snowplow Analytics. More details for adding Snowplow Analytics support can be found at [github.com/snowplow/snowplow/wiki](https://github.com/snowplow/snowplow/wiki/Google-AMP-Tracker).

### Rambler/TOP-100

Type attribute value: `top100`

Adds support for Rambler/TOP-100. Configuration details can be found at [top100.rambler.ru](https://top100.rambler.ru).

### TEA Analytics

Type attribute value: `teaanalytics`

Adds support for TEA Analytics. More details for adding TEA Analytics support can contact with Kimberly (wuqian56@gmail.com).

### Tealium Collect

Type attribute value: `tealiumcollect`

Adds support for Tealium Collect. More details for adding Tealium Collect support can be found at [docs.tealium.com](https://docs.tealium.com/platforms/amp/install/).

### Top.Mail.Ru

Type attribute value: `topmailru`

Adds support for Top.Mail.Ru. Configuration details can be found at [Top.Mail.Ru Help](https://help.mail.ru/top/amp-analytics).

### Treasure Data

Type attribute value: `treasuredata`

Adds support for Treasure Data. Configuration details can be found at `https://docs.treasuredata.com/articles/javascript-sdk-google-amp`.

### Umeng+ Analytics

Type attribute value: `umenganalytics`

Adds support for Umeng+ Analytics. More details for adding Umeng+ Analytics support can be found at [dev.umeng.com](http://dev.umeng.com/udplus/js-sdkdoc#5).

### Upscore

Type attribute value: `upscore`

### Vpon Analytics

Type attribute value: `vponanalytics`

Adds support for Vpon Vpon Analytics. Configuration details can be found at [Vpon Analytics](https://cmp.vpadn.com/dmp/doc/amp_analytics.html).

### Webengage

Type attribute `webengage`

### Webtrekk

The attribute value ~~`webtrekk`~~ is deprecated (will remove on 31/12/2018) - use `webtrekk_v2` instead

Adds support for Webtrekk. Configuration details can be found at [supportcenter.webtrekk.com](https://supportcenter.webtrekk.com/en/public/amp-analytics.html).

### Yandex Metrica

Type attribute value: `metrika`

Adds support for Yandex Metrica. Configuration details can be found at [Yandex Support](https://yandex.com/support/metrica/code/install-counter-amp.xml).
