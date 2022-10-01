---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Appends a reCAPTCHA v3 token to AMP form submissions.
---

# amp-recaptcha-input

## Usage

This extension adds a parameter containing a reCAPTCHA response token when a parent `<form>` element submits. `amp-recaptcha-input` does this by creating an iframe to load the reCAPTCHA v3 api script using the provided site key, and calling `grecaptcha.execute` with the provided site key and action.

### Prerequisite

Integrating reCAPTCHA for any document on the internet requires several steps, as described in the [official documentation for reCATPCHA](https://developers.google.com/recaptcha/docs/v3).
There are several steps, but generally this requires registering a sitekey, and setting up a server endpoint that can process the reCAPTCHA signal sent from an AMP or other HTML document.

One caveat to be aware when registering a sitekey: you will need to provide all the hostnames that you plan to use this sitekey. For instance, `your.com` and `www.your.com` are treated as different hostnames.
Please note that this is different than the configuration for general HTML documents. See this [issue](https://github.com/ampproject/amphtml/issues/22279) for more details.

This doc will focus more on how reCAPTCHA is configured on AMP.

### Example

This example demonstrates how `<amp-recaptcha-input>` usage on an AMP page correlates to calls on the `grecaptcha` object and form body. `<amp-recaptcha-input>` must be a child of a `<form>` element.

**`<amp-recaptcha-input>` usage**

```html
<form amp-form-attributes-go-here>
  ...
  <amp-recaptcha-input layout="nodisplay" name="reCAPTCHA_body_key" data-sitekey=”reCAPTCHA_site_key" data-action="reCAPTCHA_example_action">
  </amp-recaptcha-input>
  ...
</form>
```

**Corresponding `grecaptcha` call**

```js
grecaptcha.execute('reCAPTCHA_site_key', {action: 'reCAPTCHA_example_action'});
```

**Corresponding AMP form submit body**

```js
{
  ...other form params
  "reCAPTCHA_body_key": "returned_reCAPTCHA_response_token"
}
```

## Attributes

### layout (required)

Required value is `nodisplay`.

### name (required)

Name of the `<amp-recaptcha-input>`. Will be used as a parameter key in the AMP form body submission.

### data-sitekey (required)

[reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3) site key for the registered website.

### data-action (required)

[reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3) action to be executed on form submission.

### data-global (optional)

By default, the iframe loads the recaptcha api script using the `www.google.com` endpoint. There are some situations when this is not accessible. When the `data-global` attribute is included, the component will load the script from the `www.recaptcha.net` endpoint instead. More information can be found in the [reCAPTCHA FAQ](https://developers.google.com/recaptcha/docs/faq#can-i-use-recaptcha-globally).

## Validation

See [`<amp-recaptcha-input>`](https://github.com/ampproject/amphtml/blob/main/extensions/amp-recaptcha-input/validator-amp-recaptcha-input.protoascii) rules in the AMP validator specification.
