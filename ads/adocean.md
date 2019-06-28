<!---
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

# AdOcean

## Example

##### Single placement:
```html
<amp-ad width="300" height="250"
      type="adocean"
      data-ao-id="ado-bIVMPpCJPX0.5tjQbNyrWpnws_dbbTJ1fUnGjLeSqJ3.K7"
      data-ao-emitter="myao.adocean.pl"
      data-block-on-consent
      >
</amp-ad>
```

##### Master-Slave:
```html
<amp-ad width="300" height="250"
      type="adocean"
      data-ao-emitter="myao.adocean.pl"
      data-ao-master="FDyQKk0qN2a9SxwCMal6Eove..r_lvBE3pPfr_Ier9..f7"
      data-ao-id="adoceanmyaonhqnqukjtt"
      data-ao-keys="key1,key2,key3"
      data-block-on-consent
      >
</amp-ad>

<amp-ad width="300" height="250"
      type="adocean"
      data-ao-emitter="myao.adocean.pl"
      data-ao-master="FDyQKk0qN2a9SxwCMal6Eove..r_lvBE3pPfr_Ier9..f7"
      data-ao-id="adoceanmyaokiheeseoko"
      data-ao-keys="key1,key2,key3"
      data-block-on-consent
      >
</amp-ad>
```

Do not define different values for slaves within one master for paramerters: data-ao-keys, data-ao-vars and data-block-on-consent. Otherwise, the behavior will be non-deterministic.

## Configuration

For details on the configuration semantics, see [AdOcean documentation](http://www.adocean-global.com).

### Required parameters

- `data-ao-id` - Ad unit unique id
- `data-ao-emitter` - Ad server hostname

### Optional parameters

- `data-ao-mode` - sync|buffered - processing mode
- `data-ao-preview` - livepreview configuration id
- `data-ao-keys` - additional configuration, see adserver documentation, do not define different values for slaves within one master
- `data-ao-vars` - additional configuration, see adserver documentation, do not define different values for slaves within one master
- `data-ao-clusters` - additional configuration,see adserver documentation
- `data-ao-master` - unique id of master placement

## User Consent Integration

When [user consent](https://github.com/ampproject/amphtml/blob/master/extensions/amp-consent/amp-consent.md#blocking-behaviors) is required. AdOcean ad approaches user consent in the following ways:

- `CONSENT_POLICY_STATE.SUFFICIENT`: Serve a personalized ad to the user.
- `CONSENT_POLICY_STATE.INSUFFICIENT`: Serve a non-personalized ad to the user.
- `CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED`: Serve a personalized ad to the user.
- `CONSENT_POLICY_STATE.UNKNOWN`: Serve a non-personalized ad to the user.

