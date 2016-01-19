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

### <a name="amp-access"></a>`amp-access`

#Background

AMP Access or “AMP paywall and subscription support” provides control to publishers over what content can be accessed by a reader and with what restrictions,  based on the reader’s subscription status, number of views and so on.

#Solution
The proposed solution gives control to the Publisher over the following decisions and flows:
 - Create and maintain users
 - Control of metering
 - Responsibility for the login flow
 - Responsibility for authenticating the user
 - Responsibility for access rules and authorization
 - Flexibility over access parameters at a per-document level

The solution comprises the following components:
 1. [**AMP Reader ID**][2]: provided by AMP ecosystem, this is a unique identifier of the reader as seen by AMP.
 2. [**Access Content Markup**][3]: authored by the Publisher, defines which parts of a document are visible in which circumstances.
 3. [**Authorization endpoint**][4]: provided by the Publisher, returns the response that explains which part of a document the Reader can consume.
 4. [**Pingback endpoint**][5]: provided by the Publisher, is used to send the “view” impression for a document.
 5. [**Login Link and Login Page**][6]: allows the publisher to authenticate the Reader and connect their identity with AMP Reader ID.

AMP Cache returns the document to the Reader with some sections obscured using Access Content Markup. The AMP Runtime calls the Authorization endpoint and uses the response to either hide or show different sections as defined by the Access Content Markup. After the document has been shown to the Reader, AMP Runtime calls the Pingback endpoint that can be used by the Publisher to update the countdown meter.

The solution also allows the Publisher to place in the AMP document  a Login Link that launches the Login/Subscribe Page where the Publisher can authenticate the Reader and associate the Reader’s identity in their system with the AMP Reader ID.

In its basic form, this solution sends the complete (though obscured) document to the Reader and simply shows/hides restricted sections based on the Authorization response. However, the solution also provides the “server” option, where the restricted sections can be excluded from the initial document delivery and downloaded only after the authorization has been confirmed.

Supporting AMP Access requires Publisher to implement the components described above. Access Content Markup, Authorization endpoint, Pingback endpoint and Login Page are required.
##AMP Reader ID
To assist access services and use cases, AMP Access introduces the concept of the *Reader ID*.

The Reader ID is an anonymous and unique ID created by the AMP ecosystem. It is unique for each reader/publisher pair. i.e., a Reader is identified differently to two different publishers. It is a non-reversible ID. The Reader ID is included in all AMP/Publisher communications. Publishers can use the Reader ID to identify the Reader and map it to their own identity systems.

The Reader ID is constructed on the user device and intended to be long-lived. However, it follows the normal browser storage rules, including those for incognito windows. The intended lifecycle of a Reader ID is 1 year between uses or until the user clears their cookies. The Reader IDs are not currently shared between devices.

The Reader ID is constructed similar to the mechanism used to build ExternalCID described [here](https://docs.google.com/document/d/1f7z3X2GM_ASb3ZCI_7tngglxwS6WoWi1EB3aKzdf6vo/edit#heading=h.hyyaxi8m42a).

##Access Content Markup

Access Content Markup determines which sections are visible or hidden based on the authorization response returned from the Authorization endpoint. It is described via special markup attributes.

##Authorization Endpoint

Authorization is an endpoint provided by the publisher and called by AMP Runtime or AMP Cache. It is a credentialed CORS endpoint. This endpoint returns the access parameters that can be used by the Content Markup to hide or show different parts of the document.

##Pingback Endpoint

Pingback is an endpoint provided by the publisher and called by AMP Runtime or AMP Cache. It is a credentialed CORS endpoint. AMP Runtime calls this endpoint automatically when the Reader has started viewing the document. On of the main goals of the Pingback is for the Publisher to update metering information.

##Login Page and Login Link
Login Page is implemented and served by the Publisher and called by the AMP Runtime. It is normally shown as a browser dialog.

Login Page is triggered when the Reader taps on the Login Link which can be placed by the Publisher anywhere in the document.

#Specification v0.1
##Configuration

All of the endpoints are configured in the AMP document as a JSON object in the HEAD of the document:

```html
<script id="amp-access" type="application/json">
{
  "property": value,
  ...
}
</script>
```

The following properties are defined in this configuration:

Property      | Values               | Description
------------- | -------------------- |---------------------------------
authorization | &lt;URL&gt;          | The HTTPS URL for the Authorization endpoint.
pingback      | &lt;URL&gt;          | The HTTPS URL for the Pingback endpoint.
login         | &lt;URL&gt;          | The HTTPS URL for the Login Page.
type          | "client" or "server" | Default is “client”. The "server" option is under design discussion and these docs will be updated when it is ready.

*&lt;URL&gt;* values specify HTTPS URLs with substitution variables. The substitution variables are covered in more detail in the [Access URL Variables][7] section below.

Here’s an example of the AMP Access configuration:

```html
<script id="amp-access" type="application/json">
{
  "authorization":
      "https://pub.com/amp-access?rid={READER_ID}&url={AMPDOC_URL}",
  "pingback":
      "https://pub.com/amp-ping?rid={READER_ID}&url={AMPDOC_URL}",
  "login":
      "https://pub.com/amp-login?rid={READER_ID}&url={AMPDOC_URL}"
}
</script>
```
##Access URL Variables

When configuring the URLs for various endpoints, the Publisher can use substitution variables. These variables are a subset of the variables defined in the [AMP Var Spec](https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md). The set of allowed variables is defined in the table below:

Var               | Description
----------------- | -----------
READER_ID         | The AMP Reader ID.
AUTHDATA(field)   | The value of the field in the authorization response.
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

AUTHDATA variable is availbale to Pingback and Login URLs. It allows passing any field in the authorization
response as an URL parameter. E.g. `AUTHDATA(isSubscriber)`.

##Access Content Markup

Access Content Markup describes which sections are visible or hidden. It is comprised of two AMP attributes: ```amp-access``` and ```amp-access-hide``` that can be placed on any HTML element.

The ```amp-access``` attribute provides the expression that yields true or false based on the authorization response returned by the Authorization endpoint. The resulting value indicates whether or not the element and its contents are visible.

The ```amp-access``` value is a boolean expression defined in a SQL-like language. The grammar is defined in the [Appendix A][1]. It is defined as following:
```html
<div amp-access="expression">...</div>
```
Properties and values refer to the properties and values of the Authorization response returned by the Authorization endpoint. This provides a flexible system to support different access scenarios.

The ```amp-access-hide``` attribute can be used to optimistically hide the element before the Authorization response has been received, which can show it. It provides the semantics of “invisible by default”. The authorization response returned by the Authorization later may rescind this default and make section visible. When ```amp-access-hide``` attribute is omitted, the section will be shown/included by default. The ```amp-access-hide``` attribute can only be used in conjunction with the ```amp-access``` attribute.
```html
<div amp-access="expression" amp-access-hide>...</div>
```
We can extend the set of ```amp-access-*``` attributes as needed to support different obfuscation and rendering needs.

Here’s an example that shows either login link or the complete content based on the subscription status:
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
Here:
 - *subscriber* is a boolean field in the authorization response returned by the Authorization endpoint. This section is hidden by default, which is optional.
 - This example elects to show full content optimistically.

Here’s another example that shows the disclaimer to the reader about the state of metering:
```html
<section amp-access="views <= maxViews">
  <template type="amp-mustache">
    You are reading article {{views}} out of {{maxViews}}.
  </template>
</section>
```
And here’s an example that shows additional content to the premium subscribers:
```html
<section amp-access="subscriptonType = 'premium'">
  Shhh… No one but you can read this content.
</section>
```
##Authorization Endpoint

Authorization is configured via ```authorization``` property in the [AMP Access Configuration][8] section. It is a credentialed CORS endpoint. See [CORS Origin Security][9] for a list of origins that should be allowed.

Authorization can take any parameters as defined in the [Access URL Variables][7] section. For instance, it could pass AMP Reader ID and document URL. Besides URL parameters, the Publisher may use any information naturally delivered via HTTP protocol, such as Reader’s IP address.

This endpoint produces the authorization response that can be used in the content markup expressions to show/hide different parts of content.

The request format is:
```
https://publisher.com/amp-access.json?
   rid={READER_ID}
  &url={AMPDOC_URL}
```
The response is a free-form JSON object: it can contain any properties and values with few limitations. The limitations are:
 - The property names have to conform to the restrictions defined by the ```amp-access``` expressions grammar (see [Appendix A][1]. This mostly means that the property names cannot contain characters such as spaces, dashes and other characters that do not conform to the “amp-access” specification.
 - The property values can only be one of the types: string, number or boolean.
 - The total size of the serialized authorization response cannot exceed 500 bytes.
 - Please ensure that the response does not include any personally identifiable information (PII) or personal data.

Here’s a small list of possible ideas for properties that can be returned from the Authorization endpoint:
 - Metering info: maximum allowed number of views and current number of views.
 - Whether the Reader is logged in or a subscriber.
 - A more detailed type of the subscription: basic, premium
 - Geo: country, region, custom publication region

Here’s an example of the response when the Reader is not a subscriber and is metered at 10 articles/month and has viewed 6 articles already:
```json
{
  "maxViews": 10,
  "currentViews": 6,
  "subscriber": false
}
```
Here’s an example of the response when the Reader is logged in and has a premium subscription type:
```json
{
  "loggedIn": true,
  "subscriptionType": "premium"
}
```
This RPC may be called in the prerendering phase and thus it should not be used for meter countdown, since the Reader may never actually see the document.

Another important consideration is that in some cases AMP runtime may need to call Authorization endpoint multiple times per document impression. This can happen when AMP Runtime believes that the access parameters for the Reader have changed significantly, e.g. after a successful Login Flow.

The authorization response may be used by AMP Runtime and extensions for two different purposes:
 1. When evaluating ```amp-access``` expressions
 2. When evaluating ```<template>``` templates such as ```amp-mustache```

Authorization endpoint is called by AMP Runtime as a credentialed CORS endpoint. As such, it must implement CORS protocol. It should use CORS Origin to restrict the access to this service. This endpoint may use publisher cookies for its needs. For instance, it can associate the binding between the Reader ID and the Publisher’s own user identity. AMP itself does not need to know about this (and prefers not to).

AMP Runtime (or rather browser) observes cache response headers when calling Authorization endpoint. Thus the cached responses can be reused. It may or may not be desirable. If it is not desirable, the Publisher can user the appropriate cache control headers and/or RANDOM variable substitution for the endpoint URL.

In the *server* option, the call to Authorization endpoint is done by AMP Cache as a simple HTTPS endpoint. This means that the Publisher’s cookies cannot be delivered in this case.

##Pingback Endpoint

Pingback is configured via ```pingback``` property in the [AMP Access Configuration][8] section. It is a credentialed CORS endpoint. See [CORS Origin Security][9]” for a list of origins that should be allowed.

Pingback URL can take any parameters as defined in the [Access URL Variables][7] section. For instance, it could pass AMP Reader ID and document URL.

Pingback does not produce a response - any response is ignored by AMP runtime.

The publisher may choose to use the pingback as:
 - One of the main purposes for pingback is to count down meter when it is used.
 - As a credentialed CORS endpoint it may contain publisher cookies. Thus it can be used to map AMP Reader ID to the Publisher’s identity.

The request format is:
```
https://publisher.com/amp-pingback?
   rid={READER_ID}
  &url={AMPDOC_URL}
```
##Login Link
The Publisher may choose to place the Login Link anywhere in the content of the document.

Login Link is configured via “login” property in the [AMP Access Configuration][8] section.

Login Link can be declared on any HTML element that allows “on” attribute, most typically it’d be an anchor or a button element.

The format is:
```html
<a on="tap:amp-access.login">Login or subscribe</a>
```
AMP makes no distinction between login or subscribe. This distinction can be made on the Publisher’s side.

##Login Page
The link to the Login Page is configured via the ```login``` property in the [AMP Access Configuration][8] section.

The link can take any parameters as defined in the [Access URL Variables][7] section. For instance, it could pass AMP Reader ID and document URL.

Login Page is simply a normal Web page with no special constraints, other than it should function well as a [browser dialog](https://developer.mozilla.org/en-US/docs/Web/API/Window/open). See the “Login Flow” section for more details.

The request format is:
```
https://publisher.com/amp-login.html?
   rid={READER_ID}
  &url={AMPDOC_URL}
  &return=<return-url>
```
Notice that the “return” URL parameter is added by the AMP Runtime automatically. Once Login Page completes its work, it must redirect back to the specified “Return URL” with the following format:
```
<return-url>#status=true|false
```
Notice the use of a URL hash parameter “status”. The value is either “true” or “false” depending on whether the login succeeds or is abandoned. Ideally the Login Page, when possible, will send the signal in cases of both success or failure.

If Return URL is not specified, the Login Page must redirect to the Document URL.

#CORS Origin Security
CORS endpoints can be (and recommended) to be only allowed to the following origins:
 - *.ampproject.org
 - The Publisher’s own origins

#AMP Glossary
 - **AMP Document** - the HTML document that follows AMP format and validated by AMP Validator. AMP Documents are cacheable by AMP Cache.
 - **AMP Validator** - the computer program that performs a static analysis of an HTML document and returns success or failure depending on whether the document conforms to the AMP format.
 - **AMP Runtime** - the JavaScript runtime that executes AMP Document.
 - **AMP Cache** - the proxying cache for AMP documents.
 - **AMP Viewer** - the Web or native application that displays/embeds AMP Documents.
 - **Publisher.com** - the site of an AMP publisher.
 - **CORS endpoint** - cross-origin HTTPS endpoint. See https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS for more info. See [CORS Origin Security][9] for a list of origins that should be allowed.
 - **Reader** - the actual person viewing AMP documents.
 - **AMP Prerendering** - AMP Viewers may take advantage of prerendering, which renders a hidden document before it can be shown. This adds a significant performance boost. But it is important to take into account the fact that the document prerendering does not constitute a view since the Reader may never actually see the document.

#Appendix A: “amp-access” expression grammar
Non-normative grammar is shown below:
```
EXPR ::= TERM | EXPR "OR" TERM
TERM ::= LITERAL | FACTOR | TERM "AND" FACTOR
FACTOR ::= [NOT] TEST
TEST ::= PREDICATE | PAREN_EXPR
PREDICATE ::= PROPERTY OP VALUE
PAREN_EXPR ::= "(" EXPR ")"
OP ::= "=" | "!="
PROPERTY ::= [a-zA-Z][a-zA-Z0-9\_\-]*
VALUE ::= QUOTE [a-zA-Z0-9\_\-]* QUOTE
```

Notice that ```amp-access``` expressions are evaluated by the AMP Runtime and AMP Cache. This is NOT part of the specification that the Publisher needs to implement. It is here simply for informational properties.

#Detailed Discussion
This section will cover a detailed explanation of the design underlying the amp-access spec, and clarify design choices. Coming soon

[1]: #appendix-a-amp-access-expression-grammar
[2]: #amp-reader-id
[3]: #access-content-markup
[4]: #authorization-endpoint
[5]: #pingback-endpoint
[6]: #login-page-and-login-link
[7]: #access-url-variables
[8]: #configuration
[9]: #cors-origin-security
