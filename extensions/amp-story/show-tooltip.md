---
$category@: presentation
formats:
  - stories
teaser:
  - A pop-up that shows up before navigating away from the current AMP story page.
---

<!--
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

# show-tooltip

## Usage
Tooltips allow users a second-click confirmation before navigating to linked content that takes them away from the current AMP story page. `show-tooltip` is an attribute that can be added to any link on an AMP story page.

<amp-img alt="AMP Story tooltip" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/amp-story-tooltip.gif" width="240" height="480">
  <noscript>
    <img alt="AMP Story tooltip" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/amp-story-tooltip.gif" />
  </noscript>
</amp-img>

```html
<amp-story-page id="fill-template-title">
    <amp-story-grid-layer template="vertical">
        <h1>fill</h1>
        <div style="position: absolute; top:50%; left: 0; right: 0; height: 200px; background-color: aqua">
            <a href="https://www.google.com"  show-tooltip="auto" style="height:100px; position:absolute;">
                <span>span inside div > a[show-tooltip="auto"]</span>
            </a>
        </div>
        <a href="https://www.google.com"  show-tooltip="auto" style="position:absolute; bottom:15px">
            <span>This is a link in the bottom 20% of grid-layer using [show-tooltip]="auto"</span>
        </a>
    </amp-story-grid-layer>
</amp-story-page>
```

### Attribute Values

Links with `show-tooltip` attribute can have the following values:
<ul>
  <li><code>show-tooltip="true"</code> [default]: No matter where on the screen it is, the link should trigger a tooltip.</li>
  <li><code>show-tooltip="auto"</code>: The story format determines whether a tooltip should be displayed. The story format currently calculates that links in the bottom 20% of a page do not show a tooltip, but this calculation could change over time.</li>
  <li>Note: <code>show-tooltip="false"</code> is **not** supported. Instances where the story format enforces tooltip display for links cannot be overriden.</li>
</ul>