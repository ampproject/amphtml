---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Allows users to subscribe to web push notifications.
---
<!--
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

# amp-web-push

Allows users to subscribe to <a href="https://developers.google.com/web/fundamentals/engage-and-retain/push-notifications/">web push notifications</a>.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-web-push" src="https://cdn.ampproject.org/v0/amp-web-push-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fixed</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/amp-web-push.amp.html">amp-web-push.amp.html</a></td>
  </tr>
</table>

## Behavior

Developers compose widgets that appear based on a user's subscription state. Widgets are composed of AMP elements and can be as simple as a button or a text link.

*Example*

Clicking the subscription widget pops up a page prompting the user for notification permissions and signals the service worker (configured below) to subscribe the user to push in the background. Clicking the unsubscription widget signals the worker to unsubscribe the user from push in the background.

```html
<!-- A subscription widget -->
<amp-web-push-widget visibility="unsubscribed" layout="fixed" width="250" height="80">
  <button on="tap:amp-web-push.subscribe">Subscribe to Notifications</button>
</amp-web-push-widget>

<!-- An unsubscription widget -->
<amp-web-push-widget visibility="subscribed" layout="fixed" width="250" height="80">
  <button on="tap:amp-web-push.unsubscribe">Unsubscribe from Notifications</button>
</amp-web-push-widget>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>visibility (required)</strong></td>
    <td>Describes when the widget is shown. The value can be one of <code>unsubscribed</code>, <code>subscribed</code>, or <code>blocked</code>.<br>
Widgets are initially hidden while the user's subscription state is computed.</td>
  </tr>

</table>

## Configuration

The `amp-web-push` component requires extra integration on your site. You will need to upload two HTML files (provided) on your site as well as an amp-web-push compatible service worker JavaScript file. These three files form the configuration described below.

```html
<amp-web-push
  helper-iframe-url="https://example.com/helper-iframe.html"
  permission-dialog-url="https://example.com/permission-dialog.html"
  service-worker-url="https://example.com/service-worker.js"
></amp-web-push>
```

All properties are <strong>required</strong>, and all URLs must begin with the same origin (e.g. `https://example.com`).

<table>
  <tr>
    <th class="col-fourty">Property</th>
    <th class="col-fourty">Description</th>
  </tr>
  <tr>
    <td><code>helper-iframe-url</code></td>
    <td>
    <p>
      <a href="https://cdn.ampproject.org/v0/amp-web-push-helper-frame.html">Download <code>helper-iframe.html</code> here</a> and upload it to your site.
    </p>
    <p>
      The absolute URL, starting with <code>https://</code>, to the <code>helper-iframe.html</code> provided HTML file uploaded to your site.
    </p>
    <p>
      This page enables communication between the AMP page and the service worker which subscribes and unsubscribes the user. This page also helps determines the notification permission status.
    </p>
    </td>
  </tr>
  <tr>
    <td><code>permission-dialog-url</code></td>
    <td>
    <p>
      <a href="https://cdn.ampproject.org/v0/amp-web-push-permission-dialog.html">Download <code>permission-dialog.html</code> here</a> and upload it to your site.
    </p>
    <p>
      The absolute URL, starting with <code>https://</code>, to the <code>permission-dialog.html</code> provided HTML file uploaded to your site.
    </p>
    <p>
      This page opens as a pop up and prompts for notification permissions.
    </p>
    </td>
  </tr>
  <tr>
    <td><code>service-worker-url</code></td>
    <td>
      <p>
        The absolute URL, starting with <code>https://</code>, to the JavaScript service worker file uploaded to your site. Use a service worker compatible with amp-web-push.
      </p>
      <p>
         If possible, make the service worker available at the root of your site (e.g. your-site.com/service-worker.js) instead of a subfolder. amp-web-push is restricted to working at the same folder level (subfolders included) the service worker is uploaded to unless the service worker is served with an HTTP response header of <code>Service-Worker-Allowed: /</code>.
      </p>
      <p>
        This service worker runs in the background and subscribes and unsubscribes the user from notifications.
      </p>
      <p>
         If you develop a custom push solution, <a href="https://github.com/ampproject/amphtml/blob/master/extensions/amp-web-push/0.1/amp-web-push.service-worker.js">see this example on how to make your service worker compatible with amp-web-push</a>.
       </p>
    </td>
  </tr>
  <tr>
    <td><code>service-worker-scope (optional)</code></td>
    <td>
      <p>
        The scope of the service worker to be installed.
      </p>
    </td>
  </tr>
</table>

## Validation
See [amp-web-push rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-web-push/validator-amp-web-push.protoascii) in the AMP validator specification.
