# OnNetwork

## Examples

### Simple movie tag with `data-sid`

```html
<amp-ad width="800" height="450" type="onnetwork" data-sid="Hhhhh993jdkal">
</amp-ad>
```

### Movie placement with `data-mid`

```html
<amp-ad width="800" height="450" type="onnetwork" data-mid="Jjs9298dhfkla">
</amp-ad>
```

### Ad tag or placement with `src`

```html
<amp-ad
  width="800"
  height="450"
  type="onnetwork"
  src="https://video.onnetwork.tv/embed.php?ampsrc=1&sid=HHq0298djlakw"
>
</amp-ad>
```

## Configuration

Please refer to [OnNetwork Help](https://www.onnetwork.tv) for more
information on how to get required movie tag or placement IDs.

### Supported parameters

Only one of the mentioned parameters should be used at the same time.

-   `data-sid`
-   `data-mid`
-   `src`: must use https protocol and must be from one of the
    allowed OnNetwork hosts.
