# LiveRamp

## Example

```html
<amp-consent id="consent" layout="nodisplay" type="LiveRamp">
  <script type="application/json">
    {
      "postPromptUI": "post-consent-ui",
      "clientConfig": {
          "appId": "c65a09d5-eda1-4eef-bf38-90e73059f4d6"
      },
      "uiConfig": {
        "overlay": true
      }
    }
  </script>
    <div id="post-consent-ui" tabindex="0" role="button" on="tap:consent.prompt(consent=LiveRamp)"
      style="display: flex; width: 40px; height: 40px; justify-content: center; align-items: center; cursor: pointer; margin: 0 0 10px 10px;
      float: left; border-radius: 25px; background-color: #ffffff">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 100 100">
        <path fill="#ff0a0a"
          d="M68.884 25.318c-6.503-3.34-12.126-4.757-18.867-4.757-6.706 0-13.074 1.586-18.866 4.757-.813.439-1.83.135-2.303-.674-.44-.81-.136-1.856.677-2.295 6.3-3.407 13.21-5.162 20.492-5.162 7.215 0 13.515 1.586 20.425 5.129.847.438 1.152 1.45.711 2.26-.304.607-.88.945-1.49.945-.27 0-.542-.068-.779-.203zm-47.895 16.87c-.341 0-.683-.098-.99-.293-.786-.521-.956-1.53-.41-2.28 3.38-4.556 7.684-8.137 12.806-10.644 10.724-5.273 24.452-5.306 35.21-.032 5.122 2.506 9.425 6.055 12.806 10.58.546.715.376 1.757-.41 2.278-.785.52-1.844.358-2.39-.39-3.074-4.102-6.967-7.325-11.577-9.571-9.802-4.785-22.335-4.785-32.102.033-4.644 2.278-8.537 5.533-11.611 9.635-.273.456-.785.684-1.332.684zm22.028 38.541c-.449 0-.897-.162-1.208-.487-3.002-2.823-4.624-4.64-6.936-8.566-2.38-3.991-3.623-8.858-3.623-14.082 0-9.637 8.765-17.49 19.531-17.49 10.767 0 19.532 7.853 19.532 17.49 0 .908-.76 1.622-1.726 1.622s-1.725-.714-1.725-1.622c0-7.853-7.212-14.245-16.08-14.245-8.87 0-16.081 6.392-16.081 14.245 0 4.672 1.104 8.988 3.209 12.492 2.208 3.732 3.727 5.322 6.384 7.853.655.649.655 1.654 0 2.303-.38.325-.828.487-1.277.487zm23.652-5.208c-4.185 0-7.878-1-10.903-2.967-5.24-3.368-8.37-8.836-8.37-14.637 0-.934.774-1.667 1.758-1.667.985 0 1.759.733 1.759 1.667 0 4.701 2.532 9.135 6.823 11.87 2.497 1.6 5.416 2.366 8.933 2.366.844 0 2.25-.1 3.658-.333.95-.167 1.864.433 2.04 1.367.175.9-.458 1.767-1.442 1.934-2.005.366-3.764.4-4.256.4zm-6.157 7.291c-.137 0-.308-.032-.445-.065-5.44-1.45-8.999-3.393-12.728-6.917-4.79-4.579-7.425-10.672-7.425-17.194 0-5.336 4.722-9.684 10.538-9.684 5.817 0 10.539 4.348 10.539 9.684 0 3.524 3.182 6.39 7.117 6.39 3.934 0 7.116-2.866 7.116-6.39 0-12.418-11.12-22.497-24.806-22.497-9.717 0-18.613 5.204-22.616 13.274-1.335 2.668-2.019 5.797-2.019 9.223 0 2.57.24 6.62 2.293 11.89.342.857-.103 1.812-.993 2.109-.89.329-1.882-.132-2.19-.956-1.676-4.314-2.497-8.596-2.497-13.043 0-3.953.787-7.543 2.326-10.672 4.551-9.19 14.645-15.151 25.696-15.151 15.568 0 28.228 11.56 28.228 25.79 0 5.336-4.722 9.684-10.538 9.684-5.817 0-10.539-4.348-10.539-9.684 0-3.524-3.182-6.39-7.117-6.39-3.934 0-7.116 2.866-7.116 6.39 0 5.632 2.258 10.903 6.398 14.855 3.25 3.096 6.364 4.809 11.188 6.094.924.23 1.437 1.152 1.198 2.009-.171.757-.89 1.251-1.608 1.251z" />
      </svg>
    </div>
</amp-consent>
```

## Notes

### `postPromptUI`

The value of `postPromptUI` should be the id of the html tag in which the consent ui will be attached to. In our example above, the value of `postPromptUI` is `post-consent-ui` since we have a div with that id.

### Toggle Privacy Manager

Notice in the example above, we have a `button` with the attribute `on="tap.consent.prompt(consent=LiveRamp)"`. The id of your `<amp-consent>` element is relevant here. Notice how the id of our `<amp-consent>` is `consent`, that's why the `on` attribute has the value "tap.**myUserConsent**.prompt(consent=LiveRamp)". This button is required by IAB TCF 2.x policy, but the button styling and position can be changed.

## Configuration (`clientConfig`)

| Attribute |  Type   | Mandatory | Description                                                                           |
| --------- | :-----: | :-------: | ------------------------------------------------------------------------------------- |
| appId     | String  |    yes    | This your app id and can be found in your LiveRamp Console Configuration.             |
| overlay   | boolean |    no     | Controls whether the site content should be blocked when the Privacy Notice is shown. |

## Getting Help

For more information on how to integrate AMP to your page please visit our [support portal](http://launch.liveramp.com) or contact your technical account manager directly.
