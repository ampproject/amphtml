<!---
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

# opencmp

## Example

```html
<amp-consent id="consent" layout="nodisplay" type="opencmp">
  <script type="application/json">
    {
      "postPromptUI": "opencmp-consent-prompt-ui"
    }
  </script>
  <div id="opencmp-consent-prompt-ui">
    Post Prompt UI
    <button on="tap:consent.prompt(consent=opencmp)" role="button">
      Privacy Settings
    </button>
  </div>
</amp-consent>
```

## Notes

### `postPromptUI`

The value of `postPromptUI` should be the id of the html tag in which the consent ui will be attached to. In our example above, the value of `postPromptUI` is `opencmp-consent-prompt-ui` since we have a div with that id.

### Opening the Privacy Manager

Notice in the example above, we have a `button` with the attribute `on="tap.consent.prompt(consent=opencmp)"`. The id of your `<amp-consent>` element is relevant here. Notice how the id of our `<amp-consent>` is `consent`, that's why the `on` attribute has the value "tap.**consent**.prompt(consent=opencmp)"

## Getting Help

For more information on how to integrate AMP to your page please contact your account manager directly.
