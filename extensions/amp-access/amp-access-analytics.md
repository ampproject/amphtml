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

# <a name="amp-access-analytics"></a>AMP Access and Analytics

## Access analytics triggers

Access service issues events for major states in the access flow. These events can be reported through the analytics configuration by using triggers.

See [amp-analytics.md](../amp-analytics/amp-analytics.md) for details on *amp-analytics* configuration.

### Authorization received trigger (`"on": "access-authorization-received"`)

The `access-authorization-received` event is issued when the Authorization endpoint has succeeded. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "accessAuthorizationReceived": {
    "on": "access-authorization-received",
    "request": "event"
  }
}
```

### Authorization received trigger (`"on": "access-authorization-failed"`)

The `access-authorization-failed` event is issued when the Authorization endpoint has failed. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "accessAuthorizationFailed": {
    "on": "access-authorization-failed",
    "request": "event"
  }
}
```

### Access view registered trigger (`"on": "access-viewed"`)

The `access-viewed` event is issued when the access system considers the page viewed and right before pingback is sent. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "accessViewed": {
    "on": "access-viewed",
    "request": "event"
  }
}
```

### Pingback sent trigger (`"on": "access-pingback-sent"`)

The `access-pingback-sent` event is issued when the Pingback endpoint has succeeded. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "accessPingbackSent": {
    "on": "access-pingback-sent",
    "request": "event"
  }
}
```

### Pingback failed trigger (`"on": "access-pingback-failed"`)

The `access-pingback-failed` event is issued when the Pingback endpoint has failed. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "accessPingbackFailed": {
    "on": "access-pingback-failed",
    "request": "event"
  }
}
```

### Login started trigger (`"on": "access-login[-type]-started"`)

The `access-login[-type]-started` event is issued right before the Login dialog has been opened. Use these configurations to fire a request for this event.

When only one Login URL is configured, the event is `access-login-started`. When multiple Login URLs are configured, the event is `access-login-type-started`, e.g. "access-login-signup-started". See [Login Page Spec](./amp-access-spec.md#login-page) for more info.

```javascript
"triggers": {
  "accessLoginStarted": {
    "on": "access-login-started",
    "request": "event"
  }
}
```

### Login success trigger (`"on": "access-login[-type]-success"`)

The `access-login[-type]-success` event is issued when Login dialog has succeeded. Use these configurations to fire a request for this event.

When only one Login URL is configured, the event is `access-login-success`. When multiple Login URLs are configured, the event is `access-login-type-success`, e.g. "access-login-signup-success". See [Login Page Spec](./amp-access-spec.md#login-page) for more info.

```javascript
"triggers": {
  "accessLoginSuccess": {
    "on": "access-login-success",
    "request": "event"
  }
}
```

### Login rejected trigger (`"on": "access-login[-type]-rejected"`)

The `access-login[-type]-rejected` event is issued when Login dialog has been rejected by the user. Use these configurations to fire a request for this event.

When only one Login URL is configured, the event is `access-login-rejected`. When multiple Login URLs are configured, the event is `access-login-type-rejected`, e.g. "access-login-signup-rejected". See [Login Page Spec](./amp-access-spec.md#login-page) for more info.

```javascript
"triggers": {
  "accessLoginRejected": {
    "on": "access-login-rejected",
    "request": "event"
  }
}
```

### Login failed trigger (`"on": "access-login[-type]-failed"`)

The `access-login[-type]-failed` event is issued when Login dialog has failed due to an unknown reason. Use these configurations to fire a request for this event.

When only one Login URL is configured, the event is `access-login[-type]-failed`. When multiple Login URLs are configured, the event is `access-login-type-failed`, e.g. "access-login-signup-failed". See [Login Page Spec](./amp-access-spec.md#login-page) for more info.

```javascript
"triggers": {
  "accessLoginFailed": {
    "on": "access-login-failed",
    "request": "event"
  }
}
```

## Access analytics variables

Access contributes the following URL substitutions to the [amp-var-substitutions.md](/spec/amp-var-substitutions.md).

### ACCESS_READER_ID

The `ACCESS_READER_ID` variable is substituted with the Reader ID used for access operations. This is a sensitive ID and care should be taken in sharing it. Please ensure that any data you pass to a third party complies with its terms of service.

### AUTHDATA(field)

The `AUTHDATA(field)` variable is substituted with the value of the field in the authorization response. The nested fields are allowed, such as `AUTHDATA(nested.field)`.

This variable will wait until authorization is complete before being available.

Data contained in `AUTHDATA` may be sensitive and care should be taken in sharing it. Please ensure that any data you pass to a third party complies with its terms of service.
