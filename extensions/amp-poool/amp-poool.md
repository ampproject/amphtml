<!---
Copyright 2017 The AMP HTML Authors.

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

# <a name=”amp-poool></a> `amp-poool`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>
      Displays a Poool paywall<br />.
      See <a href="http://poool.fr">poool.fr</a> and <a href="http://demo.poool.fr">demo.poool.fr</a> for more details.
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-poool" src="https://cdn.ampproject.org/v0/amp-poool-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>responsive</td>
  </tr>
</table>

[TOC]

## Examples

### Basic paywall (with poool default values)

```html
<amp-poool
  layout="responsive"
  width="150"
  height="80"
  data-app-id="XXXXX-XXXXX-XXXXX-XXXXX"
  data-page-view="premium">
</amp-poool>
```

If you decide to let basic configuration like above, don't forget to set on your article:
- data-poool : (integer) Percent of text you want to be hidden/stripped.
- data-poool-mode : (string) The method used by Poool.js to lock the content of your post.
For more informations, check our [documentation](https://dev.poool.fr/doc/sdk).


### Custom paywall (you can override every configs & styles)

```html
<amp-poool
  layout="responsive"
  width="150"
  height="80"
  data-app-id="XXXXX-XXXXX-XXXXX-XXXXX"
  data-page-view="premium"
  data-debug="true"
  data-poool-mode="excerpt"
  data-poool="80"
  data-post-container="#need-poool-custom"
  data-force-widget="gift"
  data-main-color="#ffc400"
  data-background-color="#ffc400"
  data-brand-logo="https://cdn.poool.fr/uploads/57ffab6c756a8cf24356d0c2/sudouest.jpg">
</amp-poool>
```

If you decide to set your own custom configuration, you can change absolutely all config and style attributes.
To custom everything as you want, check our [documentation](https://dev.poool.fr/doc/sdk).
Find the attribute you want to change.

Example :
- You read the doc and decide to change "force_widget" config variable.
- Just set a new attribute in your amp-poool tag : data-force-widget="video".
- **Notice that you have to set amp-poool tag attribute with "-" symbol instead of "_" one.**


### Custom paywall : Configure events
To learn more about events, please check our [documentation](https://dev.poool.fr/doc/sdk#events).

First, add an attribute named "events" to your amp-poool tag. His value has to be a json script id.
Check the following example :

Update your amp-poool tag with "data-events" attribute. "poool-custom-events" is the json script id.

```html
<amp-poool
  layout="responsive"
  width="150"
  height="80"
  data-app-id="XXXXX-XXXXX-XXXXX-XXXXX"
  data-page-view="premium"
  data-debug="true"
  data-poool-mode="excerpt"
  data-poool="80"
  data-post-container="#need-poool-custom"
  data-events="poool-custom-events">
</amp-poool>
```

Then create your json script and set your events :

```html
<script id="poool-custom-events" type="application/ld+json">
    {
        "on_lock": "function() { console.log('Content Locked !'); }",
        "on_release": "function(e) { console.log('Released with widget ' + e.widget + ' !'); console.log('Enjoy your premium article !'); }",
        "on_adblock": "function() { console.log('An adblocker has been detected !');}"
    }
</script>
```


## Required attributes
### Both required:

**app-id**

Your App ID (key given by Poool).

**page-view**

Used to tell Poool a page has been visited by current user.
Check our [documentation](http://dev.poool.fr/doc/sdk#page_view).


## Optional attributes

Amp-poool extension does't need more attribute to work properly on your page.
- [Config](https://dev.poool.fr/doc/sdk#configuration) variables are optional
- [Style](https://dev.poool.fr/doc/sdk#styles) variables are optional
- [Event](https://dev.poool.fr/doc/sdk#events) configurations are optional
- [Actions](https://dev.poool.fr/doc/sdk) variables are optional (except page-view who is required)


Don't forget to check our [documentation](https://dev.poool.fr/doc/sdk) before configuring amp-poool.

## Study mode

If you want poool as study mode to begin, don't forget to finish your amp-poool tag with "conversion" attribute set on "true".
"Conversion" is used to tell Poool when a normal user has been converted into a subscribed one.
Once again, check our [documentation](https://dev.poool.fr/doc/sdk) on second tab ("I'll first do a study").

## Validation

See [amp-poool rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-poool/validator-amp-poool.protoascii) in the AMP validator specification.
