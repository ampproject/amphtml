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


# AMP A4A AD CREATIVE FORMAT

** >> WORK IN PROGRESS.  SUBJECT TO CHANGE. << **

_This set of standards is still in development and is likely to be revised.
Feedback from the community is welcome.  Please comment here or on the [Intent
to Implement](https://github.com/ampproject/amphtml/issues/4264)_.

A4A (AMP Ads for AMPHTML Pages) is a mechanism for rendering fast, performant
ads in AMP pages.  To ensure that A4A ad documents ("A4A creatives") can be
rendered quickly and smoothly in the browser and do not degrade user experience,
A4A creatives must obey a set of validation rules.  Similar in spirit to the
[AMP format rules](../../spec/amp-html-format.md), A4A creatives have access to
a limited set of allowed tags, capabilities, and extensions.

## A4A Format Rules
 
1. Unless otherwise specified below, the creative must obey all rules given by 
the [AMP format rules](../../spec/amp-html-format.md), included here by 
reference.  For example, the
A4A [Boilerplate](http://localhost:8000/extensions/amp-a4a/amp-a4a-format.md#2) 
deviates from the AMP standard boilerplate.

  _*In addition*_:

1. The creative must use `<html a4⚡>` or `<html a4amp>` as its enclosing tags.

   _Rationale_: Allows validators to identify a creative document as either a 
 general AMP doc or a restricted A4A doc and to dispatch appropriately.

1. Media: Videos must not enable autoplay.

  _Rationale_: Autoplay forces video content to be downloaded immediately, which
 slows the page load.

1. Media: Audio must not enable autoplay.

  _Rationale_: Same as for video.

1. Analytics: `<amp-analytics>` viewability tracking may only target the entire 
ad.  In particular, it may not target any selectors for elements within the ad creative.

  _Rationale_: In some cases, A4A may choose to render an ad creative in an 
  iframe.  In those cases, host page analytics can only target the entire iframe anyway, and won’t have access to any finer-grained selectors.

### Boilerplate

A4A creatives use the same boilerplate as [general AMP documents
do](https://github.com/ampproject/amphtml/blob/master/spec/amp-boilerplate.md)
_except_ that they omit the `<noscript>` section:

```
<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
```

Note that the same rules about mutations to the boilerplate text apply.

### CSS

1. `position:fixed` and `position:sticky` are prohibited in 
creative CSS.

  _Rationale_: position:fixed breaks out of shadow DOM, which A4A depends on.  Also, Ads in AMP are already not allowed to use fixed position.

1. Creative CSS is limited to 20kb.

  _Rationale_: Large CSS blocks bloat the creative, increase network latency, and degrade page performance.

1. CSS: transition and animation are subject to additional restrictions.

  _Rationale_: AMP must be able to control all animations belonging to an ad, so that it can stop them when the ad is not on screen or system resources are very low.

#### CSS Animations and Transitions

##### Selectors

The `transition` and `animation` properties are only allowed on selectors that:
- Contain only `transition`, `animation`, `transform`, `visibility`, or 
  `opacity` properties.
- Start with `.amp-animate` followed by a space.

  _Rationale:_ This allows the AMP runtime to remove this  class from context
   to deactivate animations, when necessary for page performance.

**Good**
```css
.amp-animate .box {
    transform: rotate(180deg);
    transition: transform 2s;
}
```

**Bad**

Property not allowed in CSS class.
```css
.amp-animate .box {
    color: red;  // non-animation property not allowed in animation selector
    transform: rotate(180deg);
    transition: transform 2s;
}
```

Missing context class `.amp-animate`.
```css
.box {
    transform: rotate(180deg);
    transition: transform 2s;
}
```

##### Transitionable and animatable properties

The only properties that may be transitioned are opacity and transform.
([Rationale](http://www.html5rocks.com/en/tutorials/speed/high-performance-animations/))

**Good**
```css
transition: transform 2s;
```

**Bad**
```css
transition: background-color 2s;
```

**Good**
```css
@keyframes turn {
  from {
    transform: rotate(180deg);
  }
  
  to {
    transform: rotate(90deg);
  }
}
```

**Bad**
```css
@keyframes slidein {
  from {
    margin-left:100%;
    width:300%
  }
  
  to {
    margin-left:0%;
    width:100%;
  }
}
```


### AMP Extensions

The following are _allowed_ AMP extension modules in an A4A creative. Extensions
not explicitly allowed are prohibited.

Most of the omissions are either for performance or to make A4A creatives 
simpler to analyze.

<table>
  <tr><td>amp-accordion</td></tr>
  <tr><td>amp-analytics</td></tr>
  <tr><td>amp-anim</td></tr>
  <tr><td>amp-audio</td></tr>
  <tr><td>amp-brid-player</td></tr>
  <tr><td>amp-brightcove</td></tr>
  <tr><td>amp-carousel</td></tr>
  <tr><td>amp-dailymotion</td></tr>
  <tr><td>amp-facebook</td></tr>
  <tr><td>amp-fit-text</td></tr>
  <tr><td>amp-font</td></tr>
  <tr><td>amp-form</td></tr>
  <tr><td>amp-fx-flying-carpet</td></tr>
  <tr><td>amp-google-vrview-image</td></tr>
  <tr><td>amp-image-lightbox</td></tr>
  <tr><td>amp-instagram</td></tr>
  <tr><td>amp-jwplayer</td></tr>
  <tr><td>amp-kaltura-player</td></tr>
  <tr><td>amp-lightbox</td></tr>
  <tr><td>amp-list</td></tr>
  <tr><td>amp-live-list</td></tr>
  <tr><td>amp-o2-player</td></tr>
  <tr><td>amp-pinterest</td></tr>
  <tr><td>amp-reach-player</td></tr>
  <tr><td>amp-share-tracking</td></tr>
  <tr><td>amp-slides</td></tr>
  <tr><td>amp-social-share</td></tr>
  <tr><td>amp-soundcloud</td></tr>
  <tr><td>amp-springboard-player</td></tr>
  <tr><td>amp-sticky-ad</td></tr>
  <tr><td>amp-twitter</td></tr>
  <tr><td>amp-vimeo</td></tr>
  <tr><td>amp-vine</td></tr>
  <tr><td>amp-youtube</td></tr>
</table>

### HTML Tags

The following are _allowed_ tags in an A4A creative.  Tags not explicitly 
allowed are prohibited.  This list is a subset of the general [AMP tag 
addendum whitelist](../../spec/amp-tag-addendum.md). Like that list, it is 
ordered consistent with HTML5 spec in section 4 [The Elements of HTML](http://www.w3.org/TR/html5/single-page.html#html-elements).

Most of the omissions are either for performance or because the tags are not
HTML5 standard.  For example, `<noscript>` is omitted because A4A depends on
JavaScript being enabled, so a `<noscript>` block will never execute and,
therefore, will only bloat the creative and cost bandwidth and latency. 
Similarly, `<acronym>`, `<big>`, et al. are prohibited because they are not
HTML5 compatible.

#### 4.1 The root element
4.1.1 `<html>`
  - Must use types `<html a4⚡>` or `<html a4amp>`

#### 4.2 Document metadata
4.2.1 `<head>`  
4.2.2 `<title>`  
4.2.4 `<link>`  
  - `<link rel=...>` tags are disallowed, except for `<link rel=stylesheet>`.

4.2.5 `<meta>`
  - Only `<meta charset=utf8>` and `<meta name=viewport>` are allowed.

4.2.6 `<style>`  

#### 4.3 Sections
4.3.1 `<body>`  
4.3.2 `<article>`  
4.3.3 `<section>`  
4.3.4 `<nav>`  
4.3.5 `<aside>`  
4.3.6 `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, and `<h6>`  
4.3.7 `<header>`  
4.3.8 `<footer>`  
4.3.9 `<address>`  
#### 4.4 Grouping Content
4.4.1 `<p>`  
4.4.2 `<hr>`  
4.4.3 `<pre>`  
4.4.4 `<blockquote>`  
4.4.5 `<ol>`  
4.4.6 `<ul>`  
4.4.7 `<li>`  
4.4.8 `<dl>`  
4.4.9 `<dt>`  
4.4.10 `<dd>`  
4.4.11 `<figure>`  
4.4.12 `<figcaption>`  
4.4.13 `<div>`  
4.4.14 `<main>`  
#### 4.5 Text-level semantics
4.5.1 `<a>`  
4.5.2 `<em>`  
4.5.3 `<strong>`  
4.5.4 `<small>`  
4.5.5 `<s>`  
4.5.6 `<cite>`  
4.5.7 `<q>`  
4.5.8 `<dfn>`  
4.5.9 `<abbr>`  
4.5.10 `<data>`  
4.5.11 `<time>`  
4.5.12 `<code>`  
4.5.13 `<var>`  
4.5.14 `<samp>`  
4.5.15 `<kbd >`  
4.5.16 `<sub>` and `<sup>`  
4.5.17 `<i>`  
4.5.18 `<b>`  
4.5.19 `<u>`  
4.5.20 `<mark>`  
4.5.21 `<ruby>`  
4.5.22 `<rb>`  
4.5.23 `<rt>`  
4.5.24 `<rtc>`  
4.5.25 `<rp>`  
4.5.26 `<bdi>`  
4.5.27 `<bdo>`  
4.5.28 `<span>`  
4.5.29 `<br>`  
4.5.30 `<wbr>`  
#### 4.6 Edits
4.6.1 `<ins>`  
4.6.2 `<del>`  
#### 4.7 Embedded Content
- Embedded content is supported only via AMP tags, such as `<amp-img>` or 
`<amp-video>`.

#### 4.7.8
4.7.8 `<source>`  

#### 4.7.15 SVG
SVG tags are not in the HTML5 namespace. They are listed below without section ids.

`<svg>`  
`<g>`  
`<path>`  
`<glyph>`  
`<glyphref>`  
`<marker>`  
`<view>`  
`<circle>`  
`<line>`  
`<polygon>`  
`<polyline>`  
`<rect>`  
`<text>`  
`<textpath>`  
`<tref>`  
`<tspan>`  
`<clippath>`  
`<filter>`  
`<lineargradient>`  
`<radialgradient>`  
`<mask>`  
`<pattern>`  
`<vkern>`  
`<hkern>`  
`<defs>`  
`<use>`  
`<symbol>`  
`<desc>`  
`<title>`  
#### 4.9 Tabular data
4.9.1 `<table>`  
4.9.2 `<caption>`  
4.9.3 `<colgroup>`  
4.9.4 `<col>`  
4.9.5 `<tbody>`  
4.9.6 `<thead>`  
4.9.7 `<tfoot>`  
4.9.8 `<tr>`  
4.9.9 `<td>`  
4.9.10 `<th>`  
#### 4.10 Forms
4.10.8 `<button>`  
#### 4.11 Scripting
- Like a general AMP document, the creative's `<head>` tag must contain a
  `<script async src="https://cdn.ampproject.org/v0.js"></script>` tag.
- Other than the AMP script tag itself, though, neither `<script>` nor 
`<noscript>` are allowed.  Unlike general AMP, `<script 
type="application/ld+json">` is not allowed.
