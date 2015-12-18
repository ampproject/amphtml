<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

**This extension is still a work in progress. Details below can change.**

### <a name="amp-analytics"></a> `amp-analytics`

A generic framework to collect and send analytics data to multiple analytics vendors.

#### <a name="behavior"></a>Behavior

`<amp-analytics>` tag can be used to define events of interest, collect analytics data and then send it off to any URL.

This tag provides built-in support for most widely used analytics services. In addition, the tag allows for the analytics config to be specified such that the analytics data can be sent to any specified URL is a custom format.

The tag is driven by JSON config that can be specified in one of the three places:

**Remote configs**: This config is loaded in the page via a URL. The URL can be specified in the `config` attribute of the `amp-analytics` tag. Work is still in progress for this type of configs.

**Inline configs**: This config is specified directly on the AMP page inside a script tag inside the `amp-analytics` tag.

**Built in configs**: The AMP platform has these configs built into the platform. These can be loaded onto the page via the `type` attribute on the `amp-analytics` tag.

If more than one methods of specifying the config are used, the configs are merged together in the order above (highest to lowest precedence).


##### <a name="inline"></a>Inline Config with a custom host & url format
```javascript
<amp-analytics>
<script type="application/json">
{
  "host": "my-analytics.com:8080",
  "requests": {
    "base_hit": "/collect?v=1&_s=${hitCount}&dl=${domain}${path}&dt=${title}&sr=${screenWidth}x${screenHeight}&ht=${timestamp}&account=${accountId}"
    "pageview": "/r/${base_hit}&t=pageview"
  }
  "vars": {
    "accountId": "123456",
  }
  "triggers": [{
    "on": "LOAD",
    "request": "pageview"
  }]
}
</script>
</amp-analytics>
```
##### <a name="builtin"></a>Built-in tag for a service `XYZ` with inline config

```javascript
<amp-analytics type="xyz">
<script type="application/json">
{
  "vars": { "accountId": "123456" }
  "triggers": [{
    "on": "LOAD",
    "request": "pageview"
  }]
}
</script>
</amp-analytics>
```

##### <a name="remote"></a>Remote config

```html
<amp-analytics
  config="my-config.com/pub=123456"></amp-analytics>
```

####  <a name="format"></a>Config Format

At the top level, the config has following properties:
- **host**: This is the domain:port pair to which the data is going to be sent.
-  **requests**: This is a mapping of request name to request format. The request name is used in triggers defined below to specify the format that should be used to send the analytics data to the server.
- **vars**: This property is a mapping of variable name to variable value. The values are then used to construct the requests from the request format strings.
- **triggers**: This array defines the events that cause analytics data to be sent from the page. It can contain following properties:
    -  **on**: This property defines the type of event that results in this trigger to be fired. Typically, a hit will be sent out based on the request property whenever this event fires.
    -  **request**: The name of the request that was defined in the requests block to be used as the format string for the analytics data to be sent.
    -  **vars**: This property is same as the property of same name in parent block. Values specified here take precedence over the values specified in the platform and the parent block. 


#### <a name="vars-substitution"></a>Variable Substitution and Formatting
Variables can be specified in multiple places in the analytics config. Some of the variables are predefined by the platform. In addition, variables can also be defined, overridden or cleared by the config. Values set at the top level get applied to all the triggers and the values specified inside a trigger only apply to that trigger. The values of variables get encoded before the substitution using `encodeURIComponent`. The precedence for variable values is in the order trigger.vars > config.vars > platform defined vars.

To use a variable that has been defined, the ES6 template format ${varName} can be used. This format can be used inside request strings as follows:

```javascript
{
  "requests": {
    "request_1": "/foo=${foo}&bar=${bar}&${baz}",
    "request_2": "/alt${request_1}"
  }
}
```
To define a variable, add it to the vars object at top level or inside a trigger as follows:

```javascript
{
  "vars": {"foo": "f1", "bar": "b1@#", "baz": "b2" }
  "triggers": [{
    // Trigger 1 details
    "vars": { "foo": "f2", "bar": "" }
  },
  {
    // Trigger 2 details
    "vars": { "baz": "b3" }
  }]
}
```

For the config above, the values of `${foo}`, `${bar}` and `${baz}` will be 'f2', ''(empty value) and 'b3' for Trigger 1 and 'f1', 'b1%40%23' and 'b3' for Trigger 2.

##### <a name="platform-vars"></a> Platform Vars
All the variables defined in [AMP HTML URL Variable Substitutions](https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md) doc are supported by `amp-analytics` tag. In addition, amp-analytics provides a camel-case format for all those variables as follows:

**random**: Provides a random value each time a value is requested.

**canonicalUrl/canonicalHost/canonicalPath**: Provides the canonical URL, host and path of the current document if available.

**documentReferrer**: Provides the document referrer for the current document.

**title**: Provides the title of the document.

**ampdocUrl/ampdocHost**: Provides the url and path of the document.

**pageViewId**: Provides a value that aims to be unique per URL, user and day.

**clientId**: Provides a value that can be used as an anonymous identifier for a user.

**timestamp**: Provides the timestamp when a value is requested.

**timezone**: Provides the timezone of the user as reported by the useragent.

**scrollTop/scrollLeft/scrollWidth/scrollHeight**: Provides the current scroll related values.

**screenWidth/screenHeight**: Provides the dimensions of the screen as reported by the useragent.


#### <a name="attributes"></a>Attributes

**type**
This optional attribute can be specified to use one of the built-in analytics providers. Currently supported types:
- `googleanalytics`: This type defines the basic requests like `pageview`,  `event`, `social` and `timing`.

**config**
This attribute can be used to load a configuration from some remote url. The url specified here should use https scheme.
