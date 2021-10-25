---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Displays a dismissable notification to the user.
---

# amp-user-notification

## Usage

An `id` is required because multiple `amp-user-notification` elements are allowed and the `id` is used to differentiate them.

By supplying two URLs that
get called before the notification is shown and after it is dismissed,
it is possible to control per user as to whether the notification should
be shown (using the `ampUserId` value).
For example, it could only be shown to users in certain geolocations or
prevent showing it again to the user when they've dismissed it before.
If these URLs are not specified, the dismissal state will be queried
and/or stored locally to determine whether to show the notification to
the user.

To close `amp-user-notification`, add an `on` attribute to a button with the
following value scheme `on="event:idOfUserNotificationElement.dismiss"`
(see example below). This user action also triggers the `GET` to the
`data-dismiss-href` URL. Be very mindful of the browser caching the `GET` response; see details below in the [`data-show-if-href`](<#data-show-if-href-(optional)>) section. (We recommend
adding a unique value to the `GET` url like a timestamp as a query string field).

When multiple `amp-user-notification` elements are on a page, only one is shown
at a single time (Once one is dismissed the next one is shown).
The order of the notifications being shown is currently not deterministic.

```html
<amp-user-notification
  layout="nodisplay"
  id="amp-user-notification1"
  data-show-if-href="https://foo.com/api/show-api?timestamp=TIMESTAMP"
  data-dismiss-href="https://foo.com/api/dismissed"
>
  This site uses cookies to personalize content.
  <a href="">Learn more.</a>
  <button on="tap:amp-user-notification1.dismiss">I accept</button>
</amp-user-notification>
```

A notification is shown when:

1. There's no record locally that the user has dismissed the notification with the
   specified ID.
2. When specified, `data-show-if-href` endpoint returns `{ "showNotification": true }`.

When notification is dismissed:

1. AMP stores the "dismiss" record locally for the specified ID. This will prevent the
   notification from being shown again.
2. When specified, `data-dismiss-href` is invoked and can be used to make the "dismiss"
   record remotely.

### JSON Fields

-   `elementId` (string): The HTML ID used on the `amp-user-notification` element.
-   `ampUserId` (string): This ID is passed to both the `data-show-if-href` GET request
    (as a query string field) and the `data-dismiss-href` POST request (as a json field).
    The ID will be the same for this user going forward, but no other requests
    in AMP send the same ID.
    You can use the ID on your side to lookup/store whether the user has
    dismissed the notification before.
-   `showNotification` (boolean): Indicates whether the notification should be shown. If `false`, the promise associated to the element is resolved right away.

### Delaying Client ID generation until the notification is acknowledged

Optionally, you can delay generation of Client IDs used for analytics and similar purposes until an `amp-user-notification` is confirmed by the user. See these docs for how to implement this:

-   [CLIENT_ID URL substitution](../../docs/spec/amp-var-substitutions.md#client-id)
-   [`amp-ad`](https://amp.dev/documentation/components/amp-ad)
-   [`amp-analytics`](https://amp.dev/documentation/components/amp-analytics)

## Attributes

### data-show-if-href (optional)

When specified, AMP will make a CORS GET request with credentials to the specified URL to determine whether the notification should be shown. AMP appends the `elementId` and `ampUserId` query string fields to the href provided
on the `data-show-if-href` attribute (see [#1228](https://github.com/ampproject/amphtml/issues/1228) on why this is a GET instead of a POST).

As a best practice to not let the browser cache the GET response values, you should add
a [`TIMESTAMP` url replacement](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-var-substitutions.md) value to the `data-show-if-href` attribute value.
You can add it as a query string field (e.g.,
`data-show-if-href="https://foo.com/api/show-api?timestamp=TIMESTAMP"`).

If the `data-show-if-href` attribute is not specified, AMP will only check if the notification with the specified ID has been "dismissed" by the user locally. If not, the notification will be shown.

[tip type="read-on"]
For handling CORS requests and responses, see the [AMP CORS spec](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests).
[/tip]

**CORS GET request** query string fields: `elementId`, `ampUserId`

```http
https://foo.com/api/show-api?timestamp=1234567890&elementId=notification1&ampUserId=cid-value
```

**CORS GET response** JSON fields: `showNotification`. The response must contain a single JSON object with a `showNotification` field of type boolean. If this field is `true`, the notification will be shown, otherwise it won't.

```json
{"showNotification": true}
```

### data-show-if-geo

When specified `amp-user-notification` will only trigger if an `amp-geo` country group for matches one of the comma delimited list of country groups.

In the example below, if the user is located in Mexico (`mx`) the `amp-geo` will return the `nafta` country group. `nafta` is in the `data-show-if-geo` attribute so the notification will display.

```html
<amp-geo layout="nodisplay">
  <script type="application/json">
    {
      "ISOCountryGroups": {
        "nafta": ["ca", "mx", "us"],
        "waldo": ["unknown"],
        "anz": ["au", "nz"]
      }
    }
  </script>
</amp-geo>

<amp-user-notification
  layout="nodisplay"
  id="amp-user-notification1"
  data-show-if-geo="nafta, anz"
  data-dismiss-href="https://example.com/api/echo/post"
>
  This notice is only shown in Canada, Mexico and USA.
  <a class="btn" on="tap:amp-user-notification1.dismiss">I accept</a>
</amp-user-notification>
```

### data-show-if-not-geo

This is the opposite of `data-show-if-geo`. When specified `amp-user-notification` will only trigger if the `amp-geo` country group does not match the supplied list.

In this example user in Mexico would not trigger the notification, but a user in an unknon country (assigned to the `whereIsWaldo` group) would trigger the notifcation.

```html
<amp-geo layout="nodisplay">
  <script type="application/json">
    {
      "ISOCountryGroups": {
        "nafta": ["ca", "mx", "us"],
        "whereIsWaldo": ["unknown"],
        "anz": ["au", "nz"]
      }
    }
  </script>
</amp-geo>

<amp-user-notification
  layout="nodisplay"
  id="amp-user-notification1"
  data-show-if-not-geo="anz, nafta"
  data-dismiss-href="https://example.com/api/echo/post"
>
  This notice is only shown in Canada, Mexico and USA.
  <a class="btn" on="tap:amp-user-notification1.dismiss">I accept</a>
</amp-user-notification>
```

Only one `data-show-if-*` attribute may be set.

##### data-dismiss-href (optional)

When specified, AMP will make a CORS POST request to the specified URL transmitting the `elementId` and `ampUserId` only when the user has explicitly agreed.

If this attribute is not specified, AMP will not send a request upon dismissal, and will only store the "dismissed" flag for the specified ID locally.

[tip type="read-on"]
For handling CORS requests and responses, see the [AMP CORS spec](https://www.ampproject.org/docs/fundamentals/amp-cors-requests).
[/tip]

**POST request** JSON fields: `elementId`, `ampUserId`

Use the `ampUserId` field to store that the user has seen the notification before, if you want to avoid showing it in the future. It's the same value that
will be passed in future requests to `data-show-if-href`.

```json
{"elementId": "id-of-amp-user-notification", "ampUserId": "ampUserIdString"}
```

**POST response** should be a 200 HTTP code and no data is expected back.

### data-persist-dismissal (optional)

By default, this is set to `true`. If set to `false`, AMP will not remember the user's dismissal of the notification. The notification
will always show if the `data-show-if-href` result is show notification. If no `data-show-if-href` is provided
the notification will always show.

Example 1:

```html
<amp-user-notification
  layout="nodisplay"
  id="amp-user-notification5"
  data-persist-dismissal="false"
  data-show-if-href="https://example.com/api/shouldShow?timestamp=TIMESTAMP"
  data-dismiss-href="https://example.com/api/echo/post"
>
  This notification should ALWAYS show - if shouldShow endpoint response was
  true.
  <a href="#learn-more">Learn more.</a>
  <button on="tap:amp-user-notification5.dismiss">Dismiss</button>
</amp-user-notification>
```

Example 2:

```html
<amp-user-notification
  layout="nodisplay"
  id="amp-user-notification6"
  data-persist-dismissal="false"
>
  This notification should ALWAYS show on every page visit.
  <a href="#learn-more">Learn more.</a>
  <button on="tap:amp-user-notification6.dismiss">Dismiss</button>
</amp-user-notification>
```

### enctype (optional)

By default, this is set to `application/json;charset=utf-8`. But you can set it to `application/x-www-form-urlencoded`, AMP will send the post dismiss request using this content type instead.

```html
<amp-user-notification
  layout="nodisplay"
  id="amp-user-notification7"
  enctype="application/x-www-form-urlencoded"
  data-persist-dismissal="false"
  data-show-if-href="https://example.com/api/shouldShow?timestamp=TIMESTAMP"
  data-dismiss-href="https://example.com/api/echo/post"
>
  This notification should ALWAYS show - if shouldShow endpoint response was
  true.
  <a href="#learn-more">Learn more.</a>
  <button on="tap:amp-user-notification7.dismiss">Dismiss</button>
</amp-user-notification>
```

## Actions

The `amp-user-notification` exposes the following actions that you can use [AMP on-syntax to trigger](https://amp.dev/documentation/guides-and-tutorials/learn/amp-actions-and-events):

### dismiss (default)

Closes the user notification.

## Styling

The `amp-user-notification` component should always have `layout=nodisplay`
and will be `position: fixed` after layout (default is bottom: 0, which can be overridden).
If a page has more than one `amp-user-notification` element, then the notifications
are queued up and only shown when the previous notification has been dismissed.

The `amp-active` (visibility: visible) class is added when the notification is displayed and removed when the notification has been dismissed.
`amp-hidden` (visibility: hidden) is added when the notification has been dismissed.

For example, you can hook into these classes for a "fade in" transition.

Example: w/o vendor prefixes

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

amp-user-notification.amp-active {
  opacity: 0;
  animation: fadeIn ease-in 1s 1 forwards;
}
```

## Validation

See [amp-user-notification rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-user-notification/validator-amp-user-notification.protoascii) in the AMP validator specification.
