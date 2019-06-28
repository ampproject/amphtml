# Supported languages

To see a list of the supported languages, see the list of `*.js` files in the [`_locales` directory](https://github.com/ampproject/amphtml/tree/master/extensions/amp-story/1.0/_locales).

# Language fallbacks

Languages will fall back to their more general variants, and ultimately to the `default` language.  Variants are indicated by a hyphen in the language code.

For example, the language code `en-GB` will check the following languages (in this order):

* `en-GB` (English, Great Britain)
* `en` (English)
* `default` (Default)

The `default` language code is a fallback used in the case that the publisher-specified language code does not exist.  It uses a minimal amount of English strings, so that the document can be displayed mostly in its primary language.  Any labels that describe otherwise familiar or intelligible iconography can be dropped entirely.  For example, since sharing icons show the sharing network's logo (e.g. the Twitter logo), the "Twitter" string is redundant and can be left out of the `default` language.

# Viewing the current strings

You can view the translations provided for each language in [this spreadsheet](https://bit.ly/amp-story-strings).  Any cells with the text `undefined` mean that the string will not be shown in the specified language, and fallback language(s) will be used instead.

# Adding new strings (English)

1. Add a new string ID in [`LocalizedStringId`](https://github.com/ampproject/amphtml/blob/master/extensions/amp-story/1.0/localization.js#L32).  Keep the `LocalizedStringId` list in alphabetical order, and make sure your ID's name is clear about what it represents semantically.
2. Open the [`en.js` file](https://github.com/ampproject/amphtml/blob/master/extensions/amp-story/1.0/_locales/en.js)
3. Add a new object key with the `LocalizedStringId` as the key, and an object containing the string and its description as its value.  For example:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
  description: 'This is a description of my string, explaining what it means and/or how it is used.',
},

/* ... */
```

4. Send a pull request with your changes


# Adding new translations (non-English strings)

1. Find which string(s) are missing by looking at [the string spreadsheet](https://bit.ly/amp-story-strings).
2. Open the `*.js` file from the [`_locales` directory](https://github.com/ampproject/amphtml/tree/master/extensions/amp-story/1.0/_locales) for the language for which you would like to add a translation.
3. Add a new object key with the `LocalizedStringId` as the key, and an object containing the string as its value.  For example:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
},

/* ... */
```

4. Send a pull request with your changes.

NOTE: Keep string IDs in alphabetical order, and do not include the `description` key in your string object for languages other than English.
