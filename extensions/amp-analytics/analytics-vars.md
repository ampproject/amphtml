# <a name="amp-analytics"></a> Variables supported in `amp-analytics`

Use the format `${varName}` in a request string for a page or platform-defined variable. The `amp-analytics` tag will replace the template with its actual value at the time of construction of the analytics request.

Since the request that is constructed is sent over HTTP, the request needs to be encoded. To achieve this, the `var` values are url-encoded using [`encodeUrlComponent`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) before being inserted into the request.

## Variable definitions

Vars can be defined by the platform, in the config at the top level, inside the triggers or in a remote config, as shown in this example.

```html
<amp-analytics config="http://example.com/config.json">
  <script type="application/json">
    {
      "requests": {
        "pageview": "https://example.com/analytics?url=${canonicalUrl}&title=${title}&acct=${account}&clientId=${clientId(cid-scope)}",
      },
      "vars": {
        "account": "ABC123",
        "title": "Homepage"
      },
      "triggers": {
        "some-event": {
          "on": "visible",
          "request": "pageview",
          "vars": {
            "title": "My homepage",
            "clientId": "my user"
          }
      }
    }
  </script>
</amp-analytics>
```

## Variables as data attribute

For the following event types, variables can be passed as part of the element level data attribute

-   visible
-   click

The variables passed as data attributes should follow the format `data-vars-*`.

Example:

`<span id="test1" class="box" data-vars-event-id="22"> Click here to generate an event </span>`

And in the request url the token would be of the format `${eventId}` (follows camelcase).

When the same `var` is defined in multiple locations, the value is picked in the order remote config > element level data attributes > triggers > top level > platform. Thus, if the remote config defined `clientId` as `12332312` in the example above, the values of various vars will be as follows:

| var          | Value                                  | Defined by       |
| ------------ | -------------------------------------- | ---------------- |
| canonicalUrl | `https://example.com/path/to/the/page` | Platform         |
| title        | My homepage                            | Trigger          |
| account      | ABC123                                 | Top level config |
| clientId     | 12332312                               | Remote config    |

## Variables

For a list of variables supported in `amp-analytics`, see [Variable Substitutions](../../docs/spec/amp-var-substitutions.md). These variables may be substituted as well as nested within each other. For example, a variable that is substituted to

```javascript
{
  "request": {
    "base": "example.com/${nested}${nested2}"
  },
  "vars": {
    "nested": "QUERY_PARAM(foo,QUERY_PARAM(bar,default))",
    "nested2": "abc"
  }
}
```

will resolve to `default` if `foo` and `bar` are not parameters.

One known caveat is when substituting a variable for a macro (not including its argument list), where the argument list contains macros with arguments:

```javascript
{
  "request": {
    "base": "example.com/${a(1,TIMEZONE_CODE)}${a(RANDOM,$NOT(true))}"
  },
  "vars": {
    "a": "QUERY_PARAM"
  }
}
```

This will result in the first QUERY_PARAM working as intended but the second QUERY_PARAM will not get parsed corretly due to the second pair of parenthesis from the macros within.

Similar to this, another restriction is nesting analytics variables within each other:

`${queryParam(${title},${canonicalUrl})}`

Instead, use the platform version (or a combination):

`QUERY_PARAM(TITLE,${myVariable})`
