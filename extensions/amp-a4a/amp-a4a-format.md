<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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


# AMP A4A AD CREATIVE VALIDATION

** WORK IN PROGRESS.  SUBJECT TO CHANGE. **

A4A (AMP Ads for AMPHTML Pages) is a mechanism for rendering fast, performant
 ads in AMP pages.  To ensure that A4A ad documents ("A4A creatives") can be 
 rendered quickly and smoothly in the browser and do not degrade user  
 experience, A4A creatives must obey a set of validation rules.  Similar in 
 spirit to the [AMP format rules](../../../spec/amp-html-format), A4A 
 creatives have access to a limited set of allowed tags, capabilities, and 
 extensions.
 
1. The creative shall use <html a4⚡ > or <html a4amp> as its enclosing tags.
   _Rationale_: Allows validators to identify a creative document as either a 
 general AMP doc or a restricted A4A doc and to dispatch appropriately.
1. The creative must not contain any instances of the <amp-ad> tag.
Rationale: Nesting amp-ad within amp-ad can lead to an unbounded waterfall of ad requests, with each ad delegating authority to some other ad / ad network.  This yields slow rendering, defeating many of the goals of AMPHTML and degrading user experience.

The creative must contain at most one instance of <amp-iframe> tag. If present, the <amp-iframe> tag must specify width=0 and height=0 and its source origin must match that of the ad network.
Rationale: An iframe can contain arbitrary HTML and JavaScript; executing one can bog down the host page and degrade user experience.  We allow a single iframe as a point to host ad network-specific code and signal detection, above and beyond that offered by the <amp-analytics> tag.  The size and origin restrictions are to guarantee invisibility to users and ensure that only the ad network is using the block.
Proposal: Rather than using the raw <amp-iframe> tag, we propose to introduce a new, ad-specific tag that behaves as a (3p, late-loading) iframe, but can contain the ad network-specific code.  We propose the tag,
<amp-ad-network-iframe type=”${NETWORK}” src=”${TARGET}”>
where the src origin must match a whitelist-provided origin for the ${NETWORK}.
Rationale: A new name allows validators to easily distinguish correct use and to easily exclude all other amp-iframes.  We can whitelist the tag by network host to ensure that only resources from the network’s origin are loaded and that the tag is not otherwise abused.
Videos must not enable autoplay.
Rationale: Autoplay forces video content to be downloaded immediately, which slows the page load.  Further, users dislike auto-playing video ads.
Audio must not enable autoplay.
Rationale: Same as for video.
CSS: transition and animation are banned in creative CSS.
Rationale: This is a temporary restriction while we figure out the right way to expose animations to ad creatives. It is expected to be lifted (or replaced with a different mechanism) very soon.
The general idea is that AMP must be able to control all animations belonging to an ad, so that it can stop them when the ad is not on screen or system resources are very low.
Update: Work is in progress for specific validation rules for A4A CSS transitions and animations.
Analytics: <amp-analytics> viewability tracking may only target the entire ad.  In particular, it may not target any selectors for elements within the ad creative.
Rationale: For ads that are rendered in an iframe, host page analytics can only target the entire iframe anyway, and won’t have access to any finer-grained selectors.
CSS: position:fixed (also position:sticky for the same reason) is banned in creative CSS.
Rationale: position:fixed breaks out of shadow DOM, which A4A depends on.  Also, Ads in AMP are already not allowed to use fixed position.
CSS: Creative CSS is limited to 20kb.
Rationale: Large CSS blocks bloat the creative, increase network latency, and degrade page performance.
The <noscript> tag is banned.
Rationale: Any context supporting AMP and requesting ads via A4A will have Javascript enabled, so <noscript> blocks will never be interpreted.  Therefore, they only bloat the creative and increase fetch + rendering latency.
