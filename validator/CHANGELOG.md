<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

# AMP HTML ⚡ Validator Release Changelog

Releases to the
[AMP HTML Validator](https://github.com/ampproject/amphtml/blob/master/validator/README.md).

Releases are listed in reverse chronological order, with the most recent release
at the top of this file. This file will be updated at approximately the same
time as https://cdn.ampproject.org/v0/validator.js is updated.

## Releases

<!--
Please add new release changes here. Use the time in UTC for the header and
mention any release notes since the last change as well as the version numbers.
-->

### 11:00 PM, Feb 7, 2018 UTC

Validator version 317

Rules version 566

Includes:
 - #12600
 - Prefer errors based on specificity over volume.
 - #12832
 - #12904
 - #12654
 - #12836
 - #13001
 - #12906
 - #13036
 - #12896
 - #13073
 - AttrSpec supports requires_extension.
 - #12955
 - #13204
 - #12798

### 7:00 PM, January 29, 2018 UTC

Validator version 311

Rules version 546

Includes:
 - #7394
 - #11198
 - #12196
 - #12285
 - #12352
 - #12425
 - #12452
 - #12457
 - #12461
 - #12471
 - #12483
 - #12664


### 7:00 PM, January 3, 2018 UTC

Validator version 288

Rules version 532

Includes:
 - #11953
 - #12095


### 9:00 PM, December 5, 2017 UTC

Validator version 266

Rules version 525

Includes:
 - #10323
 - #12111
 - #12102
 - #12030
 - #12044, amp-animation: remove mandatory body as parent
 - #12015, #12004

### 3:00 AM, November 29, 2017 UTC

Validator version 265

Rules version 519

Includes:
 - #11851 Whitelist additional attributes on amp-story-grid-layer direct children
 - Only support http and https URLs for the 'cite' attribute.
 - #11962
 - #11965
 - Remove warnings for non-usage of grandfathered extensions.


### 7:00 PM, November 15, 2017 UTC

Validator version 263

Rules version 514

Includes:
 - #11758 Whitelist material design icons.
 - Wrap HtmlTag and add some utility methods to simplify code. Warn on duplicate
   attributes.
 - Remove disallowed_domains from AMP-FORM tag now that we use CURLS v2.
 - #9625 allow additional amp-keyframes style
 - allow "fr" attribute for radialGradient SVG tag
 - #11821 whitelist amp-position-observer for A4A
 

### 7:30 PM, October 23, 2017 UTC

Validator version 256

Rules version 501

Includes:
 - Add `allow=geolocation` attributes to <amp-iframe>
 - Allow feflood for SVGs
 - #11433 amp-user-notification
 - Size limit 200k bytes, allow specific at-rules for style[keyframes]
 - #11122 amp-gwd-animation
 - #11543 Allow viewport-fit meta viewport content property
 - amp-story changes

### 9:00 PM, October 10, 2017 UTC

Validator version 253

Rules version 493

Includes:
 - Amp-Story required extension
 - amp-story-grid-layer template attribute is mandatory

### 8:00 PM, October 4, 2017 UTC

Validator version 252

Rules version 491

Inclues:
 - Initial `<amp-story>` rules
 - Update to descendant whitelist for `<amp-story-grid-layer>`
 - #11299 amp-vk extension to embed vk.com Poll and Post
 - #11333 Propagate controlsList from amp-video to video

### 3:15 PM, September 26, 2017 UTC

Validator Version 251

Spec Version 485

Includes:
 - Cleanup. Remove DEV/PROD_MODE.
 - Remove SYTLESHEET_TOO_LONG_OLD_VARIANT error code.
 - Provide a more descriptive error message for our most common AMP error.
 - #11236 add single-item and max-items to amp-list
 - #11070 remove amp-sidebar restrictions
 - #10583, amp-gfycat autoplay

### 9:00 PM, September 6, 2017 UTC

Validator Version 248

Rules Version 474

Includes:
 - #11087

### 11:00 PM, August 30, 2017 UTC

Validator Version 246

Rules Version 473

Includes:
 - `<amp-position-observer>` #10818
 - amp-audio/video changes #10757, #10930, #10936
 - Sibling tag rules
 - #10965 and #10976

### 7:00 PM, August 23, 2017 UTC

Validator Version 245

Rules Version 466

Includes:
 - Whitelist `use.typekit.net` font provider #10888 & #10889
 - `<amp-web-push>` element #10468
 - `<form custom-validation-reporting="interact-and-submit">` attribute #10782
 - `<amp-sidebar>` changes #10749

### 11:00 PM, August 14, 2017 UTC

Validator Version 244

Rules Version 458

Includes:
 - `<amp-video crossorigin>` attribute #10635

### 9:00 PM, July 27, 2017 UTC

Validator Version 244

Rules Version 456

Includes:
 - `amp-google-client-id-api` meta tag

### 12:01 PM, July 21, 2017 UTC

Validator Version 244

Rules Version 455

Includes:

 - Add cutoff option to `<amp-timeago>` #10067
 - amp-form verify-xhr #10370
 - amp-timeago allow timezone offset #10350
 - html_format semantics #9950
 - Support slot element #10345
 - Improvement to error messages: adjust position reported for cdata
 - Improvement to error messages: require that noscript boilerplate is in head.
 - `<amp-soundcloud playlist>` #10243
 - Disallow duplicate `<body>` tags.
 - Allow `<amp-animation>` in AMP4ADS documents #10093
 - amp-bind extension rules to no longer require `<amp-state>` #10159

### 9:00 PM, June 26, 2017 UTC

Validator Version 239

Rules Version 443

Includes:

 - amp-ad-exit #9390
 - amp-state update #9721
 - requires_extension refactor
 - amp-ima-video test files #9770
 - amp-rtc #9800
 - version 1.0 extensions
 - amp-video-ima update
 - RDFa validation rules #9851
 - amp-dailymotion autoplay #9746
 - amp-ima-video data-src #9767
 - amp-sidebar 1.0 #9784, #9805, #9830, #9834
 - detection of multiple body tags
 - template not required for amp-form #9892
 - amp-ima-video > track #9827
 - fix to amp-ad warning, improvement to unused extension suggestion
 - amp-list [src] and [state] attributes
 - more nuance to dispatch_key field #9737

### 11:00 PM, June 16, 2017 UTC

**Rolled Back**

Validator Version 234

Rules Version 433

Includes:

 - amp-ad-exit #9390
 - amp-state update #9721
 - requires_extension refactor
 - amp-ima-video test files #9770
 - amp-rtc #9800
 - version 1.0 extensions
 - amp-video-ima update

### 6:00 PM, June 8, 2017 UTC

Validator Version 232

Rules Version 427

Includes:

 - Disallow amp-embed as child of amp-app-banner

### 6:00 PM, June 7, 2017 UTC

Validator Version 232

Rules Version 426

Includes:

 - #9434 amp-imgur
 - #3578 allow style in svg > stop
 - #9442 form > div [submitting]
 - #9357 remove amp-sortable-table
 - disallow v0.js for amp4ads documents

### 11:30 PM, May 22, 2017 UTC

Validator Version 232

Rules Version 421

Includes:

 - #7999 amp-3q-player
 - #8557 amp-timeago
 - #8835 and #9139 changes to amp-timeago
 - #9146 amp-bind changes
 - #8632 amp-brid-player autoplay
 - style attributes in SVG tags
 - #8782 amp-ima-video


### 10:00 PM, May 8, 2017 UTC

First Release in Changelog. No release notes.

