<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# How to Create a Basic AMP HTML Page

Learn how to create a basic AMP HTML page,
stage it, test it, and get it ready for publication.

**Todo:** Do we want to include an image with a sample AMP HTML page?

# Set up local staging server

Set up a local version of the AMP runtime server,
so you can test your AMP HTML pages before publishing.

You aren't required to follow these instructions,
but if you don't have your own production environment in place,
here's a simple way to get one up and running.

## Set up repository

1. Install [Node.js and npm](https://nodejs.org/en/).
2. Clone repository: `git clone https://github.com/ampproject/amphtml.git`.
3. Install dependencies: `npm i`.

## Build and start the dev server

2. Install npm http server: `npm install http-server -g`.
3. Start the local server: `http-server -p 8000 -c-1`.
4. Open a sample page, for example, go to
[http://localhost:8000/examples/released.amp.html](http://localhost:8000/examples/released.amp.html).

# Write the basic AMP HTML page

The basic AMP HTML page includes the following mark-up:

    <!doctype html>
    <html AMP lang="en">
      <head>
        <meta charset="utf-8">
        <title>Hello, AMPs</title>
        <link rel="canonical" href="http://example.ampproject.org/article-metadata.html" />
        <script src="https://cdn.ampproject.org/v0.js" async development></script>
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,minimal-ui">
        <script type="application/ld+json">
          {
            "@context": "http://schema.org",
            "@type": "NewsArticle",
            "headline": "Open-source framework for publishing content everywhere",
            "datePublished": "1907-05-05T12:02:41Z",
            "image": [
              "logo.jpg"
            ]
          }
        </script>
        <style>body {opacity: 0}</style><noscript><style>body {opacity: 1}</style></noscript>
      </head>
      <body>
        <h1>Welcome to the mobile web</h1>
      </body>
    </html>

**Todo:** I'm not seeing the schema.org mark-up in many of the examples.
Does this mean the markup isn't required?
Assuming it is, what exactly is the "image" attribute?
Is it OK to use this as the logo to keep it very simple?

## Required mark-up

AMP HTML documents MUST

- <a name="dctp"></a>start with the doctype `<!doctype html>`. [🔗](#dctp)
- <a name="ampd"></a>contain a top-level `<html ⚡>` tag (`<html amp>` is accepted as well). [🔗](#ampd)
- <a name="crps"></a>contain `<head>` and `<body>` tags (They are optional in HTML). [🔗](#crps)
- <a name="canon"></a>contain a `<link rel="canonical" href="$SOME_URL" />` tag inside their head that points to the regular HTML version of the AMP HTML document or to itself if no such HTML version exists. [🔗](#canon)
- <a name="chrs"></a>contain a `<meta charset="utf-8">` tag as the first child of their head tag. [🔗](#chrs)
- <a name="vprt"></a>contain a `<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,minimal-ui">` tag inside their head tag. [🔗](#vprt)
- <a name="scrpt"></a>contain a `<script src="https://cdn.ampproject.org/v0.js" async></script>` tag as the last element in their head. [🔗](#scrpt)
- <a name="opacity"></a>contain `<style>body {opacity: 0}</style><noscript><style>body {opacity: 1}</style></noscript>` in their head tag. [🔗](#opacity)

Most HTML tags can be used unchanged in AMP HTML.
Certain tags have equivalent custom AMP HTML tags;
other HTML tags are outright banned
(see [HTML Tags in the specification](../spec/amp-html-format.md))

Include `development` in the `<script>` tag
to validate your AMP HTML pages using the Chrome DevTools console
(see [Test the page](#Test the page) later in this document).

# Include an image

Content pages include more features than just the content.
To get you started,
here's the basic AMP HTML page now with an image:

	<!doctype html>
	<html AMP lang="en">
  	  <head>
        <meta charset="utf-8">
        <title>Hello, AMPs</title>
        <link rel="canonical" href="http://example.ampproject.org/article-metadata.html" />
        <script src="https://cdn.ampproject.org/v0.js" async development></script>
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,minimal-ui">
        <script type="application/ld+json">
          {
            "@context": "http://schema.org",
            "@type": "NewsArticle",
            "headline": "Open-source framework for publishing content everywhere",
            "datePublished": "1907-05-05T12:02:41Z",
            "image": [
              "logo.jpg"
            ]
          }
        </script>
        <style>body {opacity: 0}</style><noscript><style>body {opacity: 1}</style></noscript>
      </head>
      <body>
        <h1>Welcome to the mobile web</h1>
        <amp-img src="welcome.jpg" alt="Welcome" height="2000" width="800"></amp-img>

      </body>
    </html>

Learn more about
[how to include common features](../docs/include_features.md).

## AMP Layout System

Externally-loaded resources (like images, ads, videos, etc.)
must have a known height and width,
so the page doesn't jump (and reflow)
as the resources load.

The [AMP Layout System](../spec/amp-html-components.md)
is designed to support few but flexible layout scenarios
with solid performance.
It ensures that sizes of all elements can be calculated
by the browser via CSS automatically and
no resource loading can change these sizes.

**Todo:** Need to add more to layouts in specification.

# Add some styles

AMPs are web pages; add custom styling using common CSS properties.

Style elements inside `<style amp-custom>`
using class or element selectors in an author-defined,
inlined stylesheet: 

	<!doctype html>
	<html AMP lang="en">
  	  <head>
        <meta charset="utf-8">
        <title>Hello, AMPs</title>
        <link rel="canonical" href="http://example.ampproject.org/article-metadata.html" />
        <script src="https://cdn.ampproject.org/v0.js" async> development</script>
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,minimal-ui">
        <script type="application/ld+json">
          {
            "@context": "http://schema.org",
            "@type": "NewsArticle",
            "headline": "Open-source framework for publishing content everywhere",
            "datePublished": "1907-05-05T12:02:41Z",
            "image": [
              "logo.jpg"
            ]
          }
        </script>
        <style>body {opacity: 0}</style><noscript><style>body {opacity: 1}</style></noscript>
        <style amp-custom>
          <!-- any custom style goes here; and remember, body margin can not be declared -->
          body {
            background-color: white;
          }
          amp-img {
            background-color: gray;
          }
        </style>
      </head>
      <body>
        <h1>Welcome to the mobile web</h1>
        <amp-img src="welcome.jpg" alt="Welcome" height="2000" width="800"></amp-img>

      </body>
    </html>

Learn more about adding elements, including extended components,
in [How to Include Common Features](../docs/include_features).

# Test the page

Test the page by viewing the page in your local server
and validating the page using the
[Chrome DevTools console](https://developers.google.com/web/tools/javascript/console/).

1. Include your page in the AMP Runtime examples in your local directory:
`/ampproject/amphtml/examples`.
2. Check that the `<script>` tag includes `development`.
4. Open your page, for example, go to
[http://localhost:8000/examples/hello-AMP-HTML.html](http://localhost:8000/examples/hello-AMP-HTML.html).
5. Open the Chrome DevTools console and check for validation errors.

**Todo:** Include an image of Chrome DevTools console beside the AMP HTML page (in device mode, presumably),
that shows some errors.

<!--
# What to do when you get validation errors

**Todo:** Need to properly use the validator tool to get a better sense
for how this section might look and determine if its useful.
Might be sufficient to just include mandatory content section, which is in here now,
and briefly mention that the validator will report these errors.
-->

# Final steps before publishing

You've tested your page local and fixed all validation errors.
Before you publish,
remove `development` from `<script src="https://cdn.ampproject.org/v0.js" async> development</script>`.
Then build a minified production-ready version of your content.
If you've cloned the runtime,
`gulp-minify` minifies the content in the `examples` directory.

Learn more about tools that can help you get your content production ready in
[Set Up Your Build Tools](https://developers.google.com/web/tools/setup/workspace/setup-buildtools).
