# iubenda

iubenda makes your sites & apps legally compliant across multiple languages and legislations (including the GDPR) with lawyer-crafted, self-updating solutions. [Read our guide](https://www.iubenda.com/en/help/22135-cookie-solution-amp) to integrate our Cookie Solution in your AMP pages.

## Example

```html
<amp-consent id="iubenda" layout="nodisplay" type="iubenda">
  <script type="application/json">
    {
      "promptUISrc": "https://cdn.iubenda.com/cs/test/cs-for-amp.html",
      "postPromptUI": "iubendaPostPromptUI"
    }
  </script>
  <div id="iubendaPostPromptUI">
    Post Prompt UI
    <button on="tap:iubenda.prompt(consent=iubenda)">
      Manage
    </button>
  </div>
</amp-consent>
```

## Contacts for future maintenance

@Facens
@Vasile-Peste
