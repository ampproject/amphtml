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
    <td>Stable<br>(<a href="#custom-validations">Custom Validation still experimental - See below</a>)</td>
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
    <td><a href="https://ampbyexample.com/components/amp-form/">Annotated code example for amp-form</a></td>
  </tr>
</table>

## Behavior

The `amp-form` extension allows the usage of forms and input fields in an AMP document. The extension allows polyfilling
some of the missing behaviors in browsers.

The `amp-form` extension **MUST** be loaded if you're using `<form>` or any input tags, otherwise your document will be invalid!

Example:
```html
<form method="post" action-xhr="https://example.com/subscribe" target="_blank">
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
    <div submit-success>
        <template type="amp-mustache">
            Subscription successful!
        </template>
    </div>
    <div submit-error>
        <template type="amp-mustache">
            Subscription failed!
        </template>
    </div>
</form>
```

## Attributes

**target**
__required__

Target attribute of the `<form>` must be either `_blank` or `_top`.

**action**
__invalid__ when `method=POST`
__required__ when `method=GET`

Action must be provided, `https` and is non-cdn link (does **NOT** link to https://cdn.ampproject.org).

__Note__: `target` and `action` will only be used for non-xhr GET requests. AMP runtime will use `action-xhr` to make the request and will ignore `action` and `target`. When `action-xhr` is not provided AMP would make a GET request to `action` endpoint and use `target` to open a new window (if `_blank`). AMP runtime might also fallback to using action and target in cases where `amp-form` extension fails to load.

**action-xhr**
__required__ when `method=POST`
__optional__ when `method=GET`

You can also provide an action-xhr attribute, if provided, the form will be submitted in an XHR fashion.

An XHR request is where the browser would make the request without a full load of the page or opening a new page also sometimes called Ajax request. Browsers will send the request in the background using [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) when available and fallback to [XMLHttpRequest API](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) for older browsers.

This attribute can be the same or a different endpoint than `action` and has the same action requirements above.

**Important**: See [Security Considerations](#security-considerations) for notes on how to secure your forms endpoints.

All other [form attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) are optional.

**custom-validation-reporting**
__(optional)__ __(experimental)__
Enables and selects a custom validation reporting strategy, valid values are one of `show-first-on-submit`, `show-all-on-submit` or `as-you-go`.

See [Custom Validation](#custom-validations) section for more details on this.

## Inputs and Fields
Currently, `<input type=button>`, `<input type=file>`, `<input type=image>` and `<input type=password>` are not allowed.

Most of form-related attributes on inputs are not allowed, this include `form`, `formaction`, `formtarget`, `formmethod` and others.

(Relaxing some of these rules might be reconsidered in the future - please let us know if you require these and use cases).

Other `input` types, `textarea`, `select`, `option`, `fieldset`, `label` are allowed.

## Events
`amp-form` exposes 3 events:

* **submit**
Emitted whenever the form is submitted and before the submission is complete.

* **submit-success**
Emitted whenever the form submission is done and response is a success.

* **submit-error**
Emitted whenever the form submission is done and response is an error.

These events can be used through the [`on` attribute](../../spec/amp-html-format.md#on).
For example, the following listens to both `submit-success` and `submit-error` and shows different lightboxes depending on the event.

```html
<form ... on="submit-success:success-lightbox;submit-error:error-lightbox" ...>
</form>
```

See the [full example here](../../examples/forms.amp.html).

### Analytics Triggers
`amp-form` triggers two events you can track in your `amp-analytics` config: `amp-form-submit-success` and `amp-form-submit-error`.

You can configure your analytics to send these events as in the example below.

```html
<amp-analytics>
    <script type="application/json">
        {
            "requests": {
                "event": "https://www.example.com/analytics/event?eid=${eventId}"
            },
            "triggers": {
                "formSubmitSuccess": {
                    "on": "amp-form-submit-success",
                    "request": "event",
                    "vars": {
                        "eventId": "form-submit-success"
                    }
                },
                "formSubmitError": {
                    "on": "amp-form-submit-error",
                    "request": "event",
                    "vars": {
                        "eventId": "form-submit-error"
                    }
                }
            }
        }
    </script>
</amp-analytics>
```

## Success/Error Response Rendering
`amp-form` allows publishers to render the responses using [Extended Templates](../../spec/amp-html-format.md#extended-templates).

Using `submit-success` and `submit-error` special marker attributes, publishers can mark any **child element of form** and include a `<template></template>` tag inside it to render the response in it.

The response is expected to be a valid JSON Object. For example, if the publisher's `action-xhr` endpoint returns the following responses:

Both success and error responses should have a `Content-Type: application/json` header. `submit-success` will render for all responses that has a status of `2XX`, all other statuses will render `submit-error`.

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

See the [full example here](../../examples/forms.amp.html).

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

See the [full example here](../../examples/forms.amp.html) on using these.

## Custom Validations
__(<a href="https://www.ampproject.org/docs/reference/experimental.html">experimental</a>)__
`amp-form` provides a way for you to build your own custom validation UI with few validation reporting strategies available to choose from `show-first-on-submit`, `show-all-on-submit` or `as-you-go`.

The general usage of this is you first set `custom-validation-reporting` attribute on your `form` to one of the validation reporting strategies and then provide your own validation UI marked up with special attributes, AMP will discover these and report them at the right time depending on the strategy selected.

Here's an example (for more examples please check [examples/forms.amp.html](../../examples/forms.amp.html)):
```html
<h4>Show All Invalid Messages On Submit</h4>
<form method="post"
      action-xhr="/form/echo-json/post"
      target="_blank"
      custom-validation-reporting="show-all-on-submit">
    <fieldset>
        <label>
            <span>Your name</span>
            <input type="text" name="name" id="name5" required pattern="\w+\s\w+">
            <span visible-when-invalid="valueMissing" validation-for="name5"></span>
            <span visible-when-invalid="patternMismatch" validation-for="name5">
                Please enter your first and last name separated by a space (e.g. Jane Miller)
            </span>
        </label>
        <label>
            <span>Your email</span>
            <input type="email" name="email" id="email5" required>
            <span visible-when-invalid="valueMissing" validation-for="email5"></span>
            <span visible-when-invalid="typeMismatch" validation-for="email5"></span>
        </label>
        <input type="submit" value="Subscribe">
    </fieldset>
</form>
```

For validation messages, if your element contains no text content inside, AMP will fill it out with the browser's default validation message. In the example above, when `name5` input is empty and validation kicked off (i.e. user tried to submit the form) AMP will fill `<span visible-when-invalid="valueMissing" validation-for="name5"></span>` with the browser validation message and show that `span` to the user.

### Reporting Strategies
#### Show First on Submit
This mimics the browser default behavior when default validation kicks in. It shows the first validation error it finds and stops there.

#### Show All on Submit
This shows all validation errors on all invalid inputs when the form is submitted. This is useful if you'd like to show a summary of validations for example.

#### As You Go
This allows your user to see validation messages as they're interacting with the input, if the email they typed is invalid they'll see the error right away and once fixed the error goes away.

## Security Considerations
Your XHR endpoints need to follow and implement [CORS Requests in AMP spec](../../spec/amp-cors-requests.md).

### Protecting against XSRF
In addition to following AMP CORS spec, please pay extra attention to [state changing requests note](../../spec/amp-cors-requests.md#note-on-state-changing-requests).

In general, keep in mind the following points when accepting input from the user:

* Only use POST for state changing requests.
* Use non-XHR GET for navigational purposes only, e.g. Search.
    * non-XHR GET requests are not going to receive accurate origin/headers and backends won't be able to protect against XSRF with the above mechanism.
    * In general use XHR/non-XHR GET requests for navigational or information retrieval only. 
* non-XHR POST requests are not allowed in AMP documents. This is due to inconsistencies of setting `Origin` header on these requests across browsers. And the complications supporting it would introduce in protecting against XSRF. This might be reconsidered and introduced later, please file an issue if you think this is needed. 
