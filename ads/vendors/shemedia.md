# SHE Media

Your site must be an active member of the [SHE Media Partner Network](http://www.shemedia.com). Please contact [Support](mailto:support@shemedia.com) for specific tags for your site and information on configuration semantics.

## Examples

```html
<amp-ad
  width="300"
  height="250"
  type="shemedia"
  data-slot-type="medrec"
  data-boomerang-path="/amp-example/26403"
  json='{"boomerangConfig": {"vertical": "parenting"}, "targeting":{"abc":["xyz"]}}'
>
</amp-ad>
```

## Configuration

### Required parameters

-   `data-slot-type` - SHE Media slot type.
-   `data-boomerang-path` - Boomerang path.

### Optional parameters

-   `json` - Boomerang configuration key values can be passed using the `boomerangConfig` property. Custom targeting key values can be passed to Boomerang using the `targeting` property.

### Support

Please contact support@shemedia.com with any questions.
