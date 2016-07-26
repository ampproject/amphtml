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

** WORK IN PROGRESS.  SUBJECT TO CHANGE. **

A4A (AMP Ads for AMPHTML Pages) is a mechanism for rendering fast, performant ads in AMP pages.  To ensure that A4A ad documents ("A4A creatives") can be   rendered quickly and smoothly in the browser and do not degrade user    experience, A4A creatives must obey a set of validation rules.  Similar in   spirit to the [AMP format rules](../../spec/amp-html-format.md), A4A   creatives have access to a limited set of allowed tags, capabilities, and   extensions.  
## A4A Format Rules
 
1. The creative must obey all rules given by the [AMP format rules](../.
./spec/amp-html-format.md), included here by reference.  _*In addition*_:
1. The creative shall use `<html a4⚡>` or `<html a4amp>` as its enclosing tags.

   _Rationale_: Allows validators to identify a creative document as either a 
 general AMP doc or a restricted A4A doc and to dispatch appropriately.

1. Media: Videos must not enable autoplay.

  _Rationale_: Autoplay forces video content to be downloaded immediately, which
 slows the page load.  Further, users dislike auto-playing video ads.

1. Media: Audio must not enable autoplay.

  _Rationale_: Same as for video.

1. Analytics: `<amp-analytics>` viewability tracking may only target the entire 
ad.  In particular, it may not target any selectors for elements within the ad creative.

  _Rationale_: In some cases, A4A may choose to render an ad creative in an 
  iframe.  In those cases, host page analytics can only target the entire iframe anyway, and won’t have access to any finer-grained selectors.


### CSS

1. `position:fixed` and `position:sticky` are prohibited in 
creative CSS.

  _Rationale_: position:fixed breaks out of shadow DOM, which A4A depends on.  Also, Ads in AMP are already not allowed to use fixed position.

1. Creative CSS is limited to 20kb.

  _Rationale_: Large CSS blocks bloat the creative, increase network latency, and degrade page performance.

1. CSS: transition and animation are subject to additional restrictions.

  _Rationale_: AMP must be able to control all animations belonging to an ad, so that it can stop them when the ad is not on screen or system resources are very low.

### AMP Extensions

### HTML Tags

The following are _allowed_ tags in an A4A creative.  Tags not explicitly 
allowed are prohibited.  This list is a subset of the general [AMP tag 
addendum whitelist](../../spec/amp-tag-addendum.md). Like that list, it is 
ordered consistent with HTML5 spec in section 4 [The Elements of HTML](http://www.w3.org/TR/html5/single-page.html#html-elements).

Most of the omissions are either for performance or because the tags are 
not HTML5 standard.  For example, `<noscript>` is omitted because A4A depends
 on JavaScript being enabled, so a `<noscript>` block will never execute and, 
therefore, will only bloat the creative and cost bandwidth and latency.  Similarly, `<acronym>`, `<big>`, et al. are prohibited because they are not HTML5 compatible.
   
### 4.1 The root element
4.1.1 `<html>`
  - Must use types `<html a4⚡>` or `<html a4amp>`

### 4.2 Document metadata
4.2.1 `<head>`  
4.2.2 `<title>`  
4.2.4 `<link>`  
  - `<link rel=...>` tags are disallowed, except for `<link rel=stylesheet>`.

4.2.5 `<meta>`
  - Only `<meta charset=utf8>` and `<meta name=viewport>` are allowed.

4.2.6 `<style>`  

### 4.3 Sections
4.3.1 `<body>`  
4.3.2 `<article>`  
4.3.3 `<section>`  
4.3.4 `<nav>`  
4.3.5 `<aside>`  
4.3.6 `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, and `<h6>`  
4.3.7 `<header>`  
4.3.8 `<footer>`  
4.3.9 `<address>`  
### 4.4 Grouping Content
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
### 4.5 Text-level semantics
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
### 4.6 Edits
4.6.1 `<ins>`  
4.6.2 `<del>`  
### 4.7 Embedded Content
- Embedded content is supported only via AMP tags, such as `<amp-img>` or 
`<amp-video>`.

### 4.7.8
4.7.8 `<source>`  

### 4.7.15 SVG
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
### 4.9 Tabular data
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
### 4.10 Forms
4.10.8 `<button>`  
### 4.11 Scripting
- Neither `<script>` nor `<noscript>` are allowed.  Unlike general AMP, 
`<script type="application/ld+json">` is not allowed.
