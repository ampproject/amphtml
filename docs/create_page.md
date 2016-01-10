# How to Create a Basic AMP HTML Page

Learn how to create a basic AMP HTML page,
stage it, test it, and get it ready for publication.

# Write the basic AMP HTML page

The basic AMP HTML page includes the following mark-up:

```html
<!doctype html>
<html amp lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hello, AMPs</title>
    <link rel="canonical" href="http://example.ampproject.org/article-metadata.html" />
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <script type="application/ld+json">
      {
        "@context": "http://schema.org",
        "@type": "NewsArticle",
        "headline": "Open-source framework for publishing content",
        "datePublished": "2015-10-07T12:02:41Z",
        "image": [
          "logo.jpg"
        ]
      }
    </script>
    <style>body {opacity: 0}</style><noscript><style>body {opacity: 1}</style></noscript>
    <script async src="https://cdn.ampproject.org/v0.js"></script>
  </head>
  <body>
    <h1>Welcome to the mobile web</h1>
  </body>
</html>
```

## Required mark-up

AMP HTML documents MUST

- <a name="dctp"></a>start with the doctype `<!doctype html>`.
- <a name="ampd"></a>contain a top-level `<html ⚡>` tag (`<html amp>` is accepted as well).
- <a name="crps"></a>contain `<head>` and `<body>` tags (They are optional in HTML).
- <a name="canon"></a>contain a `<link rel="canonical" href="$SOME_URL" />` tag inside their head that points to the regular HTML version of the AMP HTML document or to itself if no such HTML version exists.
- <a name="chrs"></a>contain a `<meta charset="utf-8">` tag as the first child of their head tag.
- <a name="vprt"></a>contain a `<meta name="viewport" content="width=device-width,minimum-scale=1">` tag inside their head tag. It's also recommended to include `initial-scale=1`.
- <a name="scrpt"></a>contain a `<script async src="https://cdn.ampproject.org/v0.js"></script>` tag as the last element in their head.
- <a name="opacity"></a>contain `<style>body {opacity: 0}</style><noscript><style>body {opacity: 1}</style></noscript>` in their head tag.

Most HTML tags can be used unchanged in AMP HTML.
Certain tags have equivalent custom AMP HTML tags;
other HTML tags are outright banned
(see [HTML Tags in the specification](../spec/amp-html-format.md)).

# Include an image

Content pages include more features than just the content.
To get you started,
here's the basic AMP HTML page now with an image:

```html
<!doctype html>
<html amp lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hello, AMPs</title>
    <link rel="canonical" href="http://example.ampproject.org/article-metadata.html" />
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <script type="application/ld+json">
      {
        "@context": "http://schema.org",
        "@type": "NewsArticle",
        "headline": "Open-source framework for publishing content everywhere",
        "datePublished": "2015-10-07T12:02:41Z",
        "image": [
          "logo.jpg"
        ]
      }
    </script>
    <style>body {opacity: 0}</style><noscript><style>body {opacity: 1}</style></noscript>
    <script async src="https://cdn.ampproject.org/v0.js"></script>
  </head>
  <body>
    <h1>Welcome to the mobile web</h1>
    <amp-img src="welcome.jpg" alt="Welcome" height="2000" width="800"></amp-img>
  </body>
</html>
```

Learn more about
[how to include common features](../docs/include_features.md).

# Add some styles

AMPs are web pages; add custom styling using common CSS properties.

Style elements inside `<style amp-custom>`
using class or element selectors in an author-defined,
inlined stylesheet:

```html
<!doctype html>
<html amp lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hello, AMPs</title>
    <link rel="canonical" href="http://example.ampproject.org/article-metadata.html" />
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <script type="application/ld+json">
      {
        "@context": "http://schema.org",
        "@type": "NewsArticle",
        "headline": "Open-source framework for publishing content everywhere",
        "datePublished": "2015-10-07T12:02:41Z",
        "image": [
          "logo.jpg"
        ]
      }
    </script>
    <style>body {opacity: 0}</style><noscript><style>body {opacity: 1}</style></noscript>
    <style amp-custom>
      /* any custom style goes here; and remember, body margin can not be declared */
      body {
        background-color: white;
      }
      amp-img {
        background-color: gray;
      }
    </style>
    <script async src="https://cdn.ampproject.org/v0.js"></script>
  </head>
  <body>
    <h1>Welcome to the mobile web</h1>
    <amp-img src="welcome.jpg" alt="Welcome" height="2000" width="800"></amp-img>
  </body>
</html>
```

Learn more about adding elements, including extended components,
in [How to Include Common Features](../docs/include_features.md).

# Page layout

Externally-loaded resources (like images, ads, videos, etc.) must have height
and width attributes.  This ensures that sizes of all elements can be
calculated by the browser via CSS automatically and element sizes won't be
recalculated because of external resources, preventing the page from jumping
around as resources load.

Moreover, use of the style attribute for tags is not permitted, as this
optimizes impact rendering speed in unpredictable ways.

<!--
**Todo:** Cover the layout attribute
-->

Learn more in the [AMP HTML Components specification](../spec/amp-html-components.md).

# Test the page

Test the page by viewing the page in your local server
and validating the page using the
[Chrome DevTools console](https://developers.google.com/web/tools/javascript/console/).

1. Include your page in your local directory, for example,
`/ampproject/amphtml/examples`.
2. Get your web server up and running locally.
For a quick web server, run `python -m SimpleHTTPServer`.
4. Open your page, for example, go to
[http://localhost:8000/released.amp.html](http://localhost:8000/released.amp.html).
5. Add "#development=1" to the URL, for example,
[http://localhost:8000/released.amp.html#development=1](http://localhost:8000/released.amp.html#development=1).
6. Open the Chrome DevTools console and check for validation errors.

<!--
# What to do when you get validation errors

**Todo:** Need to properly use the validator tool to get a better sense
for how this section might look and determine if its useful.
Might be sufficient to just include mandatory content section, which is in here now,
and briefly mention that the validator will report these errors.
-->

# Final steps before publishing

Congrats! You've tested your page locally and fixed all validation errors.

Learn more about tools that can help you get your content production ready in
[Set Up Your Build Tools](https://developers.google.com/web/tools/setup/workspace/setup-buildtools).
