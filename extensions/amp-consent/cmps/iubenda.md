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

# iubenda

iubenda makes your sites & apps legally compliant across multiple languages and legislations (including the GDPR) with lawyer-crafted, self-updating solutions. [Read our guide](https://www.iubenda.com/en/help/22135-cookie-solution-amp) to integrate our Cookie Solution in your AMP pages.

## Example

```html
<!-- Add the following to your document head. -->
<style amp-custom>
  .popupOverlay {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  amp-iframe {
    margin: 0;
  }
  
  amp-consent.amp-active {
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: fixed;
  }
</style>
```
```html
<amp-consent id="iubenda" layout="nodisplay" type="iubenda">
  <!--
    If you want to request consent only to EU users then replace "consentRequired": true with "promptIfUnknownForGeoGroup": "eu" -> allows to ask consent only to EU users.
  -->
  <script type="application/json">
    {
      "consentRequired": true,
      "promptUI": "iubenda-consent-ui"
    }
  </script>
  <div id="iubenda-consent-ui" class="popupOverlay">
        <!--
        	Set src attribute to your webpage with the CS for the AMP pages.
        	Note: it must be served over HTTPS
        	See https://cdn.iubenda.com/cs/test/cs-for-amp.html for an example on how to set a page to embed CS
      	-->
        <amp-iframe layout="fill" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" src="https://cdn.iubenda.com/cs/test/cs-for-amp.html">
            <div placeholder>Loading</div>
        </amp-iframe>
    </div>
</amp-consent>
```

## Contacts for future maintenance
@Facens, @Vasile-Peste