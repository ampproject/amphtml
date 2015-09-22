# What is AMP HTML?

AMP HTML is a new way to make web pages
that load instantly on users’ mobile devices.
It's optimized for speed and performance,
supporting smart caching and delivering responsive content.

AMP HTML is not a template-based system; it's an extension of the web.
Publishers continue to host their own content, innovate on their user experiences,
and integrate their advertising and business models.

**Todo:** Do we want some sort of art included in the intro?

# What are AMPs?

AMPs are lighter-weight versions of standard web pages.
They're fast to load; and their web pages,
publicly crawlable files that can be fully cached for speed of access.

A simple page in AMP HTML includes this mark-up:

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

Learn [how to create this basic AMP HTML page](../docs/create_page.md).

# How does AMP HTML work?

AMP HTML documents are web pages;
they load in any modern browser or webview.
They can be uploaded to a web server and served just like any other HTML document.
But they are designed to be optionally served
through specialized AMP serving systems that proxy AMP documents,
serve them from their own origin, and are allowed
to apply transformations to the document that provide additional performance benefits.

The AMP runtime defines a small set of custom elements
that can be used in any AMP file.
These custom elements serve two primary purposes:

* Enable the AMP runtime to manage the loading of external resources,
which may slow down the initial render or cause jank.
* Allow AMP authors to maintain their own styles and
include functionality above and beyond standard HTML,
while maintaining the security and performance-minded requirement
that no author-written JavaScript is executed.

There are two types of supported AMP components: built-in and extended.
[Built-in components](../builtins/README.md)
are always available in a AMP document.
[Extended components](../extensions/README.md)
must be explicitly included into the document
as custom elements.

# Where to go for more information

* [AMP HTML runtime](https://github.com/ampproject/amphtml)
* [AMP HTML built-in elements](../builtins/README.md)
* [AMP HTML extended elements](../extensions/README.md)
* [AMP HTML release notes](**Todo**)
* [AMP HTML samples](../examples)
* [AMP HTML FAQ](**Todo**)
* [How to Create a Basic AMP HTML Page](../docs/create_page.md)
* [How to Include Common Features](../docs/include_features.md)

