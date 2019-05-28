<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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



AMP is a technology known for developing super fast web pages on mobile clients. AMP is a set of HTML tags backed by JavaScript that easily enables functionality with an added focus on performance and security. There are [AMP components](https://amp.dev/documentation/components/) for everything from carousels, to responsive form elements, to retrieving fresh content from remote endpoints.

The AMP for Email format provides [a subset of AMP components](amp-email-components.md) that you can use in email messages. Recipients of AMP emails can view and interact with the AMP components directly in the email.


# The AMP for Email Format

## Required markup

The following code represents the minimum amount of markup that makes up a valid AMP email message:

```html
<!doctype html>
<html ⚡4email>
<head>
  <meta charset="utf-8">
  <style amp4email-boilerplate>body{visibility:hidden}</style>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
</head>
<body>
Hello, world.
</body>
</html>
```

An AMP email message MUST

- <a name="dctp"></a>start with the doctype `<!doctype html>`. [🔗](#dctp)
- <a name="ampd"></a>contain a top-level `<html ⚡4email>` tag (`<html amp4email>` is accepted as well). [🔗](#ampd)
- <a name="crps"></a>contain `<head>` and `<body>` tags (They are optional in HTML). [🔗](#crps)
- <a name="chrs"></a>contain a `<meta charset="utf-8">` tag as the first child of their head tag. [🔗](#chrs)
- <a name="scrpt"></a>contain a `<script async src="https://cdn.ampproject.org/v0.js"></script>` tag inside their head tag. [🔗](#scrpt)
- <a name="boilerplate"></a>contain amp4email boilerplate (`<style amp4email-boilerplate>body{visibility:hidden}</style>`) inside their head tag to initially hide the content until AMP JS is loaded. [🔗](#boilerplate)

The entire AMPHTML markup must not exceed 102,400 bytes.


## Supported AMP components

*See [AMP for Email Supported Components](amp-email-components.md).*

## HTML requirements

*See [Supported HTML in AMP for Email](amp-email-html.md).*

## CSS requirements

### Supported selectors and properties

*See [Supported CSS in AMP for Email](amp-email-css.md).*

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

* **Optimal width**: 800px or less (any wider and content may be unexpectedly truncated on some clients).

* **Height**: variable, the client allows the user to scroll through the content.

## Validation

To ensure your email messages meet the strict criteria for the AMP for Email format, you can use AMP's existing validation tools.

See [Validate AMP Email](https://amp.dev/documentation/guides-and-tutorials/develop/validate_emails) for more information.

## Privacy and Security

### Tracking email opens and interaction
AMPHTML allows tracking email opens with pixel tracking techniques, same as regular HTML emails. Any user-initiated requests for data from external services will also indicate the user is interacting with the message. Email clients may offer their users the ability to disable loading remote images, and other external requests.


### AMP-specific analytics
The following AMP-specific analytic techniques are not supported:

*   [AMP `CLIENT_ID`](https://amp.dev/documentation/guides-and-tutorials/optimize-measure/configure-analytics/analytics_basics#user-identification)
*   [`amp-analytics`](https://amp.dev/documentation/components/amp-analytics)
*   [`amp-pixel`](https://amp.dev/documentation/components/amp-pixel)
*   [AMP Variable Substitution](https://amp.dev/documentation/guides-and-tutorials/optimize-measure/configure-analytics/analytics_basics.html#variable-substitution)

### Component-specific considerations

Requests for images inside [`<amp-carousel>`](https://amp.dev/documentation/components/amp-carousel) or [`<amp-accordion>`](https://amp.dev/documentation/components/amp-accordion)
can indicate to the sender that the user is interacting with the message.


## Feedback & Support

For support and feedback on AMP for Email, please use the following channel: [ongoing-participation](https://github.com/ampproject/amphtml/blob/master/CONTRIBUTING.md#ongoing-participation)
