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

### <a name="amp-social-share"></a> `amp-social-share`

<table>
   <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Displays a social share button.</td>
  </tr>
   <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>
      <a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a>
       or <code>AMP.toggleExperiment('amp-social-share')</code> (if #development=1 is enabled)
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td>
      <div>
        <code>&lt;script async custom-element="amp-social-share" src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js">&lt;/script></code>
      </div>
    </td>
  </tr>
   <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/social-share.amp.html">social-share.amp.html</a>
    </td>
  </tr>
</table>

#### The simplest example:
The share button guesses some defaults for you. It assumes that the current window location is the URL you want to share and the page title is the text you want to share.
```html
<amp-social-share type="twitter" width="60" height="44">
</amp-social-share>
```

#### Simple Examples:
When you want to configure the share content, you can specify ```data-<attribute>``` configuration.
```html
<amp-social-share type="linkedin" width="60" height="44"
  data-text="Hello world"
  data-url="https://example.com/"
  data-attribution="AMPhtml">
</amp-social-share>
```
*or*

You can embed a ```script``` tag with JSON configuration.
```html
<amp-social-share type="pinterest" width="60" height="44">
  <script type="application/json">
    {
      "text": "Hello world",
      "url": "https://example.com/",
      "attribution": "AMPhtml"
    }
  </script>
</amp-social-share>
```

#### Customized views:
Sometimes you want to provide your own style. In this instance, you can embed an anchor without a ```href``` and it will be populated. This provides you the flexibility to build your own UI for the share button.
```html
<amp-social-share type="linkedin" width="60" height="44" data-text="The AMP Project" data-url="https://www.ampproject.org/" data-attribution="amphtml">
  <a id="customized-social-share" class="custom"><img src="http://example.com/image.jpg"/></a>
</amp-social-share>
```
*or*

You can include any additional document structure around the anchor, so long as you don't specify the ```href```.
```html
<amp-social-share type="linkedin" width="60" height="44">
  <script type="application/json">
    {
      "text": "The AMP Project",
      "url": "https://www.ampproject.org/",
      "attribution": "amphtml"
    }
  </script>
  <div class="my-style">
    <a id="customized-social-share" class="custom"><img src="http://example.com/image.jpg"/></a>
  </div>
</amp-social-share>
```

### Structure

Required attributes are `type`, `width` and `height`. Some [types (social providers)](#user-content-types) require specific fields for their integration. For instance Facebook requires you include your ```app_id``` (as ```attribution```), failure to this attribute for ```type="facebook"``` will result in an error.

AMP adds a class name `amp-social-share-<type>` to the extension, where `<type>` is the value provided in the `type` attribute. For example the social-share extension for twitter would have the classname `amp-social-share-twitter`. This class could be used as a hook for styling using CSS. 

You can embed an `anchor` tag _without a_ ```href``` into the element for the extension to provide the href for you. This enables customization of the social share element.
Also an arbitrary amount of AMP compatible HTML can be added within the element to provide any hooks for styling. AMP won't add `amp-social-share-<type>` classname when anchor element is provided. 

### Types

The builtin supported types are configured in [AMP Social Share Config](0.1/amp-social-share-config.js). Below are the possible types and their configuration options:
- twitter
  - url `optional` (defaults: `rel=canonical` URL)
  - text
  - attribution
- facebook
  - attribution `required` (Your `app_id`)
  - url `optional` (defaults: `rel=canonical` URL)
- pinterest
  - url `optional` (defaults: `rel=canonical` URL)
  - text
  - image
- linkedin
  - url `optional` (defaults: `rel=canonical` URL)
  - text
  - attribution
- gplus
  - url `optional` (defaults: `rel=canonical` URL)
- email
  - text (email subject)`optional` (defaults: `''`)
  - url (email body) `optional` (defaults: `rel=canonical` URL)

As you can see, they use a common set of attribute names which are translated into specifics for the service. Note the required elements for each of the types - the most common is the URL which you'll want to include for the share to be of use.
