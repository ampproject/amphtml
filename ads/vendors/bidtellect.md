# Bidtellect

## Example

```html
<amp-ad
  width="320"
  height="200"
  type="bidtellect"
  data-t="20bc0442-8vec-41f8-9892-04be6e6c3521"
  data-pid="815676411"
  data-sid="234022"
>
</amp-ad>
```

## Configuration

For details on the configuration semantics, contact [Bidtellect](mailto:technology@bidtellect.com).

### Required parameters

-   `data-t`: Parent publisher security token.
-   `data-pid`: The unique identifier for your placement.
-   `data-sid`: Unique identifier for the site.

### Optional Parameters:

-   `data-sname`: Name of site that corresponds to the Site ID.
-   `data-pubid`: Unique identifier for the publisher.
-   `data-pubname`: Name of publisher that corresponds to the Publisher ID.
-   `data-renderid`: Unique identifier of the placement widget.
-   `data-bestrender`: Provides the best size and cropping for the placement.
-   `data-autoplay`: Enables autoplay for video placements.
-   `data-playbutton`: Onscreen play button for video placements.
-   `data-videotypeid`: Defines how it will be rendered the video player.
-   `data-videocloseicon`: Enable close button on the video player.
-   `data-targetid`: Allows the placement to render inside a target HTML element.
-   `data-bustframe`: Allows the placement to bust out of nested iframes recursively.
