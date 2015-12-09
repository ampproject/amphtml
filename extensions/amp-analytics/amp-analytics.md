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

**Remote configs**: This config is loaded in the page via a URL. The URL can be specified in the `config` attribute of the `amp-analytics` tag.
**Inline configs**: This config is specified directly on the AMP page inside the `amp-analytics` tag.
**Built in configs**: The AMP platform has these configs built into the platform. These can be loaded onto the page via the `type` attribute on the `amp-analytics` tag.

If more than one methods of specifying the config are used, the configs are merged together in the order above (highest to lowest precedence).


##### <a name="inline"></a>Inline Config with a custom host & url format
```javascript
<amp-analytics>
{
  "host": "my-analytics.com:8080",
  "requests": {
    "base_hit": "/collect?v=1&_v=a0&aip=true&_s=HIT_COUNT&dl=DOMAIN&dt=TITLE&sr=SCREEN_WIDTHxSCREEN_HEIGHT&ht=TIMESTAMP&cid=CLIENT_IDENTIFIER&tid=ACCOUNT"
    "pageview": "/r/{base_hit}&t=pageview&_r=1"
  }
  "vars": {
    "account_id": "123456",
  }
  "triggers": [{
    "on": "LOAD",
    "request": "pageview"
  }]
}
</amp-analytics>
```
##### <a name="builtin"></a>Built-in tag for a service `XYZ` with inline config

```javascript
<amp-analytics type="xyz">
{
  "vars": { "account_id": "123456" }
  "triggers": [{
    "on": "LOAD",
    "request": "pageview"
  }]
}
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
-  **requests**: This is a mapping of request name to request format. The request name is used in triggers defined below to specify the format that should be used to send the analytics data to the server. The request format uses the same format as [Amp Var Substitution](https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md).
- **vars**: This property is a mapping of variable name to variable value. The values are then used to construct the requests from the request format strings.
- **triggers**: This array defines the events that cause analytics data to be sent from the page. It can contain following properties:
    -  **on**: This property defines the type of event that results in this trigger to be fired. Typically, a hit will be sent out based on the request property whenever this event fires.
    -  **request**: The name of the request that was defined in the requests block to be used as the format string for the analytics data to be sent.
    -  **vars**: This property is same as the property of same name in parent block. Values specified here take precedence over the values specified in the platform and the parent block. 


#### <a name="attributes"></a>Attributes

**type**
This optional attribute can be specified to use one of the built-in analytics providers. Currently supported types:
- `googleanalytics`: This type defines the basic requests like `pageview`,  `event`, `social` and `timing`.

**config**
This attribute can be used to load a configuration from some remote url. The url specified here should use https scheme.
