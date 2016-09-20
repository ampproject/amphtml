<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# <a name="`amp-form`"></a> `amp-form`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Allow usage of <code>form</code> and <code>input</code> tags.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/forms.amp.html">forms.amp.html</a></td>
  </tr>
</table>

## Behavior

The `amp-form` extension allows the usage of forms and input fields in an AMP document. The extension allows polyfilling
some of the missing behaviors in browsers.

The `amp-form` extension **MUST** be loaded if you're using `<form>` or any input tags, otherwise your document will be invalid!

Example:
```html
<form method="post" action="https://example.com/subscribe" target="_blank">
    <fieldset>
        <label>
            <span>Your name</span>
            <input type="text" name="name" required>
        </label>
        <label>
            <span>Your email</span>
            <input type="email" name="email" required>
        </label>
        <input type="submit" value="Subscribe">
    </fieldset>
</form>
```

## Attributes

**target**
__required__

Target attribute of the `<form>` must be either `_blank` or `_top`.

**action**
__required__

Action must be provided, `https` and is non-cdn link (does **NOT** link to https://cdn.ampproject.org).

__Note__: `target` and `action` will only be used for non-xhr GET requests. AMP runtime will use `action-xhr` to make the request and will ignore `action` and `target`. When `action-xhr` is not provided AMP would make a GET request to `action` endpoint and use `target` to open a new window (if `_blank`). AMP runtime might also fallback to using action and target in cases where `amp-form` extension fails to load.

**action-xhr**
__(optional)__ for `GET` __required__ for `POST` requests 
You can also provide an action-xhr attribute, if provided, the form will be submitted in an XHR fashion.

This attribute can be the same or a different endpoint than `action` and has the same action requirements above.


**Important**: See [Security Considerations](#security-considerations) for notes on how to secure your forms endpoints.

All other [form attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) are optional.

## Inputs
Currently, `<input type=button>`, `<input type=file>`, `<input type=image>` and `<input type=password>` are not allowed. (This might be reconsidered in the future - please let us know if you require these and use cases).

## Events
`amp-form` exposes 3 events:

* **submit**
Emitted whenever the form is submitted and before the submission is complete.

* **submit-success**
Emitted whenever the form submission is done and response is a success.

* **submit-error**
Emitted whenever the form submission is done and response is an error.

These events can be used through the [`on` attribute](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#on).
For example, the following listens to both `submit-success` and `submit-error` and shows different lightboxes depending on the event.

```html
<form ... on="submit-success:success-lightbox;submit-error:error-lightbox" ...>
</form>
```

See the [full example here](https://github.com/ampproject/amphtml/blob/master/examples/forms.amp.html).

## Success/Error Response Rendering
`amp-form` allows publishers to render the responses using [Extended Templates](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#extended-templates).

Using `submit-success` and `submit-error` special marker attributes, publishers can mark any **child element of form** and include a `<template></template>` tag inside it to render the response in it.

The response is expected to be a valid JSON Object. For example, if the publisher's `action-xhr` endpoint returns the following responses:

**Success Response**
```json
{
  "name": "Jane Miller",
  "interests": [{"name": "Basketball"}, {"name": "Swimming"}, {"name": "Reading"}],
  "email": "email@example.com"
}
```

**Error Response**
```json
{
  "name": "Jane Miller",
  "message": "The email (email@example.com) you used is already subscribed."
}
```

Publishers can render these in a template inside their forms as follows.

```html
<form ...>
    <fieldset>
      ...
    </fieldset>
    <div submit-success>
        <template type="amp-mustache">
            Success! Thanks {{name}} for subscribing! Please make sure to check your email {{email}}
            to confirm! After that we'll start sending you weekly articles on {{#interests}}<b>{{name}}</b> {{/interests}}.
        </template>
    </div>
    <div submit-error>
        <template type="amp-mustache">
            Oops! {{name}}, {{message}}.
        </template>
    </div>
</form>
```

See the [full example here](https://github.com/ampproject/amphtml/blob/master/examples/forms.amp.html).

## Polyfills
`amp-form` provide polyfills for behaviors and functionality missing from some browsers or being implemented in the next version of CSS.

#### Invalid Submit Blocking and Validation Message Bubble
Browsers that uses webkit-based engines currently (as of August 2016) do not support invalid form submissions. These include Safari on all platforms, and all iOS browsers. `amp-form` polyfills this behavior to block any invalid submissions and show validation message bubbles on invalid inputs.

**Note**: Messages are sometimes limited to a few words like "required field", these messages are provided by the browser implementation. We'll be working on allowing publisher-provided custom validation messages as well as custom validation UIs (instead of the builtin/polyfill'd bubbles).

#### :user-invalid/:user-valid
These pseudo classes are part of the [future CSS Selectors 4 spec](https://drafts.csswg.org/selectors-4/#user-pseudos) and are introduced to allow better hooks for styling invalid/valid fields based on a few criteria.

One of the main differences between `:invalid` and `:user-invalid` is when are they applied to the element. :user-invalid is applied after a significant interaction from the user with the field (e.g. user types in a field, or blur from the field).

`amp-form` provides classes (see below) to polyfill these pseudo-classes. `amp-form` also propagates these to ancestors `fieldset`s and `form`.


## Classes and CSS Hooks
`amp-form` provides classes and CSS hooks for publishers to style their forms and inputs.

`.amp-form-submitting`, `.amp-form-submit-success` and `.amp-form-submit-error` are added to indicate the state of the form submission.

`.user-valid` and `.user-invalid` classes are a polyfill for the pseudo classes as described above. Publishers can use these to style their inputs and fieldsets to be responsive to user actions (e.g. highlighting an invalid input with a red border after user blurs from it).

See the [full example here](https://github.com/ampproject/amphtml/blob/master/examples/forms.amp.html) on using these.


## Security Considerations
Your XHR endpoints need to follow and implement [CORS Requests in AMP spec](https://github.com/ampproject/amphtml/blob/master/spec/amp-cors-requests.md). 

### Protecting against XSRF
In addition to following AMP CORS spec, please pay extra attention to [state changing requests note](https://github.com/ampproject/amphtml/blob/master/spec/amp-cors-requests.md#note-on-state-changing-requests).

In general, keep in mind the following points when accepting input from the user:

* Only use POST for state changing requests.
* Use non-XHR GET for navigational purposes only, e.g. Search.
    * non-XHR GET requests are not going to receive accurate origin/headers and backends won't be able to protect against XSRF with the above mechanism.
    * In general use XHR/non-XHR GET requests for navigational or information retrieval only. 
* non-XHR POST requests are not allowed in AMP documents. This is due to inconsistencies of setting `Origin` header on these requests across browsers. And the complications supporting it would introduce in protecting against XSRF. This might be reconsidered and introduced later, please file an issue if you think this is needed. 
