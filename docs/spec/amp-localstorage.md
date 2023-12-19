# LocalStorage Usage in AMP

AMP relies on the AMP Viewer's support to use localStorage when the AMP page is embedded in a Viewer. This is because localStorage set within a cross domain iframe is not persisted in some browsers.

## AMP Viewer's Support

The AMP Viewer declares its support to the localStorage API by setting the the url param `storage` to `true`. If so the AMP Viewer must support the following APIs.

In the case where there the AMP doc is served from origin without an AMP Viewer, or the AMP Viewer doesn't support the localStorage API. `window.localStorage` will be used as fallback.

### Storage API

Information entry can be passed between the AMP page and the supported AMP Viewer through postMessages. And the AMP Viewer will be responsible to store the info in the top level window localStorage.

| Message     | Description                                                                            | Request                                | Response                                                                      |
| ----------- | -------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| `loadStore` | Requests the local storage blob for the document's origin.                             | {'origin': (string)}                   | {'blob': (string)}                                                            |
| `saveStore` | Requests that the specified blob is stored to local storage for the document's origin. | {'origin': (string), 'blob': (string)} | undefined (The response resolves once the blob has been successfully stored.) |

### Data Format

localStorage entry will be formatted as following

```js
const entry = {
  'key': {
    'v': 'value',
    't': timestamp,
  },
};
blob = btoa(JSON.stringify(entry));
```

## Current Usage

The following AMP components and service are using the localStorage.

\*\* Please add all future usage to the following list

-   `<amp-ad-network-adsense-impl>` : Store publisher ad size opt in status.
-   `<amp-app-banner>` : Store the user decision on dismiss banner
-   `<amp-user-notification>` : Store the user decision on dismiss notification
-   `<amp-consent>` : Store the user decision and granular information on consent
-   Client ID Service : Store the user decision to opt-out CID service.
-   Consent Instance : Store the user consent decision.

## Guidance on localStorage Usage in AMP

The localStorage can be used by future AMP components or services with valid reasons to store info client side.

There are a few guidelines to follow due to localStorage implementation in AMP and AMP Viewer.

### Privacy Policy

Entries can be sent to the AMP Viewer and stored in the top level window. No personal identifiable information would be allowed to comply with our privacy policy. We require that the storage entry to be structured with source code checked into the open source library. Neither the storage key or the value can be calculated externally.

### Storage Policy

All entries will be stored in the top level window domain, which has limited localStorage space. AMP may enforce some size restrictions based on individual usage.

Please also note that AMP Viewers may have their own size limitation and implementation to expire or clear localStorage entry. The localStorage value will be handled at best effort.

## Use localStorage in AMP

To use localStorage in AMP, please [file an I2I issue](https://github.com/ampproject/amphtml/issues/new?assignees=&labels=INTENT+TO+IMPLEMENT&template=intent-to-implement.yml) and explain the localStorage usage case and how the storage entry will be calculated. Then ask @ampproject/wg-approvers for a review.

When a usage gets approved and implemented, please update the [Current Usage session](#current-usage) for future reference.
