# Outbrain

## Example installation of the Outbrain widget

The examples below must be accompanied by AMP-enabled widgets delivered by Outbrain’s Account Management Team, do not directly install this code with existing widgets.

### Basic

```html
<amp-embed
    width="100"
    height="100"
    type="outbrain"
    layout="responsive"
    data-widgetIds="AMP_1,AMP_2"
>
</amp-embed>
```

### Example code running our widget with a CMP & amp-consent module

```html
<amp-embed
    width="100"
    height="100"
    type="outbrain"
    layout="responsive"
    data-block-on-consent
    data-widgetIds="AMP_1"
>
</amp-embed>
```

### Sticky Ad

```html
<amp-sticky-ad layout="nodisplay">
    <amp-ad width="300" height="100" type="outbrain" data-widgetids="AMP_1">
    </amp-ad>
</amp-sticky-ad>
```

Note that `<amp-sticky-ad />` component requires the following script to be included in the page:

```html
<script
    async
    custom-element="amp-sticky-ad"
    src="https://cdn.ampproject.org/v0/amp-sticky-ad-1.0.js"
></script>
```

See [AMP documentation](https://amp.dev/documentation/components/amp-sticky-ad) for more information regarding `<amp-sticky-ad />` component.

## Configuration

For details on the configuration semantics, please contact Outbrain’s Account Management Team.\
These configurations are relevant for both `<amp-ad />` and `<amp-embed />`.

### Required parameters

-   `data-widgetIds`: Widget Id/s Provided by Account Manager.

### Optional parameters

-   `data-htmlURL`: The URL of the standard html version of the page.
-   `data-ampURL`: The URL of the AMP version of the page.
-   `data-styleFile`: Provide publisher an option to pass CSS file in order to inherit the design for the AMP displayed widget. **Consult with Account Manager regarding CSS options**.
-   `data-block-on-consent`: Set this attribute without value in case you are using a CMP & the amp-consent module in order to make sure the consent info gets passed to the Outbrain widget correctly.

### User Consent handling

Outbrains AMP widgets are fully compliant with the european data protection regulations GDPR. For all users from the EU you should use a Consent Management Platform (CMP) to get the users consent decision. The widget will react to the consent information from the CMP and serve personalized widgets only if the provided TC string grants the right to do so.
If no TC string gets passed (because the widget is loaded before the user has made a choice or due to a wrong CMP implementation), the implementation code will render a non-personalized widget.

While on regular pages Outbrain can access the user consent information directly from the CMP this info needs to get passed from the CMP to the widget element through the amp-consent module. In order to be able to send a personalized widget Outbrain needs to get the consent info (incl. the consent string) passed to it’s shared data object.

If you are serving the Outbrain AMP widget to EU Users please make sure that:

-   you have a IAB complaint CMP properly setup on your page together with the amp-consent module
-   you have added Outbrain to your approved vendors for your CMP (Outbrains Vendor ID is 164) with purposes 1-10 allowed
-   The CMP is properly connected to the amp-consent module (follow your CMP provider instructions)
-   you add the data-block-on-consent attribute to the amp-embed widget element

Furthermore we encourage you to make sure that the widget does not get loaded before the user has made his choice through your CMP!
If this can’t be done you can also make sure that you send a TC String with non consent as a default value - in this case OB will be serving a non-personalized widget until the user has made a different choice. Please contact your CMP on how to set the no consent string for those cases.

You’ll find more information on the official amp-consent documentation:
https://amp.dev/documentation/components/amp-consent/

## Troubleshooting

### Widget is cut off

According to the AMP API, "resizes are honored when the resize will not adjust the content the user is currently reading. That is, if the ad is above the viewport's contents, it'll resize. Same if it's below. If it's in the viewport, it ignores it."

**Resolution**

You can set an initial height of what the widget height is supposed to be. That is, instead of `height="100"`, if the widget's final height is 600px, then set `height="600"`. Setting the initial height **_will not_** finalize the widget height if it's different from the actual. The widget will resize to it's true dimensions after the widget leaves the viewport.
