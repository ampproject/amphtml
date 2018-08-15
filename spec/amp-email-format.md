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

# AMPHTML Email

AMP is a technology commonly known for developing super fast web pages on mobile clients. AMP is in fact a set of HTML tags backed by JavaScript that allow all kinds of functionality with a focus on performance and security.

There are [AMP components](https://www.ampproject.org/docs/reference/components) for everything from carousels, to responsive form elements, to retrieving fresh content from remote endpoints. The AMPHTML Email format provides a subset of AMP components that you can use in email messages. Recipients of AMP emails can view and interact with the AMP components directly in the email message.

<div class="noshowtoc">

**Contents**

* [The AMPHTML Email Format](#the-amphtml-email-format)
  + [Required markup](#required-markup)
* [AMP Components](#amp-components)
  * [Dynamic Content](#dynamic-content)
  * [Layout](#layout)
  * [Media](#media)
* [CSS requirements](#css-requirements)
   * [Specifying CSS in an AMP document](#specifying-css-in-an-amp-document)
* [Document dimensions](#document-dimensions)
* [Validation tools](#validation-tools)
  * [Web-based validator](#web-based-validator)
  * [Command-line validator](#command-line-validator)
* [Examples](#examples)
* [Adding AMP to existing emails](#adding-amp-to-existing-emails)
* [Replying/forwarding semantics](#replyingforwarding-semantics)
* [Authentication](#authentication)
* [FAQ](#faq)
* [Feedback & Support](#feedback--support)

</div>

## The AMPHTML Email Format

### Required markup

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

An AMP email message must:

| Rule | Description |
| ---- | ----------- |
| Start with the `<!doctype html>` doctype. | Standard for HTML. |
| Contain a top-level `<html ⚡4email>` tag.<br>(`<html amp4email>` is accepted as well) | Identifies the document as AMPHTML Email. |
| Contain `<head>` and `<body>` tags. | Optional in HTML but not in AMPHTML Email. |
| Contain a `<meta charset="utf-8">` tag as the first child of their `<head>` tag. | Identifies the encoding for the page. |
| Contain the amp4email boilerplate in the `<head>` :<br>`<style amp4email-boilerplate>body{visibility:hidden}</style><script async src="https://cdn.ampproject.org/v0.js"></script>` | CSS boilerplate to initially hide the content until AMP JS is loaded. |

## AMP Components

The following is a proposed list of AMP components that are supported in AMP email messages. The components are grouped into the following categories:

* [Dynamic Content](#dynamic-content)
* [Layout](#layout)
* [Media](#media)

### Dynamic Content

| Element | Description |
| ------- | ----------- |
| [`<amp-form>`](https://www.ampproject.org/docs/reference/components/amp-form) | Form element. The action-xhr attribute must be used in place of the regular action attribute. Can be used in conjunction with `<template type="amp-mustache">` to render a response. |
| [`<amp-selector>`](https://www.ampproject.org/docs/reference/components/amp-selector) | A multi-select widget for use within a form. |
| [`<amp-bind>` and `<amp-state>`](https://www.ampproject.org/docs/reference/components/amp-bind) | Simple scripting language in AMP that allows the manipulation of a state machine for interactions between elements. Can also be used to add behavior on certain events.<br><br>`<amp-state>` is used to remotely fetch the initial state machine values.<br><br>**Note:** It is prohibited to bind to `[href]` or `[src]`. It is also prohibited to use the `AMP.print`, `AMP.navigateTo` and `AMP.goBack` actions. |
| [`<amp-list>`](https://www.ampproject.org/docs/reference/components/amp-list) | Remotely fetches JSON data that will be rendered by an [`<amp-mustache>`](https://www.ampproject.org/docs/reference/components/amp-mustache).<br><br>**Note:** Binding to the `[src]` attribute is not allowed. Including user credentials with `credentials="include"` is also prohibited. |
| [`<template type="amp-mustache">`](https://www.ampproject.org/docs/reference/components/amp-mustache) | A Mustache template markup to render the results of an `amp-list` call. |

### Layout

| Element | Description |
| ------- | ----------- |
| [`<amp-accordion>`](https://www.ampproject.org/docs/reference/components/amp-accordion)| A UI element that facilitates showing/hiding different sections. |
| [`<amp-carousel>`](https://www.ampproject.org/docs/reference/components/amp-carousel) | A carousel UI component. |
| [`<amp-sidebar>`](https://www.ampproject.org/docs/reference/components/amp-sidebar) | A sidebar for navigational purposes. |
| [`<amp-image-lightbox>`](https://www.ampproject.org/docs/reference/components/amp-image-lightbox) | A lightbox for containing images. |
| [`<amp-lightbox>`](https://www.ampproject.org/docs/reference/components/amp-lightbox) | A lightbox for containing content. |
| [`<amp-fit-text>`](https://www.ampproject.org/docs/reference/components/amp-fit-text) | A helper component for fitting text within a certain area. |
| [`<amp-timeago>`](https://www.ampproject.org/docs/reference/components/amp-timeago) | Provides a convenient way of rendering timestamps. |

### Media

| Element | Description |
| ------- | ----------- |
| [`<amp-img>`](https://www.ampproject.org/docs/reference/components/amp-img) | An AMP component that replaces `<img>`.<br><br>**Note:** Binding to `[src]` is not allowed. |
| [`<amp-anim>`](https://www.ampproject.org/docs/reference/components/amp-anim) | Embeds GIF files.<br><br>**Note:** Binding to `[src]` is not allowed. |

## CSS requirements

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

{% call callout('Note', type='note') %}
The entire `<style>` tag cannot exceed 50,000 bytes. The validator will check for this.
{% endcall %}

## Document dimensions

* **Optimal width**: 800px or less (any wider and content may be unexpectedly truncated on some clients).

* **Height**: variable, the client allows the user to scroll through the content.

## Validation tools

To ensure your email messages meet the strict criteria for the AMPHTML Email format, validate your content with one of the following tools:

### Web-based validator

A web-based validator is available at [https://validator.ampproject.org/](https://validator.ampproject.org/)

Simply paste in the AMP HTML to ensure the document meets all the AMPHTML Email restrictions. This tool shows you the validation errors directly inline.

### Command-line validator

A command-line validation tool is also available for validating your AMPHTML Email document.

**Installation**

Follow the instructions to install the [AMP Validator CLI tool](https://www.ampproject.org/docs/guides/validate#command-line-tool).

**Usage**

Once you have the command-line tool installed, run the following command by replacing **`<amphtml file>`** with your file containing the HTML content.

```sh
amphtml-validator --html_format AMP4Email \
<amphtml file>
```

For example:

```sh
amphtml-validator --html_format AMP4Email \
amp_email.html
```

## Examples

This section provides some AMPHTML Email code examples.

### Basic usage of `<amp-list>`

The following is a fictional email that includes an updated list of featured products retrieved from an endpoint. This example shows the basic usage of [`<amp-list>`](https://www.ampproject.org/docs/reference/components/amp-list).

```html
<!doctype html>
<html ⚡4email>
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-list" src="https://cdn.ampproject.org/v0/amp-list-0.1.js"></script>
  <script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>
  <style amp4email-boilerplate>body{visibility:hidden}</style>
</head>
<body>
  Check out these latest deals from our store!
  <amp-list src="https://ampbyexample.com/json/cart.json" layout="fixed-height" height="80">
    <template type="amp-mustache">
      <div id="cart">
        <!-- These items (and their prices) can be updated dynamically. -->
        {{#cart_items}}
        <div class="cart-item">
            <span>{{name}}</span>
            <span>{{price}}</span>
          </div>
        {{/cart_items}}
        {{^cart_items}}
          There are no featured products available. Please check back again later.
        {{/cart_items}}
      </div>
    </template>
  </amp-list>
</body>
</html>
```

### Basic usage of `<amp-bind>`

The following is a fictional email that shows interactivity features by using [`<amp-bind>`](https://www.ampproject.org/docs/reference/components/amp-bind).

```html
<!doctype html>
<html ⚡4email>
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-bind" src="https://cdn.ampproject.org/v0/amp-bind-0.1.js"></script>
  <style amp4email-boilerplate>body{visibility:hidden}</style>
  <style amp-custom>
    .red { background-color: red; }
    .blue { background-color: blue; }
    .yellow { background-color: yellow; }
  </style>
</head>
<body>
  <p [class]="state.color" class="yellow" [text]="'The current color is ' + state.color + '.'">
    The current color is yellow
  </p>
  <button on="tap:AMP.setState({state: {color: 'red'}})">
    Set color to red
  </button>
  <button on="tap:AMP.setState({state: {color: 'blue'}})">
    Set color to blue
  </button>
</body>
</html>
```
## Adding AMP to existing emails

Email is structured as a [MIME tree](https://en.wikipedia.org/wiki/MIME). This MIME tree contains the message body and any attachments to the email.

Embedding AMP within an email is simple, add a new MIME part with a content type of `text/x-amp-html` as a descendant of `multipart/alternative`. It should live alongside the existing `text/html` or `text/plain` parts. This ensures that the email message works on all clients.

<amp-img alt="AMPHTML Email MIME Parts Diagram"
    layout="responsive"
    width="752" height="246"
    src="https://github.com/ampproject/amphtml/raw/master/spec/img/amp-email-mime-parts.png">
  <noscript>
    <img alt="AMPHTML Email MIME Parts Diagram" src="img/amp-email-mime-parts.png" />
  </noscript>
</amp-img>

Important things to note:
- The `text/x-amp-html` part must be nested under a `multipart/alternative` node, it will not be recognized by the email client otherwise.
- Some email clients will only render the last MIME part, so we recommend placing the `text/x-amp-html` MIME part *before* the `text/html` MIME part.

See the following example:

```text
From:  Person A <persona@gmail.com>
To: Person B <personb@gmail.com>
Subject: An AMP email!
Content-Type: multipart/alternative; boundary="001a114634ac3555ae05525685ae"

--001a114634ac3555ae05525685ae
Content-Type: text/plain; charset="UTF-8"; format=flowed; delsp=yes

Hello World in plain text!

--001a114634ac3555ae05525685ae
Content-Type: text/x-amp-html; charset="UTF-8"

<!doctype html>
<html ⚡4email>
<head>
  <meta charset="utf-8">
  <style amp4email-boilerplate>body{visibility:hidden}</style>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
</head>
<body>
Hello World in AMP!
</body>
</html>
--001a114634ac3555ae05525685ae--
Content-Type: text/html; charset="UTF-8"

<span>Hello World in HTML!</span>
--001a114634ac3555ae05525685ae
```

## Replying/forwarding semantics

To start, the email client strips out the `text/x-amp-html` part of the MIME tree when a user replies to or forwards an AMP email message. This is why it is important that an email provide alternative content in the HTML part.

## Authentication

There is no authentication for outgoing XHR calls from AMP email messages.  Every XHR request is considered anonymous. Email senders should not rely on cookies to authenticate outgoing XHR requests from emails.

{% call callout('Note', type='note') %}
There is also no plan to include things like OAuth tokens to authenticate a user to a request.
{% endcall %}

## FAQ

##### What is the official name of this technology?

"AMPHTML Email" is the name of this technology.

##### Will this allow people to send JavaScript email?

No. Valid AMP documents are not permitted to have their own JavaScript.

##### I heard that [AMP is going to support JavaScript](https://github.com/ampproject/amphtml/issues/13471). Will this be incorporated into AMPHTML Email?

No. To maintain users’ expectations of security and privacy, we’ll only allow a conservative subset of AMP functionality.

##### Are all AMP components supported?

No. AMPHTML Email supports a restricted subset of the AMP components in order to ensure user safety in web-based mail clients.

##### Which AMP components will be supported?

See the [AMP Components](#amp-components) section in the spec below.

##### Will the `amp-ad` component be supported?

 No.

##### Will the `amp-pixel` and `amp-analytics` components be supported?

No.

##### Do AMPHTML Email documents use AMP Caches?

No.

##### Will this break email as an archival format?

No, the spec still requires senders to include a static, HTML version of the email that users can view if they choose.

##### Does this make it possible to play videos inside an email?

No. Currently, only `amp-image` will be supported.

##### Does this mean email senders can track when I open my mail?

AMPHTML Emails can track opens just like regular emails today using pixel tracking techniques. Any user-initiated requests for data from external services would also indicate to the sender that the user is interacting with the message. Email clients may offer their users the ability to disable loading of remote images, including any other external requests.

##### Does this mean email senders can track when I interact with a carousel?

Request for images in the carousel can indicate to the sender that the user is interacting with the message.

##### What will happen if I open an AMPHTML Email in an email client without AMPHTML support?

The usual HTML content will be rendered. Email clients currently ignore MIME types they don’t understand. For example the [`text/watch-html` MIME type](https://litmus.com/blog/how-to-send-hidden-version-email-apple-watch) gets ignored according to the rules specified in [RFC 1341 7.2.3](https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html) which state:<br><br>*“In general, user agents that compose multipart/alternative entities should place the body parts in increasing order of preference, that is, with the preferred format last. For fancy text, the sending user agent should put the plainest format first and the richest format last. Receiving user agents should pick and display the last format they are capable of displaying.”*

##### Will users be able to opt out?

Email clients may offer users the ability to disable AMPHTML documents in their email.

##### Who else is supporting rendering AMPHTML emails?

Currently, Gmail is the first adopter with their [Gmail Developer Preview](https://gsuite.google.com/campaigns/index__amp-for-email.html)  starting with the Web developer preview. We're looking forward to working with other mail providers and clients to have their web and mobile apps support this as well.

##### Will this consume more battery life?

That will depend on the implementation strategy chosen by the email clients.

##### Will this enable people to send me Bitcoin miners in my email?

No. Valid AMP documents are not permitted to have their own Javascript.

##### How will AMPHTML Email deal with spam since attackers can evade spam detection in real time at mail-open time?

Email providers will need to proxy all XHRs and use the responses to render the content and perform phishing checks.

##### Are there any CSS restrictions?

The AMP4EMAIL validator spec does not contain additional CSS restrictions beyond the [standard AMP CSS restrictions](https://www.ampproject.org/docs/design/responsive/style_pages). However, email clients may have their own CSS restrictions.

For example, in Gmail, the allowed list of CSS properties and values can be found at [Gmail Supported CSS Properties & Media Queries](https://developers.google.com/gmail/design/reference/supported_css).

Once other email clients start implementing AMPHTML Email we'll provide more guidance on how email senders can easily write cross-client compatible emails.

##### Will the AMP `CLIENT_ID` be supported?

No.

##### Will [AMP Variable Substitution](https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md) be supported?

No. They are mainly used in `amp-analytics` and `amp-pixel`, that are not supported in AMPHTML Email. In addition, page URLs used for variable substitution do not apply to emails.

##### Will `AMP.navigateTo(url=STRING)` be supported?

No.

## Feedback & Support

For support and feedback on AMPHTML Email, please use the following channel: [ongoing-participation](https://github.com/ampproject/amphtml/blob/master/CONTRIBUTING.md#ongoing-participation)
