---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Displays a Poool paywall. See poool.fr and demo.poool.fr for more details.. amp-access-poool is based on, and requires AMP Access.
---
<!---
Copyright 2017 The AMP HTML Authors.

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

# <a name=”amp-access-poool></a> `amp-access-poool`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Displays a Poool paywall<br />.
    See <a href="http://poool.fr">poool.fr</a> and <a href="http://demo.poool.fr">demo.poool.fr</a> for more details.. <code>amp-access-poool</code> is based on, and requires <a href="https://www.ampproject.org/docs/reference/components/amp-access">AMP Access</a>.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Scripts</strong></td>
    <td>
        <small>Notice that you need scripts for "amp-access-poool", "amp-access" and "amp-analytics".</small>
      <div>
        <code>&lt;script async custom-element="amp-access" src="https://cdn.ampproject.org/v0/amp-access-0.1.js">&lt;/script></code>
      </div>
      <div>
        <code>&lt;script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js">&lt;/script></code>
      </div>
      <div>
        <code>&lt;script async custom-element="amp-access-poool" src="https://cdn.ampproject.org/v0/amp-access-poool-0.1.js">&lt;/script></code>
      </div>
    </td>
  </tr>
</table>

[TOC]

## Behavior

The `amp-access-poool`, based on `amp-access` component, loads and shows a paywall using your `bundleID` from Poool's Dashboard configuration.

If you are unfortunately familiar with Poool's behavior outside AMP, you cannot use `excerpt` and `hidden` modes here, due to AMP's particular behavior. You will be able to lock or unlock your content with the `access` variable which is provided by amp environment. Check poool-widget section just bellow.

The `amp-access-poool` component does not require an authorization or pingback configuration, because it is pre-configured to work with the Poool service.

For more informations about modes, check our [documentation](https://dev.poool.fr/doc/sdk#mode).


## Configurations

### HTML sections

__Set poool-widget section, which contain poool paywall when access isn't granted.__
Set the poool-widget section bellow both shown and hidden content like the following example.
First section is the article preview, always shown to readers.
Second section need an access (`amp-access="access"` attribute) to be displayed. Moreover, this section require an id `poool-access`.
Third section is poool, called when access isn't granted (`amp-access="NOT access"` attribute).

```html
<section>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Curabitur ullamcorper turpis vel commodo scelerisque.
  </p>
</section>

<section id="poool-access" amp-access="access" amp-access-hide class="article-body" itemprop="articleBody">
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Curabitur ullamcorper turpis vel commodo scelerisque.
  </p>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Curabitur ullamcorper turpis vel commodo scelerisque.
  </p>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Curabitur ullamcorper turpis vel commodo scelerisque.
  </p>
</section>

<section amp-access="NOT error AND NOT access">
    <div id="poool-widget"></div>
</section>
```


### amp-access script - poool config

__Example: Basic paywall config (with default values)__

Configuration is similar to AMP Access, but no authorization, pingback and login links are required.

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

__Example: Show a paywall for a user in a custom group/segment called "amp-custom-segment"__

```html
<script id="amp-access" type="application/json">
  {
    "vendor": "poool",
    "poool": {
      "bundleID": "Your app id provided by poool",
      "pageType": "premium",
      "debug": "true",
      "mode": "custom",
      "cookiesEnabled": "true",
      "itemID": "amp-example-article",
      "customSegment": "amp-custom-segment"
    }
  }
</script>
```

For more informations about config variables, check our [documentation](https://dev.poool.fr/doc/sdk#configuration).

##### Notice

You have to set poool config attributes within AMP, in camelCase, instead of the underline (" _ ") symbol traditionally used by Poool.

For example : use `customSegment="amp-custom-segment"` to achieve `poool("config", "custom_segment", "amp-custom-segment");`.


## Attributes

##### bundleID (required)
Your App ID (key given by Poool).

##### itemID (required)
Your article ID.

##### pageType (required)
Used to tell Poool a page has been visited by the current user.
See [documentation](http://dev.poool.fr/doc/sdk#page_view) for more informations.

##### mode
For AMP environment, you'll have to set mode attribute to `"custom"`.
See [documentation](http://dev.poool.fr/doc/sdk#debug) for more informations.

##### debug
Enable/disable debug mode.
See [documentation](http://dev.poool.fr/doc/sdk#debug) for more informations.

##### forceWidget
Override current widget for user.
See [documentation](http://dev.poool.fr/doc/sdk#force_widget) for more informations.

##### loginButtonEnabled
Enable/disable paywall "login" button.
See [documentation](http://dev.poool.fr/doc/sdk#login_button_enabled) for more informations.

##### signatureEnabled
Enable/disable paywall signature, shown under post content when the post has been unlocked by user.
See [documentation](http://dev.poool.fr/doc/sdk#signature_enabled) for more informations.

##### videoClient
Set default video client (vast, googima) for video widget.
See [documentation](http://dev.poool.fr/doc/sdk#video_client) for more informations.

##### customSegment
Override native segments with a custom group/segment slug.
See [documentation](http://dev.poool.fr/doc/sdk#custom_segment) for more informations.

##### cookiesEnabled
Following latest GDPR requirements, we decided to disable cookies by default inside our paywall. Set this attribute to enable them when you asked user about his/her consent.
See [documentation](http://dev.poool.fr/doc/sdk#cookies_enabled) for more informations.


## Validation

See [amp-access-poool rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-access-poool/validator-amp-access-poool.protoascii) in the AMP validator specification.
