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

## Example

```html
<amp-consent id="consent" layout="nodisplay" type="SourcePoint">
  <script type="application/json">
    {
      "postPromptUI": "my-consent-prompt-ui",
      "clientConfig": {
        "accountId": 22,
        "siteName": "amp.demo",
        "siteId": 4400,
        "privacyManagerId": "5d566301ab45d123ed973688",
        "stageCampaign": false,
        "authId": "MY-UUID",
        "targetingParams": {
          "foo": "bar"
        }
      }
    }
  </script>
  <div id="my-consent-prompt-ui">
    Post Prompt UI
    <button on="tap:consent.prompt(consent=SourcePoint)" role="button">
      Privacy Settings
    </button>
  </div>
</amp-consent>
```

## Notes

### `postPromptUI`

The value of `postPromptUI` should be the id of the html tag in which the consent ui will be attached to. In our example above, the value of `postPromptUI` is `my-consent-prompt-ui` since we have a div with that id.

### Opening the Privacy Manager

Notice in the example above, we have a `button` with the attribute `on="tap.consent.prompt(consent=SourcePoint)"`. The id of your `<amp-consent>` element is relevant here. Notice how the id of our `<amp-consent>` is `consent`, that's why the `on` attribute has the value "tap.**consent**.prompt(consent=SourcePoint)"

## Configuration (`clientConfig`)

| Attribute        |  Type  | Mandatory | Description                                                                                                          |
| ---------------- | :----: | :-------: | -------------------------------------------------------------------------------------------------------------------- |
| accountId        | Number |    yes    | Your account id can be found in the SP's dashboard.                                                                  |
| siteName         | String |    yes    | The name of the site you used in the SP's dashboard. eg. `example.com`                                               |
| siteId           | Number |    yes    | The siteId can be found in the PrivacyManager page.                                                                  |
| privacyManagerId | String |    yes    | The privacyManagerId can be found in the PrivacyManager page.                                                        |
| stageCampaign    |  Bool  |    no     | Indicates if the campaign to load is staging or published. The default value is `false`, meaning published campaign. |
| authId           | String |    no     | If a `authId` is present, we'll try to find the consent profile for that user if she/he has one stored.              |
| targetingParams  | Object |    no     | A collection of key values to be used in the scenario manager.                                                       |

## Getting Help

For more information on how to integrate AMP to your page please visit our [help portal](http://help.sourcepoint.com/en) or contact your account manager directly.
