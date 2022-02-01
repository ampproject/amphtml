# Improve Digital

Please refer to [Improve Digital Help Center](https://improvedigital.zendesk.com/hc/en-us) for more
information on how to get the required placement IDs and [optional] keyvalue cases.

## Example

### Simple ad tag

```html
<amp-ad
  width="300"
  height="250"
  type="improvedigital"
  data-placement="869276"
  data-optin="y"
>
</amp-ad>
```

### Ad tag with keyvalues

```html
<amp-ad
  width="300"
  height="250"
  type="improvedigital"
  data-placement="869276"
  data-optin="y"
  data-keyvalue="gender=woman&age=10-15"
>
</amp-ad>
```

### Supported parameters

-   `placement`: mandatory
-   `optin`
-   `keyvalue`: Fill in the keyvalues as written in the example.
