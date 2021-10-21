# SmartAdServer

## Example

### Basic call

```html
<amp-ad
  width="320"
  height="50"
  type="smartadserver"
  data-site="94612"
  data-page="629154"
  data-format="38952"
  data-domain="https://<YourSmartAdServerDomain>"
>
</amp-ad>
```

### With targeting

```html
<amp-ad
  width="320"
  height="50"
  type="smartadserver"
  data-site="94612"
  data-page="629154"
  data-format="38952"
  data-target="foo=bar"
  data-domain="https://<YourSmartAdServerDomain>"
>
</amp-ad>
```

## Configuration

For `<YourSmartAdServerDomain>`, use the domain assigned to your network (e. g. www3.smartadserver.com); It can be found in Smart AdServer's config.js library (e.g., `http://www3.smartadserver.com/config.js?nwid=1234`).

For semantics of configuration, please see [Smart AdServer help center](http://help.smartadserver.com/).

### Supported parameters

All of the parameters listed here should be prefixed with "data-" when used.

| Parameter name | Description                         | Required |
| -------------- | ----------------------------------- | -------- |
| site           | Your Smart AdServer Site ID         | Yes      |
| page           | Your Smart AdServer Page ID         | Yes      |
| format         | Your Smart AdServer Format ID       | Yes      |
| domain         | Your Smart AdServer call domain     | Yes      |
| target         | Your targeting string               | No       |
| tag            | An ID for the tag containing the ad | No       |

Note: If any of the required parameters is missing, the ad slot won't be filled.
