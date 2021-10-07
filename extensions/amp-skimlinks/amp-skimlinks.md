---
$category@: media
formats:
  - websites
teaser:
  text: Run skimlinks inside your AMP page.
---

# amp-skimlinks

## Overview

Skimlinks allows you to monetise your content through affiliate marketing. It gives you instant access to over 24,000 merchant affiliate programs without the hassle of network sign ups, approvals or creating affiliate links.

`amp-skimlinks` is the AMP version of the traditional Skimlinks scripts which allows you to automatically turn your normal merchant links into monetisable links and gives you access to analytics data about how your content is performing.

## Getting started

A skimlinks account is required in order to use [amp-skimlinks](https://skimlinks.com/)

**Add the required script**
Inside the `<head>...</head>` section of your AMP page, insert this code before the line `<script async src="https://cdn.ampproject.org/v0.js"></script>`

Code:

```html
<script
  async
  custom-element="amp-skimlinks"
  src="https://cdn.ampproject.org/v0/amp-skimlinks-0.1.js"
></script>
```

**Add the amp-skimlinks extension**
Inside the `<body>...</body>` section of your AMP page, insert this code:

Code:

```html
<amp-skimlinks layout="nodisplay" publisher-code="123X456"> </amp-skimlinks>
```

The final code should like:

```html
<!DOCTYPE html>
<html ⚡ lang="en">
  <head>
    ...
    <script
      async
      custom-element="amp-skimlinks"
      src="https://cdn.ampproject.org/v0/amp-skimlinks-0.1.js"
    ></script>
    ...
    <script async src="https://cdn.ampproject.org/v0.js"></script>
  </head>
  <body>
    ...
    <amp-skimlinks
      layout="nodisplay"
      publisher-code="YOUR_SKIMLINKS_CODE"
    ></amp-skimlinks>
    ....
  </body>
</html>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>publisher-code (required)</strong></td>
    <td><p>Your skimlinks publisher code (also called "site Id").</p>
<p>If you don't know what's your publisher code, you can find it on the <a href="https://hub.skimlinks.com/settings/sites">Skimlinks Hub</a> ("Site ID" column.).<br></p>
<p>Example:</p>
<pre><code class="html language-html">&lt;amp-skimlinks
...
publisher-code="123X456"
&gt;
&lt;/amp-skimlinks&gt;
</code></pre>
</td>
  </tr>
  <tr>
    <td width="40%"><strong>excluded-domains (optional)</strong></td>
    <td>A whitespace separated list of domain names.
All the links belonging to a domain in that list will not be affiliated nor tracked by skimlinks.
By default amp-skimlinks does not exclude any domains.
<br>
Example:</p>
<pre><code class="html language-html">&lt;amp-skimlinks
...
excluded-domains="samsung.com amazon.com"
&gt;
&lt;/amp-skimlinks&gt;
</code></pre>
</td>
  </tr>
  <tr>
    <td width="40%"><strong>link-selector (optional)</strong></td>
    <td><p><code>link-selector</code> allows you to restrict which links amp-skimlinks should affiliate and track. All the links
  not matching the provided selector will simply be ignored.<br>
  By default, amp-skimlinks affiliate and tracks all the links on the page.</p>
<p><code>link-selector</code> value should be a valid <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors">CSS selector</a><br></p>
<p><strong>WARNING:</strong>
  Don't set this option unless you really need it.
  When using this option, always double check that your CSS selector is matching your links. When <code>link-selector</code> is provided, only the links matching the provided CSS selector would be able to generate revenue, any other links would be ignored.<br></p>
<p>(e.g: <code>div.content</code> would not match any links and therefore not generate any revenue while <code>div.content a</code> would)!<br></p>
<p>Example:</p>
<pre><code class="html language-html">&lt;amp-skimlinks
...
link-selector="article:not(.no-skimlinks) a"
&gt;
&lt;/amp-skimlinks&gt;
</code></pre>
</td>
  </tr>
  <tr>
    <td width="40%"><strong>custom-tracking-id (optional)</strong></td>
    <td><p>The <code>custom-tracking-id</code> (also <code>called xcust</code>) is an optional parameter used to pass your own internal tracking id through Skimlinks' monetization system allowing you to segment your commission data in the way you want.</p>
<p><code>custom-tracking-id</code> should be &lt;=50 characters.</p></td>
  </tr>
</table>

## Validation

See [amp-skimlinks rules](validator-amp-skimlinks.protoascii) in the AMP validator specification.

## Analytics data

amp-skimlinks uses amp-analytics to collect analytics data. If you require any more information about our privacy policy please visit https://skimlinks.com/privacy-policies/.
