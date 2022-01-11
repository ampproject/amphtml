# AMP HTML Tag Addendum

## Overview

AMP HTML allows for most HTML5 standard tags and a few additional tags specific to the AMP runtime. The [AMP Spec](amp-html-format.md) broadly defines the set of tags that are disallowed. AMP Validator implementations, however, must be implemented using a tag allowlist. This addendum lists the set of tags which an AMP Validator should allowlist.

If an HTML tag is not in this list, the AMP Validator does not consider that tag
valid in any context. However, many of these tags have additional restrictions.
For example `<script>` is in the list, but custom javascript is not allowed.

TODO(gregable): Add additional detail to the addendum regarding specific
validation requirements for each tag.

## HTML5 Tag Allowlist

Below we list the allowed tags in the order in which they are appear in the HTML5 spec in section 4 [The Elements of HTML](http://www.w3.org/TR/html5/single-page.html#html-elements).

### 4.1 The root element

4.1.1 `<html>`

### 4.2 Document metadata

4.2.1 `<head>`  
4.2.2 `<title>`  
4.2.4 `<link>`  
4.2.5 `<meta>`  
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

AMP HTML allows only limited embedded content except via its own tags (ex: amp-img).

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

### 4.8 Links

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

4.11.1 `<script>`  
4.11.2 `<noscript>`

### 4.11.3 Non-confirming features

These may be removed in future versions of AMP

`<acronym>`  
`<center>`  
`<dir>`  
`<hgroup>`  
`<listing>`  
`<multicol>`  
`<nextid>`  
`<nobr>`  
`<spacer>`  
`<strike>`  
`<tt>`  
`<xmp>`

## Amp Specific Tags

`<amp-img>`  
`<amp-video>`  
`<amp-ad>`  
`<amp-fit-text>`  
`<amp-font>`  
`<amp-carousel>`  
`<amp-anim>`  
`<amp-youtube>`  
`<amp-twitter>`  
`<amp-vine>`
`<amp-instagram>`  
`<amp-iframe>`  
`<amp-pixel>`  
`<amp-audio>`  
`<amp-lightbox>`  
`<amp-image-lightbox>`
