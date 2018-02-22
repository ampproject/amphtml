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

There are AMP components for everything from carousels, to responsive form elements, to retrieving fresh content from remote endpoints. The AMP for Email format provides a subset of AMP components that you can use in email messages. Recipients of AMP emails can view and interact with the AMP components directly in the email message.

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

<table>
  <tr>
    <td>Rule</td>
    <td>Description</td>
  </tr>
  <tr>
    <td>Start with the <!doctype html> doctype.</td>
    <td>Standard for HTML.</td>
  </tr>
  <tr>
    <td>Contain a top-level <html ⚡4email> tag.

(<html amp4email> is accepted as well )</td>
    <td>Identifies the document as AMP for Email. </td>
  </tr>
  <tr>
    <td>Contain <head> and <body> tags.</td>
    <td>Optional in HTML but not in AMP for Email. </td>
  </tr>
  <tr>
    <td>Contain a <meta charset="utf-8"> tag as the first child of their <head> tag.</td>
    <td>Identifies the encoding for the page.</td>
  </tr>
  <tr>
    <td>Contain the amp4email boilerplate in the  <head> :
<style amp4email-boilerplate>body{visibility:hidden}</style>
<script async src="https://cdn.ampproject.org/v0.js"></script></td>
    <td>CSS boilerplate to initially hide the content until AMP JS is loaded.
</td>
  </tr>
</table>

## AMP components

The following is a proposed list of AMP components that are supported in AMP email messages. The components are grouped into the following categories:

* [Dynamic Content](#bookmark=id.u1hzf7v786jy)
* [Layout](#heading=h.x62v9qb5igt5)
* [Media](#bookmark=id.kxcerkv3s3yz)

### Dynamic Content

<table>
  <tr>
    <td>Element</td>
    <td>Description</td>
  </tr>
  <tr>
    <td><code>&lt;amp-form&gt;</code> [Example]</td>
    <td>Form element. The action-xhr attribute must be used in place of the regular action attribute. Can be used in conjunction with <code>&lt;template type="amp-mustache"&gt;</code> to render a response.

Note that submitting a form WILL NOT propagate a user’s cookies, even if they are already logged-into your service.

Binding to the [action-xhr] attribute is also not allowed.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-selector&gt;</code> [Example]</td>
    <td>A multi-select widget for use within a form.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-bind&gt;</code> and <code>&lt;amp-state&gt;</code> [Example]
</td>
    <td>Simple scripting language in AMP that allows the manipulation of a state machine for interactions between elements. Can also be used to add behavior on certain events.

<code>&lt;amp-state&gt;</code> is used to remotely fetch the initial state machine values.

Note: It is prohibited to bind an [href] or [src] value. It is also prohibited to use the print, navigate and goBack actions.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-list&gt;</code> [Example]</td>
    <td>Remotely fetches JSON data that will be rendered by an <code>&lt;amp-mustache&gt;</code>.

Binding to the [src] attribute is not allowed.   Including user credentials with credentials="include" is also prohibited.</td>
  </tr>
  <tr>
    <td><code>&lt;template type="amp-mustache"&gt;</code> [Example]</td>
    <td>A Mustache template markup to render the results of an <code>&lt;amp-list&gt;</code> call.</td>
  </tr>
</table>


### Layout

<table>
  <tr>
    <td>Element</td>
    <td>Description</td>
  </tr>
  <tr>
    <td><code>&lt;amp-accordion&gt;</code> [Example]</td>
    <td>A UI element that facilitates showing/hiding different sections.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-carousel&gt;</code> [Example]</td>
    <td>A carousel UI component.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-sidebar&gt;</code> [Example]</td>
    <td>A sidebar for navigational purposes.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-image-lightbox&gt;</code> [Example]</td>
    <td>A lightbox for containing images.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-lightbox&gt;</code> [Example]</td>
    <td>A lightbox for containing content.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-fit-text&gt;</code> [Example]</td>
    <td>A helper component for fitting text within a certain area.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-timeago&gt;</code> [Example]</td>
    <td>Provides a convenient way of rendering timestamps.</td>
  </tr>
</table>


### Media

<table>
  <tr>
    <td>Element</td>
    <td>Description</td>
  </tr>
  <tr>
    <td><code>&lt;amp-img&gt;</code> [Example]</td>
    <td>An AMP component that replaces <code>&lt;img&gt;</code>.

Note: Binding to [src] is not allowed.</td>
  </tr>
  <tr>
    <td><code>&lt;amp-anim&gt;</code> [Example]</td>
    <td>Embeds GIF files.

Note: Binding to [src] is not allowed.</td>
  </tr>
</table>


## CSS requirements

### Specifying CSS in an AMP document

All CSS in any AMP document must be included in a <style amp-custom> tag within the header. Inline style attributes are not allowed in AMP.

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

Note: The entire <style> tag cannot exceed 50,000 bytes. The validator will check for this.


### Allowed CSS properties and selectors

For a  comprehensive list of CSS properties and values that are allowed within email messages, see [Gmail Supported CSS Properties & Media Queries](https://developers.google.com/gmail/design/reference/supported_css).

## Document dimensions

* **Optimal width**: 800px or less (any wider and things will get cut off).

* **Height**: variable, the client allows the user to scroll through the content.

# Validation tools

To ensure your email messages meet the strict criteria for the AMP for Email format, validate your content with one of the following tools:

## Web-based validator

A web-based validator is available at [https://validator.ampproject.org/](https://validator.ampproject.org/)

Simply paste in the AMP HTML to ensure the document meets all the AMP for Email restrictions. This tool shows you the validation errors directly inline.

## Command-line validator

A command-line validation tool is also available for validating your AMP for Email document.

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

# Examples

This section provides some AMP for Email code examples.

## Basic usage of `<amp-list>`

The following is a fictional email that includes an updated list of featured products retrieved from an endpoint. This example shows the basic usage of [`<amp-list>`](https://www.ampproject.org/docs/reference/components/amp-list).

```html
<!doctype html>
<html ⚡4email>
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-list" src="https://cdn.ampproject.org/v0/amp-list-0.1.js"></script>
  <script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.1.js"></script>
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

## Basic usage of `<amp-bind>`

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

# Adding AMP to existing emails

Email is structured as a [MIME tree](https://en.wikipedia.org/wiki/MIME). This MIME tree contains the message body and any attachments to the email.

Embedding AMP within an email is simple, add a new MIME part with a content type of text/x-amp-html as a descendant of multipart/alternative. It should live alongside the existing text/html or text/plain parts. This ensures that the email message works on all clients.

It is important to note that the text/x-amp-html part must be nested under a multipart/alternative node, it will not be recognized by the email client otherwise. See the following example:

```
From:  Person A <persona@gmail.com>
To: Person B <personb@gmail.com>
Subject: An AMP email!
Content-Type: multipart/alternative; boundary="001a114634ac3555ae05525685ae"

--001a114634ac3555ae05525685ae
Content-Type: text/plain; charset="UTF-8"; format=flowed; delsp=yes

Hello World in plain text!

--001a114634ac3555ae05525685ae
Content-Type: text/html; charset="UTF-8"

<span>Hello World in HTML!</span>
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
```


# Replying/forwarding semantics

To start, the email client strips out the `text/x-amp-html` part of the MIME tree when a user replies to or forwards an AMP email message. This is why it is important that an email provide alternative content in the HTML part.

# Authentication

There is no authentication for outgoing XHR calls from AMP email messages.  Every XHR request is considered anonymous. Email senders should not rely on cookies to authenticate outgoing XHR requests from emails.

Note: There is also no plan to include things like OAuth tokens to authenticate a user to a request.

# Feedback & Support

For support and feedback on AMP4Email, please use the following channels:

[https://github.com/ampproject/amphtml/blob/master/CONTRIBUTING.md#ongoing-participation](https://github.com/ampproject/amphtml/blob/master/CONTRIBUTING.md#ongoing-participation)
