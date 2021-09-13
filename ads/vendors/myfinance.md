# MyFinance

Serves ads from [MyFinance](https://www.myfinance.com/).

## Example

### Widgets

#### Dynamic based on page content

```html
<amp-ad
  type="myfinance"
  data-selector="myfi-content-end"
  data-ad-type="widget"
>
</amp-ad>
```

#### Static from a Creative Set

```html
<amp-ad
  type="myfinance"
  data-creative-set="27cdb25b-5df4-4aca-8ef2-f63fd874e1f1"
  data-ad-type="widget"
>
</amp-ad>
```

#### Static Widget

```html
<amp-ad
  type="myfinance"
  data-widget="0aec0151-4fa2-47cc-abfc-13d4f9861b7a"
  data-ad-type="widget"
>
</amp-ad>
```

### CRU

```html
<amp-ad
  type="myfinance"
  data-campaign="test-campaign"
  data-ad-type="cru"
>
</amp-ad>
```

## Configuration

### Widgets

#### Required parameters

-   `data-ad-type` - set to `widget`

#### Widgets require one of the following parameters to be set

-   `data-selector` - corresponds to the div id on the canonical page that has dynamic ads configured
-   `data-creative-set` - the id of the creative set to pull ads from
-   `data-widget` - the id of the widget to serve

#### Optional parameters

-   `data-sub-id` - pass through for a partner sub id

### Content Recommendation Unit

#### Required parameters

-   `data-ad-type` - set to `cru`
-   `data-campaign` - set to a valid campaign

#### Optional parameters

-   `data-selector` - corresponds to the div id on the canonical page that has a pre-rendered cru configured
