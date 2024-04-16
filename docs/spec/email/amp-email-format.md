AMP is a technology known for developing super fast web pages on mobile clients. AMP is a set of HTML tags backed by JavaScript that easily enables functionality with an added focus on performance and security. There are [AMP components](https://amp.dev/documentation/components/) for everything from carousels, to responsive form elements, to retrieving fresh content from remote endpoints.

The AMP for Email format provides [a subset of AMP components](amp-email-components.md) that you can use in email messages. Recipients of AMP emails can view and interact with the AMP components directly in the email.

# The AMP for Email Format

## Required markup

The following code represents the minimum amount of markup that makes up a valid AMP email message:

```html
<!DOCTYPE html>
<html ⚡4email>
  <head>
    <meta charset="utf-8" />
    <style amp4email-boilerplate>
      body {
        visibility: hidden;
      }
    </style>
    <script async src="https://cdn.ampproject.org/v0.js"></script>
  </head>
  <body>
    Hello, world.
  </body>
</html>
```

An AMP email message MUST

-   <a name="dctp"></a>start with the doctype `<!doctype html>`. [🔗](#dctp)
-   <a name="ampd"></a>contain a top-level `<html ⚡4email>` tag (`<html amp4email>` is accepted as well). [🔗](#ampd)
-   <a name="crps"></a>contain `<head>` and `<body>` tags (They are optional in HTML). [🔗](#crps)
-   <a name="chrs"></a>contain a `<meta charset="utf-8">` tag as the first child of their head tag. [🔗](#chrs)
-   <a name="script"></a>contain a `<script async src="https://cdn.ampproject.org/v0.js"></script>` tag inside their head tag. [🔗](#script)
-   <a name="boilerplate"></a>contain amp4email boilerplate (`<style amp4email-boilerplate>body{visibility:hidden}</style>`) inside their head tag to initially hide the content until AMP JS is loaded. [🔗](#boilerplate)

The entire AMPHTML markup must not exceed 200,000 bytes.

## Structure and rendering

AMP for Email relies on the standard `multipart/alternative` [MIME](https://en.wikipedia.org/wiki/MIME) subtype, as defined in
[RFC 1521, section 7.2.3](https://tools.ietf.org/html/rfc1521#section-7.2.3).

_For more information, see [Structure and rendering of AMP emails](amp-email-structure.md)._

## Supported AMP components

_See [AMP for Email Supported Components](amp-email-components.md)._

## HTML requirements

_See [Supported HTML in AMP for Email](amp-email-html.md)._

## CSS requirements

### Supported selectors and properties

_See [Supported CSS in AMP for Email](amp-email-css.md)._

### Specifying CSS in an AMP document

All CSS in any AMP document must be included in a `<style amp-custom>` tag within the header or as inline `style` attributes.

```html
...
<style amp-custom>
  /* any custom styles go here. */
  body {
    background-color: white;
  }
  amp-img {
    border: 5px solid black;
  }
  amp-img.grey-placeholder {
    background-color: grey;
  }
</style>
...
</head>
```

Note: The entire `<style>` tag cannot exceed 50,000 bytes. The validator will check for this.

## Document dimensions

-   **Optimal width**: 800px or less (any wider and content may be unexpectedly truncated on some clients).

-   **Height**: variable, the client allows the user to scroll through the content.

## Validation

To ensure your email messages meet the strict criteria for the AMP for Email format, you can use AMP's existing validation tools.

See [Validate AMP Email](https://amp.dev/documentation/guides-and-tutorials/learn/validation-workflow/validate_emails/) for more information.

## Privacy and Security

### Tracking email opens and interaction

AMPHTML allows tracking email opens with pixel tracking techniques, same as regular HTML emails. Any user-initiated requests for data from external services will also indicate the user is interacting with the message. Email clients may offer their users the ability to disable loading remote images, and other external requests.

### AMP-specific analytics

The following AMP-specific analytic techniques are not supported:

-   [AMP `CLIENT_ID`](https://amp.dev/documentation/guides-and-tutorials/optimize-measure/configure-analytics/analytics_basics#user-identification)
-   [`amp-analytics`](https://amp.dev/documentation/components/amp-analytics)
-   [`amp-pixel`](https://amp.dev/documentation/components/amp-pixel)
-   [AMP Variable Substitution](https://amp.dev/documentation/guides-and-tutorials/optimize-and-measure/configure-analytics/analytics_basics/#variable-substitution)

### Component-specific considerations

Requests for images inside [`<amp-carousel>`](https://amp.dev/documentation/components/amp-carousel) or [`<amp-accordion>`](https://amp.dev/documentation/components/amp-accordion)
can indicate to the sender that the user is interacting with the message.

Redirects in [`<amp-form>`](https://amp.dev/documentation/components/amp-form) are disallowed at runtime.

## Feedback & Support

For support and feedback on AMP for Email, please use the following channel: [ongoing-participation](https://github.com/ampproject/amphtml/blob/main/docs/contributing.md#ongoing-participation)
