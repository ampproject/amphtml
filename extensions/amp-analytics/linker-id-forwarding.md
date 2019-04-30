### Linker ID Forwarding
#### Overview

Each linker will have an associated configuration object. `amp-analytics` uses this configuration to create a "linker string" which will be appended to the specified outgoing links on the page as URL param. When a user clicks on one of these links, the destination page then can read the linker string from the URL param to perform ID syncing. This is typically used to join user sessions across an AMP proxy domain and publisher domain.

This document outlines the configuration options that will determine in which contexts the linker parameter will append to outgoing links. The structure of the configuration object is illustrated below.


#### Format
```javascript
"linkers": {
  <paramName>: {
    ids: <Object>,
    proxyOnly: <boolean>,
    destinationDomains: <Array<string>>,
    enabled: <boolean>
  }
}
```

- `paramName` - This user defined name determines the name of the query parameter appended to the links.
- `ids` - An object containing key-value pairs that is partially encoded and passed along in the param.
- `proxyOnly` - (optional) Flag indicating whether the links should only be appended on pages served on a proxy origin. Defaults to `true`.
- `destinationDomains` - (optional) Links will be decorated if their domains are included in this array. Defaults to [`canonical`](https://github.com/ampproject/amphtml/blob/3b0feadab3b9b12ddb80edc9a30f959087134905/spec/amp-html-format.md#canon) and `source` domains. A link matching the exact same hostname will not be decorated unless specified in this array.c
- `enabled` - Publishers must explicity set this to `true` to opt-in to using this feature.

This linker uses this configuration to generate a string in this structure: `<paramName>=<version>*<checkSum>*<idName1>*<idValue1>*<idName2>*<idValue2>...` For more details see [Linker Param Format](./linker-id-receiving.md#Format)

#### Turning it on
The most common use case is simply enabling this feature for an analytics provider that is already supporting linkers. To do this you will add the `linkers` configuration object and the `enabled: true` entry to your already existing analytics tag.

```html
<amp-analytics type=foo-analytics>
  <script type="application/json">
    {
      ... // Optional preexisting configuration.
      "linkers" : {
        enabled: true
      }
    }
  </script>
</amp-analytics>
```

#### Advanced
An example of a config that grants more granular control may look like the example below:

```javascript
"linkers": {
  "linker1" : {
    "ids" : {
      "cid": "CLIENT_ID(_ga)",
      "uid" "QUERY_PARAM(uid)",
    },
    "proxyOnly" : false,
    "enabled": true,
  }
}
```
In this example configuration, the parameter would be appendend to any outgoing links matching the `source` or `canonical` domains that are not an exact hostname match. This is because the `destinationDomains` entry has been omitted and this is the default behavior. The example has `proxyOnly` set to `false`, this overrides the default behavior and indicates that the linker should manage outgoing links in all contexts this amp page might be served in. Finally, we have set `enabled` to be `true`. This is necessary to tell the runtime that we would like to enable this linker configuration.

#### Destination Domain Matching

If there is a linker configured on a page being served at the URL  `https://www-amp-example-com.cdn.ampproject.org/v/s/www.amp.example.com/amp/cool/story`, the canonical url is given as `https://www.example.com/cool/story` from the html on the page. (`<link rel="canonical" href="https://www.example.com/cool/story">`)

On this example page there could be several outlinks. We will assume that the `destinationDomains` entry has been omitted, and therefore the linker will fallback to the default behavior. The table below shows some of the cases in which the linker would append the param.

URL | Matches | Notes
--- | :---: | ---
`https://www.example.com/another/story` | yes | matches canonical hostname
`https://www.amp.example.com/foo` | yes | matches source hostname
`https://www.foo.example.com/bar` | no | not the same hostname
`https://www.google.com` | no | different domain

Note that this is the default behavior when the `destinationDomains` array is not specified. You may always add additional domains to match in this array.

##### Wildcard Domain Matching

It is common that a publisher will want to match a few different subdomains or TLDs. To make this set up easier linker supports wildcard domain matching. To enable this functionality you can use the `*` character to match any arbtrary string.

For example: you may have a site `example.com` that links to both `a.example.com` and `b.example.com`. You could include both of these domains inside your `destinationDomains` config, but the wildcard feature allows you to add
```json
"destinationDomains": ["*.example.com"]
```
Using this configuration links to both `a.example.com` and `b.example.com` will be decorated. Similarily, you may want to decorate links to `example.co`, `example.co.uk`, and `example.fr`. This can be accomplished using the config below.
```json
"destinationDomains": ["example.*"]
```
It is important to note that wildcard matching will respect the `.` and not decorate links where the `.` is not present. In the example above a link to `examplefoo.com` would not be decorated, while `example.foo.com` would be decorated.

#### Default configuration
Some items in the configuration objects have default values. However, you may override these values at the `amp-analytics` element level to suit your use case. The values will be merged and the more specific configuration will take precedence over their parents. Keep in mind these defaults are set only for the `linkers` object in which they are defined. If you have multiple `amp-analytics` elements on your page you will need to set the configuration for each top level linkers object you wish to enable.

Example:
```javascript
"linkers": {
  "enabled": true, // This enables all child linkers contained in this object.
  "proxyOnly" : false,
  "linker1" : {
    "ids" : {
      "cid": "CLIENT_ID(_ga)",
    }
  },
  "linker2" : {
    "proxyOnly": true
    "ids" : {
      "gid": "CLIENT_ID(foo)",
    }
}
```

In the above example `linker2` would be appended only on the proxy, while `linker1` would be shown in all contexts as defined in the parent config.
