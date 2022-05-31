# UniConsent

Collect and manage user consent with UniConsent CMP.

## Example

```html
<amp-consent id="uniconsent" layout="nodisplay" type="UniConsent">
  <script type="application/json">
    {
      "postPromptUI": "post-consent-ui",
      "clientConfig": {
        "id": "8d3a00eb37"
      },
      "uiConfig": {
        "overlay": true
      }
    }
  </script>

  <div id="post-consent-ui" tabindex="0" role="button" on="tap:uniconsent.prompt(consent=UniConsent)" style="display: flex; width: 40px; height: 40px; justify-content: center; align-items: center; cursor: pointer; margin: 0 0 10px 10px;float: left; border-radius: 25px; background-image: linear-gradient(37deg,#c7c7c7,#e0e0e0);">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 80 80"><g xmlns="http://www.w3.org/2000/svg"><path d="M34,0 C34,0 23.6964545,11.1724138 0,11.1724138 L0,37.8256034 C0,51.7436379 6.68872727,65.1658966 18.7989091,73.7658621 C23.0844545,76.8103448 28.1396364,79.4288793 34,81 C39.8603636,79.4288793 44.914,76.8103448 49.2010909,73.7658621 C61.3112727,65.1658966 68,51.7436379 68,37.8256034 L68,11.1724138 C44.3035455,11.1724138 34,0 34,0 Z" id="Shape" fill="#556080" fill-rule="nonzero"></path> <path d="M33.5,72 C30.2491562,70.8407063 27.1024375,69.1817891 24.1165,67.0482991 C14.6503125,60.2873765 9,49.3527184 9,37.797358 L9,19.0691292 C20.3174687,17.7567475 28.3534687,14.1786635 33.5,11 C38.6465312,14.1786635 46.6825312,17.7567475 58,19.0691292 L58,37.797358 C58,49.3527184 52.3496875,60.2873765 42.8850312,67.0482991 C39.8975625,69.1817891 36.7508438,70.8407063 33.5,72 Z" id="Shape" fill="#4FBA6F" fill-rule="nonzero"></path> <path d="M52.4745773,28.3573401 C51.8332457,27.8315443 50.8604567,27.8936575 50.2992916,28.4931226 L29.799806,50.4422109 L18.6320032,39.9782954 C18.0292132,39.4134982 17.0548825,39.4134982 16.4520925,39.9782954 C15.8493025,40.5430927 15.8493025,41.4560129 16.4520925,42.0208102 L28.7853921,53.5767632 C29.0752247,53.8483281 29.4668069,54 29.8753475,54 C29.8923058,54 29.909264,54 29.9262223,54 C30.3532628,53.9869996 30.7540951,53.8078823 31.0346776,53.5074275 L52.6179519,30.3955214 C53.1791171,29.7946118 53.1143672,28.8816915 52.4745773,28.3573401 Z" id="Shape" fill="#FFFFFF" fill-rule="nonzero"></path></g></svg>
  </div>
</amp-consent>
```

## Configuration (`clientConfig`)

| Attribute |  Type  | Mandatory | Description                                  |
| --------- | :----: | :-------: | -------------------------------------------- |
| id        | String |    yes    | Settings id, provided via UniConsent Console |

In order to retrieve your settings id, please use the [UniConsent Console](https://www.uniconsent.com/).

## Support

Please get in contact with [UniConsent](https://www.uniconsent.com/) support team if you need further support.
