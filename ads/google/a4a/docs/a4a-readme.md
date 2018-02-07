# AMPHTML ads

AMPHTML ads applies AMP’s core philosophy of reliable fast performance and  great user experience to ads.

# AMPHTML ads

AMPHTML ads are written in AMP format - [A4A HTML](https://github.com/ampproject/amphtml/blob/master/extensions/amp-a4a/amp-a4a-format.md) (A variant of AMP HTML) + CSS. This means that ads can no longer have the ability to run arbitrary JavaScript - which is traditionally the number one cause of poor ad performance. Therefore, just like core AMP, the core ads JavaScript use-cases are built right into the AMP Open Source project which guarantees good behavior from ads.

# Why are AMPHTML ads better than regular ads?

### Faster
AMPHTML ads are faster because on AMP pages they are requested early while rendering the page and immediately displayed just before the user is about to view the ad. Reduced file size of AMPHTML ads also increases speed.

### More Aware
On AMP pages, the AMP runtime can coordinate a mobile phone's limited resources to the right component at the right time to give the best user experience. For example, AMPHTML ads with animations are paused when not in the current viewport.

### Lighter
AMPHTML ads bundle commonly used ad functionality which removes bloat.  Once on the page, AMPHTML ads also consume less resources. For example, instead of 10 trackers requesting their own information in regular ads, AMPHTML ads collect all the information once and distribute it to any number of interested trackers.

### More Engaging
"Users can't tap on ads they can't see". Faster ads lead to higher viewability and therefore higher click through rates, which ultimately leads to higher advertiser conversions.

### Safer
It's impossible to spread malware through advertising with AMPHTML ads. Not only are visitors safer, but advertiser brand perception cannot be negative.`

### More Flexible
AMPHTML ads are designed to work on both AMP and Non-AMP webpages,  including desktop where the ad tagging library supports it. (e.g. GPT)

# Current status

The AMPHTML ads format spec has been [released](https://github.com/ampproject/amphtml/blob/master/extensions/amp-a4a/amp-a4a-format.md) and any creative developer can create AMPHTML ads. A number of ad providers are working on automatically converting ads to AMPHTML ads whenever possible. e.g. AdSense.

Here is how you can participate. If you are:

## Publishers

If publishers want to serve their direct-sold ad formats they must create the ads in [A4A format](https://github.com/ampproject/amphtml/blob/master/extensions/amp-a4a/amp-a4a-format.md) (or use a creative agency), and deliver them using an AMP Ad supported ad server.

The following adservers support serving AMPHTML ads at the moment:
1. DoubleClick for Publishers
2. TripleLift 
3. Dianomi
4. Adzerk
5. Google AdSense

### Real Time Config
Fast Fetch supports Real Time Config: publisher-specified, multiple, simultaneous callouts in order to augment targeting information included on the ad request. In order for a publisher to use Real Time Config on their ads, the Fast Fetch Ad Network in use must also support RTC. Please refer to the [Intent to Implement](https://github.com/ampproject/amphtml/issues/11321) for details. 

## Creative Agencies

If you are a creative agency, please express interest via [this form](https://goo.gl/forms/P2zpQT3aIEU1UsWj2) so we can include you in any outreach that's AMPHTML-related.

## Ad Networks/ Ad Servers

Please refer to the [Network Implementation Guide](./Network-Impl-Guide.md)
Ad networks and ad servers can integrate with [Cloudflare](https://blog.cloudflare.com/firebolt/) who provide an AMP Ad verification services, enabling any independent ad provider to deliver faster, lighter, and more engaging ads.

## Frequently Asked Questions

#### Are there any AMP Ad samples?
Yes. A number of great looking ads developed in AMP format can be found [here](https://ampbyexample.com/amp-ads/#amp-ads/experimental_ads). They use advanced components in AMP. They give the user a great experience while ensuring that the performance remains great. 

#### Are there any tools to create ads in AMPHTML?
Yes. [Celtra](http://www.prnewswire.com/news-releases/celtra-partners-with-the-amp-project-showcases-amp-ad-creation-at-google-io-event-300459514.html) provides out of the box support for AMPHTML ads in their ad creator platform. Other tools like [Google Web Designer](https://www.google.com/webdesigner/) are also in the process of adding support.

#### How can I verify that an AMP Ad is valid?
Depending on your development environment, there are a few options: 
- Use the [AMP validator NPM](https://www.npmjs.com/package/amphtml-validator) module to build your own
- Use the [AMP validator](https://validator.ampproject.org/) for one off testing
- Partner with [Cloudflare](https://blog.cloudflare.com/firebolt/) and use their public validator end point. 
On AMP pages, AMPHTML ads must be valid in order to get them to render quickly. If not, the ads will still render but slower.


#### Do AMPHTML ads support 3rd party verification and viewability detection?
Yes, there is native support for verification and viewability detection using amp-analytics. (e.g. Google’s ActiveView integrates this way). There are also other vendors like MOAT that are actively implementing support for it. 

#### Does AMPHTML ads support timeline based animation?
Yes. Learn more about it [here](https://github.com/ampproject/amphtml/blob/master/extensions/amp-animation/amp-animation.md). 

#### Most ads have tappable targets and configurable ad exits. Does AMPHTML ads have a similar mechanism?
Yes. Learn more about it [here](https://github.com/ampproject/amphtml/blob/master/extensions/amp-ad-exit/amp-ad-exit.md). 

#### Where can I learn more about AMPHTML ads?
The public [website](https://ampproject.org/ads) is a good place to start. 

#### I can’t find what I need, where can I ask questions?
You can open a [Github Issue](https://github.com/ampproject/amphtml/issues/new). 


