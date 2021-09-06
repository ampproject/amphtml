# Revcontent

## Example

```html
<amp-ad
  width="400"
  height="260"
  layout="responsive"
  type="revcontent"
  heights="(max-width: 320px) 933px,
      (max-width: 360px) 1087px,
      (max-width: 375px) 1138px,
      (max-width: 412px) 1189px,
      (max-width: 414px) 1072px,
      (max-width: 568px) 1151px,
      (max-width: 640px) 1128px,
      (max-width: 667px) 1151px,
      (max-width: 732px) 1211px,
      (max-width: 736px) 1151px,
      (max-width: 768px) 633px,
      (max-width: 1024px) 711px,
      86vw"
  data-wrapper="rcjsload_2ff711"
  data-id="203"
>
  <div placeholder="">Loading ...</div>
</amp-ad>
```

## Configuration

For semantics of configuration, please see [Revcontent's documentation](https://faq.revcontent.com/).

Supported parameters:

-   `data-id`
-   `data-revcontent`
-   `data-env`
-   `data-wrapper`
-   `data-endpoint`
-   `data-ssl`
-   `data-testing`
-   `data-loadscript`
-   `data-sub-ids`

## Auto-sizing of Ads

Revcontent's AMP service will be updated to support resizing of ads for improved rendering, no additional tag parameters are required at this time.
