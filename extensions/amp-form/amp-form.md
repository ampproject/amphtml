<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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
    <td>Allows you to create <code>form</code> and <code>input</code> tags.</td>
  </tr>
  <tr>
    <td><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout#the-layout-attribute">Supported Layouts</a></strong></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-form/">amp-form</a> examples.</td>
  </tr>
</table>

[TOC]

## Behavior

The `amp-form` extension allows you to create forms (`<form>`) to submit input fields in an AMP document. The  `amp-form` extension also provides [polyfills](#polyfills) for some missing behaviors in browsers.

{% call callout('Important', type='caution') %}
If you're submitting data in your form, your server endpoint must implement the requirements for [CORS security](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests#cors-security-in-amp).
{% endcall %}


Before creating a `<form>`, you must include the required script for the `<amp-form>` extension, otherwise your document will be invalid. If you're using `input` tags for purposes other than submitting their values (e.g., inputs not inside a `<form>`), you do not need to load the `amp-form` extension.

Here's an example of a basic form:

<!-- embedded sample that is rendered on ampproject.org -->
<div>
  <amp-iframe height="671"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/ampform.basic.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div>
  </amp-iframe>
</div>

## Attributes

##### target

Indicates where to display the form response after submitting the form. The value must be `_blank` or `_top`.

##### action

Specifies a server endpoint to handle the form input. The value must be an `https` URL (absolute or relative) and must not be a link to a CDN.

* For `method=GET`: use this attribute or [`action-xhr`](#action-xhr).
* For `method=POST`: use the [`action-xhr`](#action-xhr) attribute.


{% call callout('Note', type='note') %}
The `target` and `action` attributes are only used for non-xhr GET requests. The AMP runtime will use `action-xhr` to make the request and will ignore `action` and `target`. When `action-xhr` is not provided, AMP makes a GET request to the `action` endpoint and uses `target` to open a new window (if `_blank`). The AMP runtime might also fallback to using `action` and `target` in cases where the `amp-form` extension fails to load.
{% endcall %}

##### action-xhr

Specifies a server endpoint to handle the form input and submit the form via XMLHttpRequest (XHR). An XHR request (sometimes called an AJAX request) is where the browser would make the request without a full load of the page or opening a new page. Browsers will send the request in the background using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) when available and fallback to [XMLHttpRequest API](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) for older browsers.

{% call callout('Important', type='caution') %}
Your XHR endpoint must implement the requirements for [CORS security](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests#cors-security-in-amp).
{% endcall %}


This attribute is required for `method=POST`, and is optional for `method=GET`.

The value for `action-xhr` can be the same or a different endpoint than `action` and has the same `action` requirements above.

To learn about redirecting the user after successfully submitting the form, see the [Redirecting after a submission](#redirecting-after-a-submission) section below.


##### Other form attributes

All other [form attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) are optional.

##### custom-validation-reporting

This is an optional attribute that enables and selects a custom validation reporting strategy. Valid values are one of: `show-first-on-submit`, `show-all-on-submit` or `as-you-go`.

See the [Custom Validation](#custom-validations) section for more details.

## Inputs and fields

**Allowed**:

* Other form-related elements, including: `<textarea>`, `<select>`, `<option>`, `<fieldset>`, `<label>`, `<input type=text>`, `<input type=submit>`, and so on.
* `<input type=password>` and `<input type=file>` inside of `<form method=POST action-xhr>`.
* [`amp-selector`](https://amp.dev/documentation/components/amp-selector)

**Not Allowed**:

* `<input type=button>`, `<input type=image>`
* Most of the form-related attributes on inputs including: `form`, `formaction`, `formtarget`, `formmethod` and others.

(Relaxing some of these rules might be reconsidered in the future - [please let us know](https://github.com/ampproject/amphtml/blob/master/CONTRIBUTING.md#suggestions-and-feature-requests) if you require these and provide use cases).

For details on valid inputs and fields, see [amp-form rules](https://github.com/ampproject/amphtml/blob/master/validator/validator-main.protoascii) in the AMP validator specification.

## Actions

The `amp-form` element exposes the following actions:

| Action | Description |
|--------|-------------|
| `submit` | Allows you to trigger the form submission on a specific action, for example, tapping a link, or [submitting a form on input change](#input-events). |
| `clear` | Empties the values from each input in the form. This can allow users to quickly fill out forms a second time. |

{% call callout('Read on', type='read') %}
Learn more about [Actions and Events in AMP](https://amp.dev/documentation/guides-and-tutorials/learn/amp-actions-and-events.html).
{% endcall %}

## Events

The `amp-form` exposes the following events:

| Event | Fired when |
|-------|-------------|
| `submit` | The form is submitted and before the submission is complete. |
| `submit-success` | The form submission is done and the response is a success. |
| `submit-error` | The form submission is done and the response is an error. |
| `verify` | Asynchronous verification is initiated. |
| `verify-error` | Asynchronous verification is done and the response is an error. |
| `valid` | The form's validation state changes to "valid" (in accordance with its [reporting strategy](#reporting-strategies)). |
| `invalid` | The form's validation state to "invalid" (in accordance with its [reporting strategy](#reporting-strategies)). |

These events can be used via the [`on` attribute](https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#on).

For example, the following listens to both the `submit-success` and `submit-error` events and shows different lightboxes depending on the event:

```html
<form ... on="submit-success:success-lightbox;submit-error:error-lightbox" ...>
</form>
```

See the [full example here](../../examples/forms.amp.html).

#### Input events

AMP exposes `change` and `input-debounced` events on child `<input>` elements. This allows you to use the [`on` attribute](https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#on) to execute an action on any element when an input value changes.

For example, a common use case is to submit a form on input change (selecting a radio button to answer a poll, choosing a language from a `select` input to translate a page, etc.).

<!-- embedded sample that is rendered on ampproject.org -->
<div>
<amp-iframe height="450"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/ampform.inputevent.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div>
</amp-iframe>
</div>

See the [full example here](../../examples/forms.amp.html).

### Analytics triggers

The `amp-form` extension triggers the following events that you can track in your [amp-analytics](https://amp.dev/documentation/components/amp-analytics) config:

| Event                     | Fired when                        |
|---------------------------|-----------------------------------|
| `amp-form-submit`         | A form request is initiated.      |
| `amp-form-submit-success` | A successful response is received (i.e, when the response has a status of `2XX`). |
| `amp-form-submit-error`   | An unsuccessful response is received (i.e, when the response doesn't have a status of `2XX`). |

You can configure your analytics to send these events as in the following example:

```html
<amp-analytics>
  <script type="application/json">
    {
      "requests": {
        "event": "https://www.example.com/analytics/event?eid=${eventId}",
        "searchEvent": "https://www.example.com/analytics/search?formId=${formId}&query=${formFields[query]}"
      },
      "triggers": {
        "formSubmit": {
          "on": "amp-form-submit",
          "request": "searchEvent"
        },
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

All three events generate a set of variables that correspond to the specific form and the fields in the form. These variables can be used for analytics.

For example, the following form has one field:

```html
<form action-xhr="/comment" method="POST" id="submit_form">
  <input type="text" name="comment" />
  <input type="submit" value="Comment" />
</form>
```

When the `amp-form-submit`, `amp-form-submit-success`, or `amp-form-submit-error` event fires, it generates the following variables containing the values that were specified in the form:

* `formId`
* `formFields[comment]`

## Success/error response rendering

You can render success or error responses in your form by using [extended templates](https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#extended-templates), such as [amp-mustache](https://amp.dev/documentation/components/amp-mustache), or success responses through data binding with [amp-bind](https://amp.dev/documentation/components/amp-bind) and the following response attributes:

| Response attribute | Description |
|-----------|---------------------|
| `submit-success` | Can be used to display a success message if the response is successful (i.e., has a status of `2XX`). |
| `submit-error` | an be used to display a submission error if the response is unsuccessful (i.e., does not have a status of `2XX`).  |
| `submitting` | Can be used to display a message when the form is submitting. The template for this attribute has access to the form's input fields for any display purposes. Please see the [full form example below](#example-submitting) for how to use the `submitting` attribute. |

### To render responses with templating:

* Apply a response attribute to *any direct child* of the `<form>` element.
* Render the response in the child element by including a template via `<template></template>` or `<script type="text/plain"></script>` tag inside it or by referencing a template with a `template="id_of_other_template"` attribute.
* Provide a valid JSON object for responses to `submit-success` and `submit-error`. Both success and error responses should have a `Content-Type: application/json` header.




<a id="example-submitting"></a>
##### Example: Form displays success, error, and submitting messages

In the following example, the responses are rendered in an inline template inside the form.

```html
<form ...>
  <fieldset>
    <input type="text" name="firstName" />
    ...
  </fieldset>
  <div verify-error>
    <template type="amp-mustache">
      There is a mistake in the form!
      {{#verifyErrors}}{{message}}{{/verifyErrors}}
    </template>
  </div>
  <div submitting>
    <template type="amp-mustache">
      Form submitting... Thank you for waiting {{name}}.
    </template>
  </div>
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

The publisher's `action-xhr` endpoint returns the following JSON responses:

On success:

```json
{
  "name": "Jane Miller",
  "interests": [{"name": "Basketball"}, {"name": "Swimming"}, {"name": "Reading"}],
  "email": "email@example.com"
}
```

On error:
```json
{
  "name": "Jane Miller",
  "message": "The email (email@example.com) you used is already subscribed."
}
```

You can render the responses in a referenced template defined earlier in the document by using the template's id as the value of the `template` attribute, set on the elements with the `submit-success` and `submit-error` attributes.

```html
<template type="amp-mustache" id="submit_success_template">
  Success! Thanks {{name}} for subscribing! Please make sure to check your email {{email}}
  to confirm! After that we'll start sending you weekly articles on {{#interests}}<b>{{name}}</b> {{/interests}}.
</template>
<template type="amp-mustache" id="submit_error_template">
  Oops! {{name}}, {{message}}.
</template>

<form ...>
  <fieldset>
  ...
  </fieldset>
  <div submit-success template="submit_success_template"></div>
  <div submit-error template="submit_error_template"></div>
</form>
```

See the [full example here](../../examples/forms.amp.html).

### To render a successful response with data binding

* Use the [on attribute](https://amp.dev/documentation/guides-and-tutorials/learn/amp-actions-and-events) to bind the form *submit-success* attribute to [`AMP.setState()`](https://amp.dev/documentation/components/amp-bind#updating-state-with-amp.setstate()).
* Use the `event` property to capture the response data.
* Add the state attribute to the desired element to bind the form response.

The following example demonstrates a form `submit-success` response with [`amp-bind`](https://amp.dev/documentation/components/amp-bind):
```html
  <p [text]="'Thanks, ' + subscribe +'! You have successfully subscribed.'">Subscribe to our newsletter</p>
  <form method="post"
        action-xhr="/components/amp-form/submit-form-input-text-xhr"
        target="_top"
        on="submit-success: AMP.setState({'subscribe': event.response.name})">
    <div>
      <input type="text"
          name="name"
          placeholder="Name..."
          required>
      <input type="email"
        name="email"
        placeholder="Email..."
        required>
    </div>
    <input type="submit" value="Subscribe">
  </form>
 ```

 When the form is submitted successfully it will return a JSON response similar to the following:

```json
{
  "name": "Jane Miller",
  "email": "email@example.com"
}
```
Then `amp-bind` updates the `<p>` element's text to match the `subscibe` state:

```html
...
  <p [text]="'Thanks, ' + subscribe +'! You have successfully subscribed.'">Thanks Jane Miller! You have successfully subscribed.</p>
...
```

### Redirecting after a submission

You can redirect users to a new page after a successful form submission by setting the `AMP-Redirect-To` response header and specifying a redirect URL. The redirect URL must be a HTTPS URL, otherwise AMP will throw an error and redirection won't occur.  HTTP response headers are configured via your server.

Make sure to update your `Access-Control-Expose-Headers` response header to include `AMP-Redirect-To` to the list of allowed headers.  Learn more about these headers in [CORS Security in AMP](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests#cors-security-in-amp).

*Example response headers:*

```text
AMP-Redirect-To: https://example.com/forms/thank-you
Access-Control-Expose-Headers: AMP-Access-Control-Allow-Source-Origin, AMP-Redirect-To
```


{% call callout('Tip', type='success') %}
Check out AMP By Example's [Form Submission with Update](https://ampbyexample.com/components/amp-form/#form-submission-with-page-update) and [Product Page](https://ampbyexample.com/samples_templates/product_page/#product-page) that demonstrate using redirection after a form submission.
{% endcall %}


## Custom validations

The `amp-form` extension allows you to build your own custom validation UI by using the `custom-validation-reporting` attribute along with one the following reporting strategies: `show-first-on-submit`, `show-all-on-submit` or `as-you-go`.

To specify custom validation on your form:

1. Set the `custom-validation-reporting` attribute on your `form` to one of the [validation reporting strategies](#reporting-strategies).
2. Provide your own validation UI marked up with special attributes. AMP will discover the special attributes and report them at the right time depending on the reporting strategy you specified.

Here's an example:

<!-- embedded sample that is rendered on ampproject.org -->
<div>
<amp-iframe height="748"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/ampform.customval.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div>
</amp-iframe>
</div>

For more examples, see [examples/forms.amp.html](../../examples/forms.amp.html).

For validation messages, if your element contains no text content inside, AMP will fill it out with the browser's default validation message. In the example above, when the `name5` input is empty and validation is kicked off (i.e., user tried to submit the form) AMP will fill `<span visible-when-invalid="valueMissing" validation-for="name5"></span>` with the browser's validation message and show that `span` to the user.

{% call callout('Important', type='caution') %}
You must provide your own validation UI for each kind of invalid state that the input could have. If these are not present, users will not see any `custom-validation-reporting` for the missing error state. The validity states can be found in the [official W3C HTML validation reporting documentation](https://www.w3.org/TR/html50/forms.html#validitystate).
{% endcall %}

### Reporting strategies

Specify one of the following reporting options for the `custom-validation-reporting` attribute:

#### Show First on Submit
The `show-first-on-submit` reporting option mimics the browser's default behavior when default validation kicks in. It shows the first validation error it finds and stops there.

#### Show All on Submit
The `show-all-on-submit` reporting option shows all validation errors on all invalid inputs when the form is submitted. This is useful if you'd like to show a summary of validations.

#### As You Go
The `as-you-go` reporting option allows your user to see validation messages as they're interacting with the input. For example, if the user types an invalid email address, the user will see the error right away.  Once they correct the value, the error goes away.

#### Interact and Submit
The `interact-and-submit` reporting option combines the behavior of `show-all-on-submit` and `as-you-go`. Individual fields will show any errors immediately after interactions, and on submit the form will show errors on all invalid fields.

## Verification

HTML5 validation gives feedback based only on information available on the page, such as if a value matches a certain pattern. With `amp-form` verification you can give the user feedback that HTML5 validation alone cannot. For example, a form can use verification to check if an email address has already been registered. Another use-case is verifying that a city field and a zip code field match each other.

Here's an example:
```html
<h4>Verification example</h4>
<form
  method="post"
  action-xhr="/form/verify-json/post"
  verify-xhr="/form/verify-json/post"
  target="_blank"
>
    <fieldset>
        <label>
            <span>Email</span>
            <input type="text" name="email" required>
        </label>
        <label>
            <span>Zip Code</span>
            <input type="tel" name="zip" required pattern="[0-9]{5}(-[0-9]{4})?">
        </label>
        <label>
            <span>City</span>
            <input type="text" name="city" required>
        </label>
        <label>
            <span>Document</span>
            <input type="file" name="document" no-verify>
        </label>
        <div class="spinner"></div>
        <input type="submit" value="Submit">
    </fieldset>
    <div submit-success>
        <template type="amp-mustache">
            <p>Congratulations! You are registered with {{email}}</p>
        </template>
    </div>
    <div submit-error>
        <template type="amp-mustache">
            {{#verifyErrors}}
                <p>{{message}}</p>
            {{/verifyErrors}}
            {{^verifyErrors}}
                <p>Something went wrong. Try again later?</p>
            {{/verifyErrors}}
        </template>
    </div>
</form>
```

The form sends a `__amp_form_verify` field as part of the form data as a hint to
the server that the request is a verify request and not a formal submit.
This is helpful so the server knows not to store the verify request if the same
endpoint is used for verification and for submit.

Here is how an error response should look for verification:
```json
{
  "verifyErrors": [
    {"name": "email", "message": "That email is already taken."},
    {"name": "zip", "message": "The city and zip do not match."}
  ]
}
```

To remove a field from the `verify-xhr` request, add the `no-verify` attribute
to the input element.

For more examples, see [examples/forms.amp.html](../../examples/forms.amp.html).


## Variable substitutions

The `amp-form` extension allows [platform variable substitutions](../../spec/amp-var-substitutions.md) for inputs that are hidden and that have the `data-amp-replace` attribute. On each form submission, `amp-form` finds all `input[type=hidden][data-amp-replace]` inside the form and applies variable substitutions to its `value` attribute and replaces it with the result of the substitution.

You must provide the variables you are using for each substitution on each input by specifying a space-separated string of the variables used in `data-amp-replace` (see example below). AMP will not replace variables that are not explicitly specified.

Here's an example of how inputs are before and after substitutions (note that you need to use platform syntax of variable substitutions and not analytics ones):
```html
<!-- Initial Load -->
<form ...>
  <input name="canonicalUrl" type="hidden"
        value="The canonical URL is: CANONICAL_URL - RANDOM - CANONICAL_HOSTNAME"
        data-amp-replace="CANONICAL_URL RANDOM">
  <input name="clientId" type="hidden"
        value="CLIENT_ID(myid)"
        data-amp-replace="CLIENT_ID">
  ...
</form>
```

Once the user tries to submit the form, AMP will try to resolve the variables and update the fields' `value` attribute of all fields with the appropriate substitutions. For XHR submissions, all variables are likely to be substituted and resolved. However, in non-XHR GET submissions, values that requires async-resolution might not be available due to having not been resolved previously. `CLIENT_ID` for example would not resolve if it wasn't resolved and cached previously.

```html
<!-- User submits the form, variables values are resolved into fields' value -->
<form ...>
  <input name="canonicalUrl" type="hidden"
        value="The canonical URL is: https://example.com/hello - 0.242513759125 - CANONICAL_HOSTNAME"
        data-amp-replace="CANONICAL_URL RANDOM">
  <input name="clientId" type="hidden"
        value="amp:asqar893yfaiufhbas9g879ab9cha0cja0sga87scgas9ocnas0ch"
        data-amp-replace="CLIENT_ID">
    ...
</form>
```

Note how `CANONICAL_HOSTNAME` above did not get replaced because it was not in the whitelist through `data-amp-replace` attribute on the first field.

Substitutions will happen on every subsequent submission. Read more about [variable substitutions in AMP](../../spec/amp-var-substitutions.md).

## Polyfills

The `amp-form` extension provide polyfills for behaviors and functionality missing from some browsers or being implemented in the next version of CSS.

#### Invalid submit blocking and validation message bubble

Browsers that use webkit-based engines currently (as of August 2016) do not support invalid form submissions. These include Safari on all platforms, and all iOS browsers. The `amp-form` extension polyfills this behavior to block any invalid submissions and shows validation message bubbles on invalid inputs.


#### User-interaction pseudo-classes

The `:user-invalid` and `:user-valid` pseudo classes are part of the [future CSS Selectors 4 spec](https://drafts.csswg.org/selectors-4/#user-pseudos) and are introduced to allow better hooks for styling invalid/valid fields based on a few criteria.

One of the main differences between `:invalid` and `:user-invalid` is when are they applied to the element. The `:user-invalid` class is applied after a significant interaction from the user with the field (e.g., the user types in a field, or blurs from the field).

The `amp-form` extension provides [classes](#classes-and-css-hooks) to polyfill these pseudo-classes. The `amp-form` extension also propagates these to the ancestor `form`. However, `fieldset` elements are only ever set to have class 'user-valid' to be consistent with browser behaviour.

#### `<textarea>` validation

Regular expression matching is a common validation feature supported natively on most input elements, except for `<textarea>`. We polyfill this functionality and support the `pattern` attribute on `<textarea>` elements.

AMP Form provides an `autoexpand` attribute to `<textarea>` elements. This allows the textarea
to expand and shrink to accomodate the user's rows of input, up to the field's maximum size. If the user manually resizes the field, the autoexpand behavior will be removed.

```html
<textarea autoexpand></textarea>
```

## Styling

### Classes and CSS hooks

The `amp-form` extension provides classes and CSS hooks for publishers to style their forms and inputs.

The following classes can be used to indicate the state of the form submission:

* `.amp-form-initial`
* `.amp-form-verify`
* `.amp-form-verify-error`
* `.amp-form-submitting`
* `.amp-form-submit-success`
* `.amp-form-submit-error`


The following classes are a [polyfill for the user interaction pseudo classes](#user-interaction-pseudo-classes):

* `.user-valid`
* `.user-invalid`

Publishers can use these classes to style their inputs and fieldsets to be responsive to user actions (e.g., highlighting an invalid input with a red border after user blurs from it).

See the [full example here](../../examples/forms.amp.html) on using these.

{% call callout('Tip', type='success') %}
Visit [AMP Start](https://ampstart.com/components#form-elements) for responsive, pre-styled AMP form elements that you can use in your AMP pages.
{% endcall %}

## Security considerations

### Protecting against XSRF
In addition to following the details in the [AMP CORS spec](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests.html), please pay extra attention to the section on ["Processing state changing requests" ](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests.html#processing-state-changing-requests) to protect against [XSRF attacks](https://en.wikipedia.org/wiki/Cross-site_request_forgery) where an attacker can execute unauthorized commands using the current user session without the user knowledge.

In general, keep in mind the following points when accepting input from the user:

* Only use POST for state changing requests.
* Use non-XHR GET for navigational purposes only (e.g., Search).
    * non-XHR GET requests are not going to receive accurate origin/headers and backends won't be able to protect against XSRF with the above mechanism.
    * In general, use XHR/non-XHR GET requests for navigational or information retrieval only.
* non-XHR POST requests are not allowed in AMP documents. This is due to inconsistencies of setting `Origin` header on these requests across browsers. And the complications supporting it would introduce in protecting against XSRF. This might be reconsidered and introduced later, please file an issue if you think this is needed.
