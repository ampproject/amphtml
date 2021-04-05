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

# SourcePoint

Integrate the Sourcepoint CMP into your AMP website by using the `amp-consent` component, and inserting the proper attributes in the `amp-consent` component tags.

## Example
```html
<amp-consent id='consent' layout='nodisplay' >
   <script type="application/json">
       {
          "consentRequired": "remote",
          "consentInstanceId": "SourcePoint",
          "checkConsentHref": "https://sp-cdn.example.com/wrapper/tcfv2/v1/amp-v2",
          "promptUISrc": "https://sp-cdn.example.com/amp/index.html?authId=CLIENT_ID",
          "postPromptUI": "consent-ui",
          "uiConfig": {"overlay":true},
          "clientConfig": {
              "accountId": 222,
              "mmsDomain": "https://sp-cdn.example.com",
              "propertyHref": "https://amp.property.tcfv2",
              "propertyId": 1234,
              "privacyManagerId": 987654,
              "isTCFV2": true,
              "pmTab": "purposes",
              "stageCampaign": false,
              "targetingParams": {
                  "color": "red"
              }
           }
	   }
   </script>
</amp-consent>
```

## Notes

### `consentRequired`

This tells the AMP consent component to use code from a remote source. This should always be set to "remote".

### `consentInstanceId`

This tells the AMP consent component to use the Sourcepoint code. This should always be set to "sourcepoint".

### `checkConsentHref`

This URL will check the end-user's consent. The format of the URL path is `https://{CNAME SUBDOMAIN}/wrapper/tcfv2/v1/amp-v2` where `{CNAME SUBDOMAIN}` would be replaced by the CNAME subdomain record created.

### `promptUISrc`

This URL will return the post prompt user interface where end-users can change their consent. The path should always be set to `https://{CNAME SUBDOMAIN}/amp/index.html` where `{CNAME SUBDOMAIN}` would be replaced by the CNAME subdomain record previously created.

Please include the `?authId=CLIENT_ID` url parameter in the promptUISrc entry. This will allow consent preferences to be saved when your users arrive from a search.

### `postPromptUI`

This is the page element that should be displayed to users to provide end-users with the ability to change their consent after they initially consent.

### `uiConfig`

An optional parameter that adds a light black overlay to the site behind the message experience. Can be used to deter end-user scrolling without engaging with your consent experience.

## Configuration (`clientConfig`)

| Attribute        |  Type  | Mandatory | Description                                                                                                          |
| ---------------- | :----: | :-------: | -------------------------------------------------------------------------------------------------------------------- |
| accountId        | Number |    yes    | This corresponds with your Sourcepoint account ID.                                                                   |
| mmsDomain        | String |    yes    | This is the domain that will communicate with the Sourcepoint messaging service. The format for the path of this parameter is https://{CNAME SUBDOMAIN} where {CNAME SUBDOMAIN} would be replaced by the CNAME subdomain record previously created.                                               |
| propertyHref     | String |    yes    | This is the property created in the Sourcepoint UI that contains the message, scenario, partition and campaign. The property name should be preceded by the `https://` protocol. For example, a property defined as `amp.property.tcfv2` in the UI should have a propertyHref parameter of `https://amp.property.tcfv2`.                                                                  |
| propertyId       | Number |    yes    | The ID of the property on which the message is supposed to be served. You can get the property from the address bar at the end of the URL.                                                        |
| privacyManagerId | Number |    yes    | The ID of the privacy manager to be associated with the postPromptUI element. The ID of the privacy manager can be obtained from the Privacy Manager builder. |      
| isTCFV2          |  Bool  |    yes    | Indicates that the implementation is for TCF v2 |
| pmTab            | String |    yes    | Determines which section of the privacy manager opens when the button is clicked. Values can be set to either `purposes` or `vendors` |
| stageCampaign    |  Bool  |    no     | Indicates if the campaign to load is staging or published. The default value is `false`, meaning published campaign. |
| targetingParams  | Object |    no     | A collection of key values to be used in the scenario manager.                                                       |

## Resuface Privacy Manager

By placing a button or link to your Privacy Manager on your property configuration, you allow end-users to manage their consent preferences on an ongoing basis without having to re-encounter your organization's First Layer message. The Privacy Manager can be resurfaced by adding the following `on` attribute to a link or button on your property:

```html
on="tap:consent.prompt(consent=SourcePoint)"
```

Examples can be found below:

```html
//Link Example
<a on="tap:consent.prompt(consent=SourcePoint)" target="_self" href="#" id="consent-ui">Privacy Settings</a>

//Button Example
<div id="consent-ui">
    <button on="tap:consent.prompt(consent=SourcePoint)">Privacy Settings</button>
</div>
```

## Getting Help

For more information on how to integrate AMP to your page please visit our [support portal](https://documentation.sourcepoint.com/web-implementation/amp-implementation-section) or contact your account manager directly.
