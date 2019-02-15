# <a name="amp-viewer-assistance"></a> amp-viewer-assistance

[TOC]

<!---
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Amp-viewer-assistance provides assistive behaviors on AMP pages facilitated by a viewer. Messages are passed between the amp-viewer-assistance extension and the external viewer as outlined below.</td>
  </tr>
  <tr>
    <td><strong>Availability</strong></td>
    <td>Stable</td>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td>
      <div>
        <code>&lt;script async custom-element="amp-viewer-assistance" src="https://cdn.ampproject.org/v0/amp-viewer-assistance-0.1.js">&lt;/script></code>
      </div>
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Element</strong></td>
    <td>
        <code> &lt;script id="amp-viewer-assistance" type="application/json">&lt;/script></code>
    </td>
  </tr>
</table>

## Supported Functions

The `amp-viewer-assistance` extension currently has two functions that can be invoked via AMP expressions. For example, you may invoke the signIn function on a button tap:

```html
<button on="tap:amp-viewer-assistance.signIn">
  Sign In
</button>
```

<table>
  <tr>
    <th>Function Name</th>
    <th>Description</th>
  </tr>
  <tr>
    <td class="col-fourty"><code>signIn</code></td>
    <td>The <code>amp-viewer-assistance</code> extension sends a message to the viewer to sign in expecting an identity token back.</td>
  </tr>
  <tr>
    <td class="col-fourty"><code>updateActionState</code></td>
    <td>A function to send a message to the outer viewer representing a state change. Should contain an argument of the resulting state change.</td>
  </tr>
</table>

## Messages Sent

There are several messages that can be sent from the amp-viewer-assistance extension to the external viewer. 

<table>
  <tr>
    <th>Message Name</th>
    <th>Description</th>
  </tr>
  <tr>
    <td class="col-fourty"><code>viewerAssistanceConfig</code></td>
    <td>A message containing the initial json config within the <code>amp-viewer-assistance</code> element. This message is sent during the extension's initialization.</td>
  </tr>
  <tr>
    <td class="col-fourty"><code>requestSignIn</code></td>
    <td>Requests for a sign in from the viewer expecting a string identity token back from the viewer. Passes a json argument with a property <code>providers</code> containing an array of identity providers. Currently only supports <code>actions-on-google-gsi</code>.</td>
  </tr>
  <tr>
    <td class="col-fourty"><code>getAccessTokenPassive</code></td>
    <td>Similar to requestSignIn however, only requests for the identity token instead of a fresh sign in. Passes a json argument with a property <code>providers</code> containing an array of identity providers. Currently only supports <code>actions-on-google-gsi</code>.</td>
  </tr>
  <tr>
    <td class="col-fourty"><code>updateActionState</code></td>
    <td>A message representing a change in state. Can be sent with an argument payload.</td>
  </tr>
</table>

## Events Triggered

In order to act upon a successful sign in from the viewer assistance, a `signedIn` event is emitted from the `amp-viewer-assistance` script element. On the element, an expression can be attached via the `on` attribute. In this example, we are showing a success message after a user has signed in:

```html
<script id="amp-viewer-assistance" type="application/json" on="signedIn:success-message.show">
{
  "myConfigItem1": {
    "foo": 123,
    "bar": 456,
  },
}
</script>
<div id="success-message" hidden>
  Successfully Signed In!
</div>
```

<table>
  <tr>
    <th>Event Name</th>
    <th>Emitting Element</th>
    <th>Description</th>
  </tr>
  <tr>
    <td class="col-fourty"><code>signedIn</code></td>
    <td><code>amp-viewer-assistance</code> </td>
    <td>An action emitted upon a successful signIn by the external viewer.</td>
  </tr>
</table>

## Identity Class

Upon a successful sign in or identity token retrieval, a `amp-viewer-assistance-identity-available` class will be attached to the root element of the AMP document. This can be used to manipulate elements with compound CSS classes.

In this example, we have a message telling the user they are signed out. If the identity is available through the extension, the message's `display` attribute will be overwritten to `display:none`.

```css
.signedOutMessage {
  display: block;
}

.amp-viewer-assistance-identity-available .signedOutMessage {
  display: none;
}
```

## Example

Wrapping up the above, here is an example implementation of a page utilizing sign in, as well as an `updateActionState` after a form submission.

```html
<script id="amp-viewer-assistance" type="application/json" on="signedIn:success-message.show">
{
  "myConfigItem1": {
    "foo": 123,
    "bar": 456,
  },
}
</script>
<button on="tap:amp-viewer-assistance.signIn">
  Sign In
</button>
<div id="success-message" hidden>
  Successfully Signed In!
</div>
<div id="signed-out-message">
  Signed Out!
</div>

<form id="state-change-form"
    method="POST"
    action-xhr="myRemoteXhr/endpoint"
    on="submit-success:amp-viewer-assistance.updateActionState(update=event.response)">
</form>
<button on="tap:state-change-form.submit">
  Change State
</button>
```
