# Inclusion of third party software, embeds, and services into AMP

In general all inclusions are subject to [CONTRIBUTING.md](../CONTRIBUTING.md).  This files outlines specific rules for certain types of external embed and other software inclusions.

In order to qualify for inclusion, an extended component that integrates a third-party service must generally meet the notability requirements of the English Wikipedia, and is in common use in Internet publishing.  As a rough rule of thumb, it should be used or requested by 5% of the top 10,000 websites as noted on builtwith.com, or already integrated into [oEmbed](http://oembed.com/).

We highly prefer integrations that do not use iframes. JSONP cannot be used for security reasons, but CORS requests are perfectly fine.

## Embeds

Examples: Youtube, Vimeo videos; Tweets, Instagrams; comment systems; polls; quizzes; document viewers

- Our intent is to provide first class support for all embeds that fulfill the notability guidelines laid out in [CONTRIBUTING.md](../CONTRIBUTING.md).
- Consider whether a iframe-with-placeholder solution fits your use case where iframe generation is not done immediately (can be done before user action for instant loading of iframe).
- Consider whether all that is needed is some documentation for how to use the embed with `amp-iframe`.
- Iframes and all sub resources must be served from HTTPS.
- Avoid client side rendering of iframe content.
- If your use of iframes is for style isolation, consider that AMP might provide an iframe-free alternative.
- If you can make it not-iframe-based that is much better. (See e.g. the pinterest embed). We will always ask to do this first. E.g. adding a CORS endpoint to your server might make this possible.
- Must play well within [AMP's sizing framework](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-layout.md).
- All JS on container page must be open source and bundled with AMP.
- JavaScript loaded into iframe should be reasonable with respect to functionality.
- Use the `sandbox` attribute on iframe if possible.
- Provide unit and integration tests.
- Embeds that require browser plugins, such as Flash, Java, ActiveX, Silverlight, etc. are disallowed unless necessary. Special review required. We cannot currently see a reason why these should be allowed.

## Ads

- We welcome pull requests by all ad networks for inclusion into AMP.
- All ads and all sub resources must be served from HTTPS.
- Must play well within [AMP's sizing framework](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-layout.md).
- For display ads support, always implement amp-ad and instruct your client to use your amp-ad implementation instead of using amp-iframe. Althought amp-iframe will render the ad, ad clicks will break and viewability information is not available.
- Providing an optional image only zero-iframe embed is appreciated.
- Support viewability and other metrics/instrumentation as supplied by AMP (via postMessage API)
- Try to keep overall iframe count at one per ad. Explain why more are needed.
- Share JS between iframes on the same page.
- Provide unit and integration tests.
- Provide test accounts for inclusion in our open source repository for integration tests.

The following aren't hard requirements, but are performance optimizations we should strive to incorporate. Please provide a timeline as to when you expect to follow these guidelines:

- Support pause and play APIs to turn animations on and off. Ideally also to interrupt loading.
- Never block the UI thread for longer than 50ms, so that user action is never blocked for longer than that.
  - Keep individual JS files small enough, so they compile in under 50ms on a 2013 Android phone.
  - Split up other expensive work, so it can be interrupted at 50ms boundary.
- Creatives should only use animations drive by CSS animation frame.
- Creatives should only animate using CSS transforms and opacity.
- When creatives animate they should not use more than 2ms time per frame to allow for other animations to have sufficient time for concurrent animations.

The better an ad network does on the above requirements, the earlier ads from it will be loaded into AMP. In other words: *The slower the ad loads and the more it interferes with the page, the later AMP will load it.*

We are also excited to start conversations how modern web tech could improve overall ads latency, memory usage and framerate impact and how AMP's open source model could be used to inject trust through an auditable common code base into the ads ecosystem which would reduce the necessity of redundant metrics collection.

Review the [ads/README](../ads/README.md) for further details on ad integration.

## Fonts

- AMP allows inclusion of fonts via the `@font-face` directive.
- JavaScript can not be involved with the initiation of font loading.
- Font loading gets controlled (but not initiated) by [`<amp-font>`](https://github.com/ampproject/amphtml/issues/648).
- AMP by default does not allow inclusion of external stylesheets, but it is happy to whitelist URL prefixes of font providers for font inclusion via link tags. These link tags and their fonts must be served via HTTPS.
- If a font provider does referrer based "security" it needs to whitelist the AMP proxy origins before being included in the link tag whitelist. AMP proxy sends the appropriate referrer header such as "https://cdn.ampproject.org" and "https://amp.cloudflare.com".
