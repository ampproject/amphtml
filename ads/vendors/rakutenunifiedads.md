# Rakuten Unified Ads

## Example

```html
<amp-ad width="300" height="250" type="rakutenunifiedads" data-id="63">
</amp-ad>
```

```html
<amp-ad
  width="300"
  height="250"
  type="rakutenunifiedads"
  data-id="63"
  data-env="dev"
  data-genre='{"master_id":1,"code":"100371","match":"children"}'
  data-ifa="DUMMY_IFA"
  data-targeting='{"k1":"string type","k2":["male", "female"]}'
>
</amp-ad>
```

## Configuration

### Required parameters

-   `data-id` : Your adspot id
-   `type` : fixed value `rakutenunifiedads`

### Optional parameters

-   `data-env` : Environment of server for Not production. e.g. `dev`, `stg`, `tst`
-   `data-genre` : Genre object
-   `data-ifa` : IFA string
-   `data-targeting` : Targeting object
-   `data-iscode` : ID type. 'true': `data-id` works as code

### Set id as adSpot code

-   `data-id` : Your code with `data-iscode`
-   `data-iscode` : ID type. 'true': id works as code

```html
<amp-ad
  width="300"
  height="250"
  type="rakutenunifiedads"
  data-id="aabbcc"
  data-iscode="true"
  data-env="dev"
>
</amp-ad>
```

### How to handle responsive design

Please refer to [Create responsive AMP pages](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/responsive_design/)

```html
<amp-ad
  width="300"
  height="250"
  type="rakutenunifiedads"
  data-id="63"
  data-env="dev"
  layout="responsive"
>
</amp-ad>
```
