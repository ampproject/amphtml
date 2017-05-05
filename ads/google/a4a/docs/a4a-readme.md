# A4A - AMP for Ads

A4A applies  AMP’s core philosophy of reliable fast performance and  great user experience to ads. 

# AMP Ads 

AMP ads are written in AMP format - [A4A HTML](https://github.com/google/amphtml/blob/master/extensions/amp-a4a/amp-a4a-format.md) (A variant of AMP HTML) + CSS. This means that ads can no longer have the ability to run arbitrary JavaScript - which is traditionally the number one cause of poor ad performance. Therefore, just like core AMP, the core ads JavaScript use-cases are built right into the AMP Open Source project which guarantees good behavior from ads. 

# Why are AMP ads better than regular ads?

### Faster
AMP ads are faster because on AMP pages they are requested early while rendering the page and immediately displayed just before the user is about to view the ad. Reduced file size of AMP ads also increases speed.

### More Aware
On AMP pages, the AMP runtime can coordinate a mobile phone's limited resources to the right component at the right time to give the best user experience. For example, AMP ads with animations are paused when not in the current viewport.

### Lighter
AMP ads bundle commonly used ad functionality which removes bloat.  Once on the page, AMP ads also consume less resources. For example, instead of 10 trackers requesting their own information in regular ads, AMP ads collect all the information once and distribute it to any number of interested trackers. 

### More Engaging
"Users can't tap on ads they can't see". Faster ads lead to higher viewability and therefore higher click through rates, which ultimately leads to higher advertiser conversions.

### Safer
It's impossible to spread malware through advertising with AMP ads. Not only are visitors safer, but advertiser brand perception cannot be negative.`

### More Flexible
AMP ads are designed to work on both AMP and Non-AMP webpages,  including desktop where the ad tagging library supports it. (e.g. GPT)

# Current status

The AMP ads format spec has been [released](https://github.com/google/amphtml/blob/master/extensions/amp-a4a/amp-a4a-format.md) and any creative developer can create AMP ads. A number of ad providers are working on automatically converting ads to AMP ads whenever possible. e.g. AdSense.

Here is how you can participate. If you are:

## Publishers

If publishers want to serve their direct-sold ad formats they must create the ads in[ A4A format](https://github.com/google/amphtml/blob/master/extensions/amp-a4a/amp-a4a-format.md) (or use a creative agency), and deliver them using an AMP ad supported ad server.

The following adservers support serving AMP ads at the moment:
1. DoubleClick for Publishers
2. TripleLift 
3. Dianomi


## Creative Agencies

If you are a creative agency, please express interest via [this form](https://goo.gl/forms/P2zpQT3aIEU1UsWj2) so we can include you in any outreach that's AMP ads-related.

## Ad Networks/ Ad Servers

Please refer to the [Network Implementation Guide](./Network-Impl-Guide.md)
Ad networks and ad servers can integrate with [Cloudflare](https://blog.cloudflare.com/firebolt/) who provide an AMP ad verification services, enabling any independent ad provider to deliver faster, lighter, and more engaging ads.

