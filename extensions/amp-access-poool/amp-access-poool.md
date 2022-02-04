---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Displays a Poool paywall.
---

# amp-access-poool

## Usage

The `amp-access-poool` component, based on `amp-access`, loads and shows a paywall using your `bundleID` from Poool's Dashboard configuration.

See [poool.tech](https://poool.tech) for more details. `amp-access-poool` is based on, and requires,
[`amp-access`](https://amp.dev/documentation/components/amp-access).

As you'll know if you're familiar with how Poool works outside of AMP, you cannot use `excerpt` and `hide` modes here. This is due to AMP's specific behavior. You will be able to lock or unlock your content with the `access` variable which is provided by `amp-access`. Check out the `poool-widget` section just below.

The `amp-access-poool` component does not require an authorization or pingback configuration because it is pre-configured to work with Poool.

For more information about modes, check out our [SDK documentation](https://dev.poool.tech/doc/sdk#mode).

### Configurations

You have to set configuration attributes within AMP in camelCase instead of the underscore (" \_ ") symbol traditionally used by Poool.

For example : use `customSegment="amp-custom-segment"` to achieve `poool("config", "custom_segment", "amp-custom-segment");`.

#### HTML sections

**Set poool-widget section, which contain poool paywall when access isn't granted.**

The `amp-access-poool` component requires 3 different sections:

-   The article preview, shown when access hasn't been granted yet (with `amp-access="NOT access"`) and identified by Poool using the `poool-access-preview` attribute
-   The article content, shown when access has been granted (with `amp-access="access"`), hidden by the `amp-access-hide` attribute until access has been granted, and identified by Poool using the `poool-access-content` attribute
-   Poool's Paywall container, shown when access hasn't been granted yet (with `amp-access="NOT error AND NOT access"`), identified by Poool using the `poool` id

```html
<section poool-access-preview amp-access="NOT access">
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
    ullamcorper turpis vel commodo scelerisque.
  </p>
</section>

<section poool-access-content amp-access="access" amp-access-hide>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
    ullamcorper turpis vel commodo scelerisque.
  </p>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
    ullamcorper turpis vel commodo scelerisque.
  </p>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
    ullamcorper turpis vel commodo scelerisque.
  </p>
</section>

<section amp-access="NOT error AND NOT access" id="poool"></section>
```

#### amp-access script - poool config

**Example: Basic paywall configuration (with default values)**

Configuration is similar to AMP Access, except no authorization, pingback or login url is required.

```html
<script id="amp-access" type="application/json">
  {
    "vendor": "poool",
    "poool": {
      "bundleID": "Your app id provided by poool",
      "pageType": "premium",
      "itemID": "amp-example-article"
    }
  }
</script>
```

**Example: Show a paywall for a user in a custom group/segment called "amp-custom-segment"**

```html
<script id="amp-access" type="application/json">
  {
    "vendor": "poool",
    "poool": {
      "bundleID": "Your app id provided by poool",
      "pageType": "premium",
      "debug": "true",
      "cookiesEnabled": "true",
      "itemID": "amp-example-article",
      "customSegment": "amp-custom-segment"
    }
  }
</script>
```

For more information about configuration variables, check out our [SDK documentation](https://dev.poool.tech/doc/sdk#configuration).

## Attributes

### bundleID (required)

Your App ID (you can find it on your Dashboard).

### itemID (required)

Your **unique** article ID.

### pageType (required)

Used to tell Poool that a page has been visited by the current user.
See [documentation](https://dev.poool.tech/doc/sdk#page_view) for more information.

### debug

Enable/disable debug mode.
See [documentation](https://dev.poool.tech/doc/sdk#debug) for more information.

### forceWidget

Override current widget for user.
See [documentation](https://dev.poool.tech/doc/sdk#force_widget) for more information.

### loginButtonEnabled

Enable/disable paywall "login" button.
See [documentation](https://dev.poool.tech/doc/sdk#login_button_enabled) for more information.

### signatureEnabled

Enable/disable paywall signature, shown under article content when the article has been unlocked.
See [documentation](https://dev.poool.tech/doc/sdk#signature_enabled) for more information.

### videoClient

Set default video client (vast, googima) for video widget.
See [documentation](https://dev.poool.tech/doc/sdk#video_client) for more information.

### customSegment

Override native segments with a custom group/segment slug.
See [documentation](https://dev.poool.tech/doc/sdk#custom_segment) for more information.

### cookiesEnabled

Following latest GDPR requirements, we decided to disable cookies by default inside our paywall. You will have to explicitly set this attribute to reflect the user's consent.
See [documentation](https://dev.poool.tech/doc/sdk#cookies_enabled) for more information.

### locale

Set default locale for all texts inside the paywall.
See [documentation](https://dev.poool.tech/doc/sdk#locale) for more information.

### context

Override default or native contexts with a custom context value.
See [documentation](https://dev.poool.tech/doc/sdk#context) for more information.

## Validation

See [`amp-access-poool` rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-access-poool/validator-amp-access-poool.protoascii) in the AMP validator specification.
