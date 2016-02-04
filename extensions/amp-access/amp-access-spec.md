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

**This extension is under active development, and the version number of the specification section should provide guidance to its evolution.**

### <a name="amp-access-spec"></a>AMP Access Spec

#Background

AMP Access or “AMP paywall and subscription support” gives publishers control over which content can be accessed by a reader and with what restrictions, based on the reader’s subscription status, number of views, and other factors.

#Solution

The proposed solution gives control to the publisher over the following decisions and flows:

 - User creation and maintenance
 - Control of metering
 - Responsibility for the login flow
 - Responsibility for authenticating the user
 - Responsibility for access rules and authorization
 - Flexibility over access parameters at a per-document level

The solution comprises the following components:

 1. [**AMP Reader ID**][2]: provided by the AMP system, a unique identifier of the reader as seen by AMP.
 2. [**Access Content Markup**][3]: authored by the publisher, defines which parts of a document are visible in which circumstances.
 3. [**Authorization endpoint**][4]: provided by the publisher, returns the response that explains which part of a document the reader can consume.
 4. [**Pingback endpoint**][5]: provided by the publisher, used to send the “view” impression for a document.
 5. [**Login Link and Login Page**][6]: allows the publisher to authenticate the reader and connect their identity with an AMP Reader ID.

AMP Cache returns the document to the reader with some sections obscured using Access Content Markup. The AMP Runtime calls the Authorization endpoint and uses the response to either show/hide content as defined by the Access Content Markup. After the document has been shown to the reader, AMP Runtime calls the Pingback endpoint that can be used by the publisher to update the countdown meter.

The solution also allows the publisher to place in the AMP document a Login Link that launches the Login/Subscribe Page, where the publisher can authenticate the reader and associate the reader’s identity in their system with the AMP Reader ID.

In its basic form, this solution sends the complete (though obscured) document to the reader and simply shows/hides restricted sections based on the Authorization response. However, the solution also provides the “server” option, where the restricted sections can be excluded from the initial document delivery and downloaded only after the authorization has been confirmed.

Supporting AMP Access requires the publisher to implement the components described above. Access Content Markup, Authorization endpoint, Pingback endpoint, and Login Page are required.

##AMP Reader ID
To assist access services and use cases, AMP Access introduces the concept of the *Reader ID*.

The Reader ID is an anonymous and unique ID created by the AMP system. It is unique for each reader/publisher pair; that is, the same reader is identified differently to two different publishers. It is a non-reversible ID. The Reader ID is included in all AMP/publisher communications. Publishers can use the Reader ID to identify readers and map them to their own identity systems.

The Reader ID is constructed on the user device and is intended to be long-lived. However, it follows the normal browser storage rules, including those for incognito windows. The intended lifecycle of a Reader ID is one year between uses or until the user clears their cookies. The Reader IDs are not currently shared between devices.

The Reader ID is constructed similar to the mechanism used to build ExternalCID described [here](https://docs.google.com/document/d/1f7z3X2GM_ASb3ZCI_7tngglxwS6WoWi1EB3aKzdf6vo/edit#heading=h.hyyaxi8m42a).

##AMP Access and Cookies

Even though some of the Publisher's own authentication cookies may be available at the time of the Authorization and Pingback requests, the cookies should only be used for internal mapping. There are no guarantees that the Publisher will be able to read or write cookies given all surfaces and platforms where an AMP document can be embedded. The Reader ID is the only identifier that is guaranteed to work.

This means, in particular, that features such as metering and first-click-free implementation have to rely on the AMP Reader ID and server-side storage.

##Access Content Markup

Access Content Markup determines which sections are visible or hidden based on the authorization response returned from the Authorization endpoint. It is described via special markup attributes.

##Authorization Endpoint

Authorization endpoint is provided by the publisher and called by AMP Runtime or AMP Cache. It is a credentialed CORS endpoint. This endpoint returns the access parameters that can be used by the Content Markup to hide or show different parts of the document.

##Pingback Endpoint

Pingback endpoint is provided by the publisher and called by AMP Runtime or AMP Cache. It is a credentialed CORS endpoint. AMP Runtime calls this endpoint automatically when the reader has started viewing the document. One of the main goals of the Pingback is for the publisher to update metering information.

##Login Page and Login Link

Login Page is implemented and served by the publisher and called by the AMP Runtime. It is normally shown as a browser dialog, and is triggered when the reader taps the Login Link, which can be placed by the publisher anywhere in the document.

#Specification v0.3

##Configuration

All of the endpoints are configured in the AMP document as a JSON object in the head of the document:

```html
<script id="amp-access" type="application/json">
{
  "property": value,
  ...
}
</script>
```

The following properties are defined in this configuration:

| Property      | Values               | Description |
| ------------- | -------------------- |--------------------------------- |
| authorization | &lt;URL&gt;          | The HTTPS URL for the Authorization endpoint. |
| pingback      | &lt;URL&gt;          | The HTTPS URL for the Pingback endpoint. |
| login         | &lt;URL&gt;          | The HTTPS URL for the Login Page. |
| type          | "client" or "server" | Default is “client”. The "server" option is under design discussion and these docs will be updated when it is ready. |

*&lt;URL&gt;* values specify HTTPS URLs with substitution variables. The substitution variables are covered in more detail in the [Access URL Variables][7] section below.

Here’s an example of the AMP Access configuration:

```html
<script id="amp-access" type="application/json">
{
  "authorization":
      "https://pub.com/amp-access?rid={READER_ID}&url={SOURCE_URL}",
  "pingback":
      "https://pub.com/amp-ping?rid={READER_ID}&url={SOURCE_URL}",
  "login":
      "https://pub.com/amp-login?rid={READER_ID}&url={SOURCE_URL}"
}
</script>
```

##Access URL Variables

When configuring the URLs for various endpoints, the Publisher can use substitution variables. These variables are a subset of the variables defined in the [AMP Var Spec](https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md). The set of allowed variables is defined below.

Var               | Description
----------------- | -----------
READER_ID         | The AMP Reader ID.
AUTHDATA(field)   | The value of the field in the authorization response.
RETURN_URL        | The placeholder for the return URL specified by the AMP runtime for a Login Dialog to return to.
SOURCE_URL        | The Source URL of this AMP Document. If document is served from CDN, AMPDOC_URL will be a CDN URL, while SOURCE_URL will be the original source URL.
AMPDOC_URL        | The URL of this AMP Document.
CANONICAL_URL     | The canonical URL of this AMP Document.
DOCUMENT_REFERRER | The Referrer URL.
VIEWER            | The URL of the AMP Viewer.
RANDOM            | A random number. Helpful to avoid browser cache.

Here’s an example of the URL extended with Reader ID, Canonical URL, Referrer information and random cachebuster:
```
https://pub.com/access?
   rid={READER_ID}
  &url={CANONICAL_URL}
  &ref={DOCUMENT_REFERRER}
  &_={RANDOM}
```

The AUTHDATA variable is availbale to Pingback and Login URLs. It allows passing any field in the authorization
response as a URL parameter, e.g., `AUTHDATA(isSubscriber)`.

##Access Content Markup

Access Content Markup describes which sections are visible or hidden. It comprises two AMP attributes, `amp-access` and `amp-access-hide`, that can be placed on any HTML element.

The `amp-access` attribute provides the expression that yields true or false based on the authorization response returned by the Authorization endpoint. The resulting value indicates whether the element and its contents are visible.

The `amp-access` value is a boolean expression defined in an SQL-like language. The grammar is defined in [Appendix A][1]. It is defined like this:
```html
<div amp-access="expression">...</div>
```
Properties and values refer to the properties and values of the Authorization response returned by the Authorization endpoint. This provides a flexible system to support different access scenarios.

The `amp-access-hide` attribute can be used to optimistically hide the element before the Authorization response has been received, which can show it. It provides the semantics of “invisible by default”. The authorization response returned by the Authorization later may rescind this default and make the section visible. When the `amp-access-hide` attribute is omitted, the section will be shown/included by default. The `amp-access-hide` attribute can only be used in conjunction with the `amp-access` attribute.
```html
<div amp-access="expression" amp-access-hide>...</div>
```
We can extend the set of `amp-access-*` attributes as needed to support different obfuscation and rendering needs.

Here’s an example that shows either just the Login Link or the complete content based on the subscription status:
```html
<header>
  Title of the document
</header>

<div>
  First snippet in the document.
</div>

<div amp-access="NOT subscriber" amp-access-hide>
  <a on="tap:amp-access.login">Become a subscriber now!</a>
</div>

<div amp-access="subscriber">
  Full content.
</div>
```
Where:

 - *subscriber* is a boolean field in the authorization response returned by the Authorization endpoint. This section is hidden by default, which is optional.
 - This example elects to show full content optimistically.

Here’s another example that shows a disclaimer to the reader about the state of metering:
```html
<section amp-access="views <= maxViews">
  <template type="amp-mustache">
    You are reading article {{views}} out of {{maxViews}}.
  </template>
</section>
```

And here’s an example that shows additional content to premium subscribers:
```html
<section amp-access="subscriptonType = 'premium'">
  Shhh… No one but you can read this content.
</section>
```

##Authorization Endpoint

Authorization is configured via the `authorization` property in the [AMP Access Configuration][8] section. It is a credentialed CORS endpoint. See [CORS Origin Security][9] for a list of origins that should be allowed.

Authorization can take any parameters as defined in the [Access URL Variables][7] section. For instance, it could pass AMP Reader ID and document URL. Besides URL parameters, the publisher may use any information naturally delivered via HTTP protocol, such as a reader’s IP address.

This endpoint produces the authorization response that can be used in the content markup expressions to show/hide different parts of content.

The request format is:
```
https://publisher.com/amp-access.json?
   rid={READER_ID}
  &url={SOURCE_URL}
```
The response is a free-form JSON object; it can contain any properties and values with few limitations. The limitations are:

 - The property names have to conform to the restrictions defined by the `amp-access` expressions grammar (see [Appendix A][1]. This mostly means that the property names cannot contain characters such as spaces, dashes, and other characters that do not conform to the `amp-access` specification.
 - The property values can only be one of these types: string, number, or boolean.
 - The total size of the serialized authorization response cannot exceed 500 bytes.
 - Please ensure that the response does not include any personally identifiable information (PII) or personal data.

Here’s a small list of possible ideas for properties that can be returned from the Authorization endpoint:

 - Metering info: maximum allowed number of views and current number of views.
 - Whether the reader is logged in or a subscriber.
 - A more detailed type of the subscription: basic, premium
 - Geo: country, region, custom publication region

Here’s an example of the response when the reader is not a subscriber and is metered at 10 articles/month and has viewed six articles already:
```json
{
  "maxViews": 10,
  "currentViews": 6,
  "subscriber": false
}
```
Here’s an example of the response when the reader is logged in and has a premium subscription type:
```json
{
  "loggedIn": true,
  "subscriptionType": "premium"
}
```
This RPC may be called in the prerendering phase and thus should not be used for meter countdown, as the reader may never actually see the document.

Another important consideration is that in some cases AMP Runtime may need to call the Authorization endpoint multiple times per document impression. This can happen when AMP Runtime believes that the access parameters for the reader have changed significantly, such as after a successful Login Flow.

The authorization response may be used by AMP Runtime and extensions for two different purposes:

 1. When evaluating `amp-access` expressions.
 2. When evaluating `<template>` templates such as `amp-mustache`.

Authorization endpoint is called by AMP Runtime as a credentialed CORS endpoint. As such, it must implement CORS protocol. It should use CORS Origin and source origin to restrict the access to this service as described in the [CORS Origin Security][9]. This endpoint may use publisher cookies for its needs. For instance, it can associate the binding between the Reader ID and the Publisher’s own user identity. AMP itself does not need to know about this (and prefers not to). Reader more on [AMP Reader ID][2] and [AMP Access and Cookies][11] for more detail.

AMP Runtime (or rather browser) observes cache response headers when calling Authorization endpoint. Thus the cached responses can be reused, which may or may not be desirable. If it is not desirable, the publisher can use the appropriate cache control headers and/or RANDOM variable substitution for the endpoint URL.

AMP Runtime uses the following CSS classes during the authorization flow:

 1. `amp-access-loading` CSS class is set on the document root when the authorization flow starts and removed when it completes or fails.
 2. `amp-access-error` CSS class is set on the document root when the authorization flow fails.

In the *server* option, the call to Authorization endpoint is done by AMP Cache as a simple HTTPS endpoint. This means that the publisher’s cookies cannot be delivered in this case.

##Pingback Endpoint

Pingback is configured via the `pingback` property in the [AMP Access Configuration][8] section. It is a credentialed CORS endpoint. See [CORS Origin Security][9] for a list of origins that should be allowed.

Pingback URL can take any parameters as defined in the [Access URL Variables][7] section. For instance, it could pass AMP Reader ID and document URL. The inclusion of the `READER_ID` is required.

Pingback does not produce a response; any response is ignored by AMP runtime.

The publisher may choose to use the pingback in various ways:

 - One of the main purposes for pingback is to count down meter when it is used.
 - As a credentialed CORS endpoint it may contain publisher cookies. Thus it can be used to map AMP Reader ID to the publisher’s identity.

The request format is:
```
https://publisher.com/amp-pingback?
   rid={READER_ID}
  &url={SOURCE_URL}
```

##Login Link

The publisher may choose to place the Login Link anywhere in the content of the document. Login Link is configured via the “login” property in the [AMP Access Configuration][8] section. Login Link can be declared on any HTML element that allows the “on” attribute, typically an anchor or a button element.

The format is:
```html
<a on="tap:amp-access.login">Login or subscribe</a>
```
AMP makes no distinction between login or subscribe. This distinction can be made on the publisher’s side.

##Login Page

The link to the Login Page is configured via the `login` property in the [AMP Access Configuration][8] section.

The link can take any parameters as defined in the [Access URL Variables][7] section. For instance, it could pass AMP Reader ID and document URL. `RETURN_URL` query substitution can be used to specify a query parameter for the return URL, e.g.,  `?ret=RETURN_URL`. The return URL is required and if the `RETURN_URL` substitution is not specified, it will be injected automatically with the default query parameter name of "return".

Login Page is simply a normal web page with no special constraints, other than it should function well as a [browser dialog](https://developer.mozilla.org/en-US/docs/Web/API/Window/open). See the “Login Flow” section for more details.

The request format is:
```
https://publisher.com/amp-login.html?
   rid={READER_ID}
  &url={SOURCE_URL}
  &return={RETURN_URL}
```
Note that, as stated above, the “return” URL parameter is added by the AMP Runtime automatically if `RETURN_URL` substitution is not specified. Once Login Page completes its work, it must redirect back to the specified “Return URL” with the following format:
```
RETURN_URL#status=true|false
```
Notice the use of a URL hash parameter `status`. The value is either `true` or `false` depending on whether the login succeeds or is abandoned. Ideally the Login Page, when possible, will send the signal in cases of both success or failure.

#Integration with *amp-analytics*

An integration with *amp-analytics* is under development and can be tracked on [Issue #1556][10]. This document will be updated when more details on the integration are available.

#CORS Origin Security

Authorization and Pingback endpoints are CORS endpoints and they must implement the security protocol described in the
[AMP CORS Security Spec](https://github.com/ampproject/amphtml/blob/master/spec/amp-cors-requests.md#cors-security-in-amp).

#AMP Glossary

 - **AMP Document** - the HTML document that follows AMP format and validated by AMP Validator. AMP Documents are cacheable by AMP Cache.
 - **AMP Validator** - the computer program that performs a static analysis of an HTML document and returns success or failure depending on whether the document conforms to the AMP format.
 - **AMP Runtime** - the JavaScript runtime that executes AMP Document.
 - **AMP Cache** - the proxying cache for AMP documents.
 - **AMP Viewer** - the web or native application that displays/embeds AMP Documents.
 - **Publisher.com** - the site of an AMP publisher.
 - **CORS endpoint** - cross-origin HTTPS endpoint. See [this page](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) for more info. See [CORS Origin Security][9] for a list of origins that should be allowed.
 - **Reader** - the actual person viewing AMP documents.
 - **AMP Prerendering** - AMP Viewers may take advantage of prerendering, which renders a hidden document before it can be shown. This adds a significant performance boost, but be aware that document prerendering does not constitute a view, as the reader may never actually see the document.

#Revisions

- Feb 1: "return" query parameter for Login Page can be customized using RETURN_URL URL substitution.
- Feb 3: Spec for "source origin" security added to the [CORS Origin security][9].

#Appendix A: “amp-access” expression grammar

The most recent BNF grammar is available in [access-expr-impl.jison](./0.1/access-expr-impl.jison) file.

The key excerpt of this grammar is:
```
search_condition:
    search_condition OR search_condition
  | search_condition AND search_condition
  | NOT search_condition
  | '(' search_condition ')'
  | predicate

predicate:
    comparison_predicate | truthy_predicate

comparison_predicate:
    scalar_exp '=' scalar_exp
  | scalar_exp '!=' scalar_exp
  | scalar_exp '<' scalar_exp
  | scalar_exp '<=' scalar_exp
  | scalar_exp '>' scalar_exp
  | scalar_exp '>=' scalar_exp

truthy_predicate: scalar_exp

scalar_exp: literal | field_ref

literal: STRING | NUMERIC | TRUE | FALSE | NULL
```

Notice that `amp-access` expressions are evaluated by the AMP Runtime and AMP Cache. This is **not** part of the specification that the publisher needs to implement. It is here simply for informational purposes.

#Detailed Discussion

This section will cover a detailed explanation of the design underlying the amp-access spec, and clarify design choices. Coming soon.

[1]: #appendix-a-amp-access-expression-grammar
[2]: #amp-reader-id
[3]: #access-content-markup
[4]: #authorization-endpoint
[5]: #pingback-endpoint
[6]: #login-page-and-login-link
[7]: #access-url-variables
[8]: #configuration
[9]: #cors-origin-security
[10]: https://github.com/ampproject/amphtml/issues/1556
[11]: #amp-access-and-cookies
