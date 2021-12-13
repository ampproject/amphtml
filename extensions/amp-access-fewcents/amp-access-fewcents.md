---
$category@: presentation
formats:
  - websites
teaser:
  text: Fill this in with teaser text to improve SEO. Use the component description.
---

# amp-access-fewcents
-   The amp-access-fewcents component is based on, and requires amp-access.
-   amp-access-fewcents is built for amp pages
-   amp-access-fewcents component internally uses amp-access to provide a behavior similar to amp-access, but built in such a way that it can be used with Fewcents.
-   amp-access-fewcents component does not require an authorization, pingback or login configuration, because it is pre-configured to work with the Fewcents.
-   You just need to pass or configure the extension according to your need.
-   Publisher's can have their logo on the paywall
-   This component also relies on Access Content Markup to show and hide content.

## Usage

The configuration on the pulisher end will look like this

```
    <script id="amp-access" type="application/json">
      {
        "vendor": "fewcents",
        "fewcents": {
          "publisherLogoUrl" : "logoUrl",
          "contentSelector" : "amp-access-fewcents-dialog",
          "primaryColor" : "",
          "accessKey" : "samplehost",
          "category": "paywall",
          "articleIdentifier": "sampleidentifier"
        }
      }
    </script>
```

### Example

The example below demonstrates `amp-access-fewcents` component in standalone use.

```
  <section amp-access="NOT access OR flash" amp-access-hide>
      <div id="amp-access-fewcents-dialog"></div>
    </section>

    <section amp-access="error" amp-access-hide class="error-section">
      Oops... Something broke.
    </section>

    <div amp-access="access" amp-access-hide>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
        ullamcorper turpis vel commodo scelerisque. Phasellus luctus nunc ut
        elit cursus, et imperdiet diam vehicula. Duis et nisi sed urna blandit
        bibendum et sit amet erat. Suspendisse potenti.
      </p>
    </div>
```

### Layout and style

```
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-access-fewcents-0.1.css">
```

## Version notes (optional)

Information on version differences and migration notes.

## Validation
