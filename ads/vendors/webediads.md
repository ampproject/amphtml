# Webedia Adserver

Private ad system deployed for all Webedia websites.

## One call method

This method allow you to call one ad position with a specific configuration.

### Basic example

```html
<amp-ad
  width="300"
  height="250"
  type="webediads"
  data-site="site_test"
  data-page="amp"
  data-position="middle"
  data-query=""
>
</amp-ad>
```

### Query example

```html
<amp-ad
  width="300"
  height="250"
  type="webediads"
  data-site="site_test"
  data-page="amp"
  data-position="middle"
  data-query="amptest=1"
>
</amp-ad>
```

### Placeholder and fallback example

```html
<amp-ad
  width="300"
  height="250"
  type="webediads"
  data-site="site_test"
  data-page="amp"
  data-position="middle"
  data-query="amptest=1"
>
  <div placeholder>Loading...</div>
  <div fallback>No ad</div>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Supported parameters

All parameters are mandatory, only "query" can be empty.

-   `data-site` (String, non-empty)
-   `data-page` (String, non-empty)
-   `data-position` (String, non-empty)
-   `data-query` (String)
    -   `key` are separated with `&`
    -   `value` are separted with `|`
    -   **Example**: `key1=value1|value2|value3&key2=value4&key3=value5|value6`
