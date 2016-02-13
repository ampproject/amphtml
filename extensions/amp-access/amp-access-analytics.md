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

### <a name="amp-access-analytics"></a>AMP Access and Analytics

Experiment: "amp-access-analytics" should be enabled via https://cdn.ampproject.org/experiments.html or
`AMP.toggleExperiment('amp-access-analytics')`. See [Experiments Guide](../../tools/experiments/README.md).

An integration with *amp-analytics* is under development and can be tracked on [Issue #1556](https://github.com/ampproject/amphtml/issues/1556). This document will be updated when more details on the integration are available.

#### Access analytics triggers

Access service issues events for major states in the access flow. These events can be reported via an analytics package using triggers.

See [amp-analytics.md](../amp-analytics/amp-analytics.md) for details on *amp-analytics* configuration.

###### Authorization received trigger (`"on": "access-authorization-received"`)

The `access-authorization-received` event is issued when the Authorization endpoint has succeeded. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "accessAuthorizationReceived": {
    "on": "access-authorization-received",
    "request": "event"
  }
}
```

###### Authorization received trigger (`"on": "access-authorization-failed"`)

The `access-authorization-failed` event is issued when the Authorization endpoint has failed. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "accessAuthorizationFailed": {
    "on": "access-authorization-failed",
    "request": "event"
  }
}
```

###### Access view registered trigger (`"on": "access-viewed"`)

The `access-viewed` event is issued when the access system considers the page viewed and right before pingback is sent. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "accessViewed": {
    "on": "access-viewed",
    "request": "event"
  }
}
```

###### Pingback sent trigger (`"on": "access-pingback-sent"`)

The `access-pingback-sent` event is issued when the Pingback endpoint has succeeded. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "accessPingbackSent": {
    "on": "access-pingback-sent",
    "request": "event"
  }
}
```

###### Pingback failed trigger (`"on": "access-pingback-failed"`)

The `access-pingback-failed` event is issued when the Pingback endpoint has failed. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "accessPingbackFailed": {
    "on": "access-pingback-failed",
    "request": "event"
  }
}
```

###### Login started trigger (`"on": "access-login-started"`)

The `access-login-started` event is issued right before the Login dialog has been opened. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "accessLoginStarted": {
    "on": "access-login-started",
    "request": "event"
  }
}
```

###### Login success trigger (`"on": "access-login-success"`)

The `access-login-success` event is issued when Login dialog has succeeded. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "accessLoginSuccess": {
    "on": "access-login-success",
    "request": "event"
  }
}
```

###### Login rejected trigger (`"on": "access-login-rejected"`)

The `access-login-rejected` event is issued when Login dialog has been rejected by the user. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "accessLoginRejected": {
    "on": "access-login-rejected",
    "request": "event"
  }
}
```

###### Login failed trigger (`"on": "access-login-failed"`)

The `access-login-failed` event is issued when Login dialog has failed due to an unknown reason. Use these configurations to fire a request for this event.

```javascript
"triggers": {
  "accessLoginFailed": {
    "on": "access-login-failed",
    "request": "event"
  }
}
```
