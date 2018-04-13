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


# AMPHTML Ad Creative Format

_If you'd like to propose changes to the standard, please comment on the [Intent
to Implement](https://github.com/ampproject/amphtml/issues/4264)_.

AMPHTML ads is a mechanism for rendering fast,
performant ads in AMP pages.  To ensure that AMPHTML ad documents ("AMP
creatives") can be rendered quickly and smoothly in the browser and do
not degrade user experience, AMP creatives must obey a set of validation
rules.  Similar in spirit to the
[AMP format rules](https://www.ampproject.org/docs/fundamentals/spec.html), AMPHTML ads have
access to a limited set of allowed tags, capabilities, and extensions.

**Table of Contents**

* [AMPHTML ad format rules](#amphtml-ad-format-rules)
    * [Boilerplate](#boilerplate)
    * [CSS](#css)
        * [CSS animations and transitions](#css-animations-and-transitions)
            * [Selectors](#selectors)
            * [Transitionable and animatable properties](#transitionable-and-animatable-properties)
    * [Allowed AMP extensions and builtins](#allowed-amp-extensions-and-builtins)
    * [HTML tags](#html-tags)

## AMPHTML ad format rules

Unless otherwise specified below, the creative must obey all rules given by the
[AMP format rules](https://www.ampproject.org/docs/fundamentals/spec.html),
included here by reference.  For example, the AMPHTML ad [Boilerplate](#boilerplate) deviates from the AMP standard boilerplate.

In addition, creatives must obey the following rules:

<table>
<thead>
<tr>
  <th>Rule</th>
  <th>Rationale</th>
</tr>
</thead>
<tbody>
<tr>
<td>Must use <code>&lt;html ⚡4ads></code> or <code>&lt;html amp4ads></code> as its enclosing tags.</td>
<td>Allows validators to identify a creative document as either a general AMP doc or a restricted AMPHTML ad doc and to dispatch appropriately.</td>
</tr>
<tr>
<td>Must include <code>&lt;script async src="https://cdn.ampproject.org/amp4ads-v0.js">&lt;/script></code> as the runtime script instead of <code>https://cdn.ampproject.org/v0.js</code>.</td>
<td>Allows tailored runtime behaviors for AMPHTML ads served in cross-origin iframes.</td>
</tr>
<tr>
<td>Must not include a <code>&lt;link rel="canonical"></code> tag.</td>
<td>Ad creatives don't have a "non-AMP canonical version" and won't be independently search-indexed, so self-referencing would be useless.</td>
</tr>
<tr>
<td>Can include optional meta tags in HTML head as identifiers, in the format of <code>&lt;meta name="amp4ads-id" content="vendor=${vendor},type=${type},id=${id}"></code>. Those meta tags must be placed before the <code>amp4ads-v0.js</code> script. The value of <code>vendor</code> and <code>id</code> are strings containing only [0-9a-zA-Z_-]. The value of <code>type</code> is either <code>creative-id</code> or <code>impression-id</code>.</td>
<td>Those custom identifiers can be used to identify the impression or the creative. They can be helpful for reporting and debugging.<br><br><p>Example:</p><pre>
&lt;meta name="amp4ads-id"
  content="vendor=adsense,type=creative-id,id=1283474">
&lt;meta name="amp4ads-id"
  content="vendor=adsense,type=impression-id,id=xIsjdf921S"></pre></td>
</tr>
<tr>
<td>Videos must not enable autoplay. This includes both the <code>&lt;amp-video></code> tag as well as autoplay on <code>&lt;amp-anim></code>, and 3P video tags such as <code>&lt;amp-youtube></code>.</td>
<td>Autoplay forces video content to be downloaded immediately, which slows the page load.</td>
</tr>
<tr>
<td>Audio must not enable autoplay. This includes both the <code>&lt;amp-audio></code> tag as well as all audio-including video tags, as described in the previous point.</td>
<td>Same as for video.</td>
</tr>
<tr>
<td><code>&lt;amp-analytics></code> viewability tracking may only target the full-ad selector, via  <code>"visibilitySpec": { "selector": "amp-ad" }</code> as defined in <a href="https://github.com/ampproject/amphtml/issues/4018">Issue #4018</a> and <a href="https://github.com/ampproject/amphtml/pull/4368">PR #4368</a>. In particular, it may not target any selectors for elements within the ad creative.</td>
<td>In some cases, AMPHTML ads may choose to render an ad creative in an iframe.In those cases, host page analytics can only target the entire iframe anyway, and won’t have access to any finer-grained selectors.<br><br>
<p>Example:</p>
<pre>
&lt;amp-analytics id="nestedAnalytics">
  &lt;script type="application/json">
  {
    "requests": {
      "visibility": "https://example.com/nestedAmpAnalytics"
    },
    "triggers": {
      "visibilitySpec": {
      "selector": "amp-ad",
      "visiblePercentageMin": 50,
      "continuousTimeMin": 1000
      }
    }
  }
  &lt;/script>
&lt;/amp-analytics>
</pre>
<p>This configuration sends a request to the <code>https://example.com/nestedAmpAnalytics</code> URL when 50% of the enclosing ad has been continuously visible on the screen for 1 second.</p>
</td>
</tr>
</tbody>
</table>

### Boilerplate

AMPHTML ad creatives require a different, and considerably simpler, boilerplate style line than [general AMP documents do](https://github.com/ampproject/amphtml/blob/master/spec/amp-boilerplate.md):

```html
<style amp4ads-boilerplate>body{visibility:hidden}</style>
```

_Rationale:_ The `amp-boilerplate` style hides body content until the AMP
runtime is ready and can unhide it.  If Javascript is disabled or the AMP
runtime fails to load, the default boilerplate ensures that the content is
eventually displayed regardless.  In AMPHTML ads, however, if Javascript is entirely
disabled, AMPHTML ads won't run and no ad will ever be shown, so there is no need for
the `<noscript>` section.  In the absence of the AMP runtime, most of the
machinery that AMPHTML ads rely on (e.g., analytics for visibility
tracking or `amp-img` for content display) won't be available, so it's better to
display no ad than a malfunctioning one.

Finally, the AMPHTML ad boilerplate uses `amp-a4a-boilerplate` rather than
`amp-boilerplate` so that validators can easily identify it and produce
more accurate error messages to help developers.

Note that the same rules about mutations to the boilerplate text apply as in
the [general AMP boilerplate](https://github.com/ampproject/amphtml/blob/master/spec/amp-boilerplate.md).

### CSS

<table>
<thead>
<tr>
  <th>Rule</th>
  <th>Rationale</th>
</tr>
</thead>
<tbody>
  <tr>
    <td><code>position:fixed</code> and <code>position:sticky</code> are prohibited in creative CSS.</td>
    <td><code>position:fixed</code> breaks out of shadow DOM, which AMPHTML ads depend on. lso, ads in AMP are already not allowed to use fixed position.</td>
  </tr>
  <tr>
    <td><code>touch-action</code> is prohibited.</td>
    <td>An ad that can manipulate <code>touch-action</code> can interfere with
   the user's ability to scroll the host document.</td>
  </tr>
  <tr>
    <td>Creative CSS is limited to 20,000 bytes.</td>
    <td>Large CSS blocks bloat the creative, increase network
   latency, and degrade page performance.
</td>
  </tr>
  <tr>
    <td>Transition and animation are subject to additional restrictions.</td>
    <td>AMP must be able to control all animations belonging to an
   ad, so that it can stop them when the ad is not on screen or system resources are very low.</td>
  </tr>
  <tr>
    <td>Vendor-specific prefixes are considered aliases for the same symbol
   without the prefix for the purposes of validation.  This means that if
   a symbol <code>foo</code> is prohibited by CSS validation rules, then the symbol <code>-vendor-foo</code> will also be prohibited.</td>
    <td>Some vendor-prefixed properties provide equivalent functionality to properties that are otherwise prohibited or constrained under these rules.<br><br><p>Example: <code>-webkit-transition</code> and <code>-moz-transition</code> are both considered aliases for <code>transition</code>.  They will only be allowed in contexts where bare <code>transition</code> would be allowed (see <a href="#selectors">Selectors</a> section below).</p></td>
  </tr>
</tbody>
</table>
  

#### CSS animations and transitions

##### Selectors

The `transition` and `animation` properties are only allowed on selectors that:
- Contain only `transition`, `animation`, `transform`, `visibility`, or
  `opacity` properties.

  _Rationale:_ This allows the AMP runtime to remove this  class from context
   to deactivate animations, when necessary for page performance.

**Good**
```css
.box {
    transform: rotate(180deg);
    transition: transform 2s;
}
```

**Bad**

Property not allowed in CSS class.
```css
.box {
    color: red;  // non-animation property not allowed in animation selector
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


### Allowed AMP extensions and builtins

The following are _allowed_ AMP extension modules and AMP built-in tags in an
AMPHTML ad creative. Extensions or builtin tags not explicitly listed are prohibited.

* [amp-accordion](https://www.ampproject.org/docs/reference/components/amp-accordion)
* [amp-ad-exit](https://www.ampproject.org/docs/reference/components/amp-ad-exit)
* [amp-analytics](https://www.ampproject.org/docs/reference/components/amp-analytics)
* [amp-anim](https://www.ampproject.org/docs/reference/components/amp-anim)
* [amp-animation](https://www.ampproject.org/docs/reference/components/amp-animation)
* [amp-audio](https://www.ampproject.org/docs/reference/components/amp-audio)
* [amp-carousel](https://www.ampproject.org/docs/reference/components/amp-carousel)
* [amp-fit-text](https://www.ampproject.org/docs/reference/components/amp-fit-text)
* [amp-font](https://www.ampproject.org/docs/reference/components/amp-font)
* [amp-form](https://www.ampproject.org/docs/reference/components/amp-form)
* [amp-img](https://www.ampproject.org/docs/reference/components/amp-img)
* [amp-layout](https://www.ampproject.org/docs/reference/components/amp-layout)
* [amp-mustache](https://www.ampproject.org/docs/reference/components/amp-mustache)
* [amp-pixel](https://www.ampproject.org/docs/reference/components/amp-pixel)
* [amp-position-observer](https://www.ampproject.org/docs/reference/components/amp-position-observer)
* [amp-social-share](https://www.ampproject.org/docs/reference/components/amp-social-share)
* [amp-video](https://www.ampproject.org/docs/reference/components/amp-video)
* [amp-youtube](https://www.ampproject.org/docs/reference/components/amp-youtube) 



Most of the omissions are either for performance or to make AMPHTML ads
simpler to analyze.

_Example:_ `<amp-ad>` is omitted from this list.  It is explicitly disallowed
because allowing an `<amp-ad>` inside an `<amp-ad>` could potentially lead to
unbounded waterfalls of ad loading, which does not meet AMPHTML ads performance goals.

_Example:_ `<amp-iframe>` is omitted from this list.  It is disallowed
because ads could use it to execute arbitrary Javascript and load arbitrary
content. Ads wanting to use such capabilities should return `false` from
their
[a4aRegistry](https://github.com/ampproject/amphtml/blob/master/ads/_a4a-config.js#L40)
entry and use the existing '3p iframe' ad rendering mechanism.

_Example:_ `<amp-facebook>`, `<amp-instagram>`, `<amp-twitter>`, and
`<amp-youtube>` are all omitted for the same reason as `<amp-iframe>`: They
all create iframes and can potentially consume unbounded resources in them.

_Example:_ `<amp-ad-network-*-impl>` are omitted from this list.  The
`<amp-ad>` tag handles delegation to these implementation tags; creatives
should not attempt to include them directly.

_Example:_ `<amp-lightbox>` is not yet included because even some AMPHTML ads creatives
may be rendered in an iframe and there is currently no mechanism for an ad to
expand beyond an iframe.  Support may be added for this in the future, if there
is demonstrated desire for it.


### HTML tags

The following are _allowed_ tags in an AMPHTML ads creative.  Tags not explicitly
allowed are prohibited.  This list is a subset of the general [AMP tag
addendum whitelist](../../spec/amp-tag-addendum.md). Like that list, it is
ordered consistent with HTML5 spec in section 4 [The Elements of HTML](http://www.w3.org/TR/html5/single-page.html#html-elements).

Most of the omissions are either for performance or because the tags are not
HTML5 standard.  For example, `<noscript>` is omitted because AMPHTML ads depends on
JavaScript being enabled, so a `<noscript>` block will never execute and,
therefore, will only bloat the creative and cost bandwidth and latency.
Similarly, `<acronym>`, `<big>`, et al. are prohibited because they are not
HTML5 compatible.

#### 4.1 The root element
4.1.1 `<html>`
  - Must use types `<html ⚡4ads>` or `<html amp4ads>`

#### 4.2 Document metadata
4.2.1 `<head>`

4.2.2 `<title>`

4.2.4 `<link>`
  - `<link rel=...>` tags are disallowed, except for `<link rel=stylesheet>`.
  - __Note:__ Unlike in general AMP, `<link rel="canonical">` tags are
    prohibited.

4.2.5 `<style>`
4.2.6 `<meta>`

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

#### 4.7.4 `<source>`

#### 4.7.18 SVG
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
  `<script async src="https://cdn.ampproject.org/amp4ads-v0.js"></script>` tag.
- Unlike general AMP, `<noscript>` is prohibited.
  - _Rationale:_ Since AMPHTML ads requires Javascript to be enabled to function
    at all, `<noscript>` blocks serve no purpose in AMPHTML ads and
    only cost network bandwidth.
- Unlike general AMP, `<script type="application/ld+json">` is
  prohibited.
  - _Rationale:_ JSON LD is used for structured data markup on host
    pages, but ad creatives are not standalone documents and don't
    contain structured data.  JSON LD blocks in them would just cost
    network bandwidth.
- All other scripting rules and exclusions are carried over from general
  AMP.
