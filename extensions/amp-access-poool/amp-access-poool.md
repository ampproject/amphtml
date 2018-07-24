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
    <td width="40%"><strong>Description</strong></td>
    <td>
      Displays a Poool paywall<br />.
      See <a href="http://poool.fr">poool.fr</a> and <a href="http://demo.poool.fr">demo.poool.fr</a> for more details.
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-access-poool" src="https://cdn.ampproject.org/v0/amp-access-poool-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/amp-access-poool.amp.html">amp-access-poool.amp.html</a></td>
  </tr>
</table>

[TOC]

## Behavior

The `amp-access-poool`, based on `amp-access` component, loads and shows a paywall using your `bundleID` from Poool's Dashboard configuration.

If you are unfortunately familiar with Poool's behavior outside AMP, you cannot use `excerpt` and `hidden` modes here, due to AMP's particular behavior. You will be able to lock or unlock your content with the `access` variable which is provided by amp environment.

The `amp-access-poool` component does not require an authorization or pingback configuration, because it is pre-configured to work with the Poool service.

For more informations about modes, check our [documentation](https://dev.poool.fr/doc/sdk#mode).


## Configurations

__Example: Basic paywall (with default values)__

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

__Example: Show a paywall for a user in a custom group/segment called "myCustomSegment"__

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
      "customSegment": "myCustomSegment"
    }
  }
</script>
```

For more informations about config variables, check our [documentation](https://dev.poool.fr/doc/sdk#configuration).

##### Notice

You have to use tags attributes within AMP, in camelCase, instead of the underline (" _ ") symbol traditionally used by Poool.

For example : use `customSegment="test"` to achieve `poool("config", "custom_segment", "test");`.


## Attributes

##### bundleId (required)
Your App ID (key given by Poool).

##### pageType (required)
Used to tell Poool a page has been visited by the current user.
See [documentation](http://dev.poool.fr/doc/sdk#page_view) for more informations.

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

##### userIsPremium
Used to tell Poool if current user is a premium user or not.
See [documentation](http://dev.poool.fr/doc/sdk#user_is_premium) for more informations.

##### videoClient
Set default video client (vast, googima) for video widget.
See [documentation](http://dev.poool.fr/doc/sdk#video_client) for more informations.

##### customSegment
Override native segments with a custom group/segment slug.
See [documentation](http://dev.poool.fr/doc/sdk#custom_segment) for more informations.

##### cookiesEnabled
Following latest GDPR requirements, we decided to disable cookies by default inside our paywall. Set this attribute to enable them when you asked user about his/her consent.
See [documentation](http://dev.poool.fr/doc/sdk#cookies_enabled) for more informations.

## Events

<table>
  <tr>
    <th width="25%">Event</th>
    <th width="35%">Description</th>
    <th width="40%">Data</th>
  </tr>
  <tr>
    <td><code>lock</code></td>
    <td>Fired when the post content should be cut/trimmed/hidden. See [documentation](http://dev.poool.fr/doc/sdk#onlock) for more informations.</td>
    <td>None</td>
  </tr>
  <tr>
    <td><code>release</code></td>
    <td>Fired when the post content should be unlocked (typically when the user has performed his/her current paywall action to unlock the post). See [documentation](http://dev.poool.fr/doc/sdk#onrelease) for more informations.</td>
    <td><pre>event.widget</pre></td>
  </tr>
  <tr>
    <td><code>identityAvailable</code></td>
    <td>Fired when user has been successfully identified. See [documentation](http://dev.poool.fr/doc/sdk#onidentityavailable) for more informations.</td>
    <td><pre>
    event.user_id
    event.segment_slug
    </pre></td>
  </tr>
  <tr>
    <td><code>hidden</code></td>
    <td>Fired when Poool's paywall should be hidden and you should show your own paywall instead. See [documentation](http://dev.poool.fr/doc/sdk#onhidden) for more informations.</td>
    <td>None</td>
  </tr>
  <tr>
    <td><code>disabled</code></td>
    <td>Fired when Poool's paywall has been disabled in configuration and you should show your own paywall instead. See [documentation](http://dev.poool.fr/doc/sdk#ondisabled) for more informations.</td>
    <td>None</td>
  </tr>
  <tr>
    <td><code>register</code></td>
    <td>Fired when the user interacts with Poool's newsletter paywall form. See [documentation](http://dev.poool.fr/doc/sdk#onregister) for more informations.</td>
    <td><pre>
    event.email
    event.newsletter_id
    </pre></td>
  </tr>
  <tr>
    <td><code>subscribeClick</code></td>
    <td>Fired when the user interacts with any "subscribe" button/link within paywall. See [documentation](http://dev.poool.fr/doc/sdk#onsubscribeclick) for more informations.</td>
    <td><pre>
    event.widget
    event.button
    event.originalEvent
    event.url
    </pre></td>
  </tr>
  <tr>
    <td><code>loginClick</code></td>
    <td>Fired when the user interacts with any "login" button/link within paywall. See [documentation](http://dev.poool.fr/doc/sdk#onloginclick) for more informations.</td>
    <td><pre>
    event.widget
    event.button
    event.originalEvent
    event.url
    </pre></td>
  </tr>
  <tr>
    <td><code>dataPolicyClick</code></td>
    <td>Fired when the user interacts with GDPR policy buttons/links within paywall. See [documentation](http://dev.poool.fr/doc/sdk#ondatapolicyclick) for more informations.</td>
    <td><pre>
    event.widget
    event.button
    event.originalEvent
    event.url
    </pre></td>
  </tr>
  <tr>
    <td><code>error</code> (deprecated)</td>
    <td>Fired when an unexpected error has been caught and you might show your regular paywall as a fallback. See [documentation](http://dev.poool.fr/doc/sdk#onerror) for more informations.</td>
    <td>None</td>
  </tr>
  <tr>
    <td><code>outdatedbrowser</code> (deprecated)</td>
    <td>Fired when user is using an outdated browser (mainly IE). See [documentation](http://dev.poool.fr/doc/sdk#onoutdatedbrowser) for more informations.</td>
    <td>None</td>
  </tr>
  <tr>
    <td><code>userOutsideCohort</code> (deprecated)</td>
    <td>Fired when Poool's paywall is only shown to a percentage of people and the identified user is not part of this percentage.. See [documentation](http://dev.poool.fr/doc/sdk#onuseroutsidecohort) for more informations.</td>
    <td>None</td>
  </tr>
</table>

## Validation

See [amp-access-poool rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-access-poool/validator-amp-access-poool.protoascii) in the AMP validator specification.
