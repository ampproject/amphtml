# Media.net

Media.net adapter supports the integration of both, its Contextual Monetization solution and the Header Bidding solution.
The example listed below states the configuration and the implementation related details.

## Example

### Media.net Contextual Monetization

```html
<amp-ad
  width="300"
  height="250"
  type="medianet"
  data-tagtype="cm"
  data-cid="8CUS8O7EX"
  data-crid="112682482"
>
</amp-ad>
```

### Media.net Header Bidder

```html
<amp-ad
  width="300"
  height="250"
  type="medianet"
  data-tagtype="headerbidder"
  data-cid="8CU852274"
  data-slot="/45361917/AMP_Header_Bidder"
  json='{"targeting":{"mnetAmpTest":"1","pos":"mnetSlot1"}}'
>
</amp-ad>
```

## Configuration

### Dimensions

The ad size depends on the `width` and `height` attributes specified in the `amp-ad` tag. The `amp-ad` component requires the following mandatory HTML attributes to be added before parsing the Ad.

-   `width`
-   `height`
-   `type = "medianet"`

If you have questions, please feel free to reach out to your Media.net contact.

## Supported Parameters

### Media.net Contextual Monetization

**Mandatory Parameters**

-   `data-tagtype` - This parameter represents the product the publisher is using; It should be **`cm`** for our **Contextual Monetization solution**
-   `data-cid` - Represents the unique customer identifier
-   `data-crid` - Media.net Ad unit

**Optional Parameters**

-   `data-misc` - Accepts a json value & used to send additional data

### Media.net Header Bidder

**Mandatory Parameters**

-   `data-tagtype` - This parameter represents the product the publisher is using; It should be **`headerbidder`** for our **Header Bidding solution**
-   `data-cid` - Represents the unique customer identifier
-   `data-slot` - Ad unit as specified in DFP
-   `data-multi-size` - Multi-size support
-   `data-multi-size-validation` - Multi-size support

**Some of the parameters supported via Json attribute (DFP Parameters)**

-   `targeting`
-   `categoryExclusions`
-   `cookieOptions`
-   `tagForChildDirectedTreatment`
-   `targeting`

## Support

For further queries, please feel free to reach out to your contact at Media.net.

Otherwise you can write to our support team:
Email: **pubsupport@media.net**
