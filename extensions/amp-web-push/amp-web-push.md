---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Allows users to subscribe to web push notifications.
---

# amp-web-push

## Usage

Developers compose widgets that appear based on a user's subscription state. Widgets are composed of AMP elements and can be as simple as a button or a text link.

Clicking the subscription widget pops up a page prompting the user for notification permissions and signals the service worker (configured below) to subscribe the user to push in the background. Clicking the unsubscription widget signals the worker to unsubscribe the user from push in the background.

```html
<!-- A subscription widget -->
<amp-web-push-widget
  visibility="unsubscribed"
  layout="fixed"
  width="250"
  height="80"
>
  <button on="tap:amp-web-push.subscribe">Subscribe to Notifications</button>
</amp-web-push-widget>

<!-- An unsubscription widget -->
<amp-web-push-widget
  visibility="subscribed"
  layout="fixed"
  width="250"
  height="80"
>
  <button on="tap:amp-web-push.unsubscribe">
    Unsubscribe from Notifications
  </button>
</amp-web-push-widget>
```

### Configuration

The `amp-web-push` component requires extra integration on your site. You will need to upload two HTML files (provided) on your site as well as an amp-web-push compatible service worker JavaScript file. These three files form the configuration described below.

```html
<amp-web-push
  layout="nodisplay"
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
         If you develop a custom push solution, <a href="https://github.com/ampproject/amphtml/blob/main/extensions/amp-web-push/0.1/amp-web-push.service-worker.js">see this example on how to make your service worker compatible with amp-web-push</a>.
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

## Attributes

### visibility (required)

Describes when the widget is shown. The value can be one of `unsubscribed`, `subscribed`, or `blocked`.

Widgets are initially hidden while the user's subscription state is computed.

## Validation

See [amp-web-push rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-web-push/validator-amp-web-push.protoascii) in the AMP validator specification.
