# Unterstützte Sprachen

Eine Liste der unterstützten Sprachen findest du in der Liste der `*.js` Dateien im [Verzeichnis `_locales`](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales).

# Sprachen-Fallback

Als Fallback werden die allgemeineren Varianten von Sprachen und letztendlich der `default` Wert verwendet. Varianten werden durch einen Bindestrich im Sprachcode gekennzeichnet.

Der Sprachcode `en-GB` prüft beispielsweise die folgenden Sprachen (in dieser Reihenfolge):

- `en-GB` (Englisch, Großbritannien)
- `en` (Englisch)
- `default` (Standard)

Der Sprachcode unter `default` ist ein Fallback für den Fall, dass der vom Publisher angegebene Sprachcode nicht vorhanden ist. Er verwendet eine Minimalanzahl englischer Strings, sodass das Dokument größtenteils in seiner Primärsprache angezeigt werden kann. Alle Labels, die allgemein vertraute oder verständliche Symbole beschreiben, können ganz weggelassen werden. Da beispielsweise Sharing Icons das Logo des Sharing Netzwerks (z. B. das Twitter Logo) zeigen, ist der String "Twitter" überflüssig und kann in der `default` Sprache weggelassen werden.

# Aktuelle Strings anzeigen

In [dieser Tabelle](https://bit.ly/amp-story-strings) findest du die Übersetzungen für jede Sprache. Zellen mit dem Text `undefined` bedeuten, dass der String nicht in der angegebenen Sprache angezeigt wird und stattdessen Fallback Sprachen verwendet werden.

# Neue Strings hinzufügen (Englisch)

1. [Füge in `LocalizedStringId`](https://github.com/ampproject/amphtml/blob/main/src/localized-strings.js#L31) eine neue Zeichenfolgen-ID hinzu. Stelle sicher, dass die Liste `LocalizedStringId` in alphabetischer Reihenfolge bleibt und dass der Name deiner ID klar aussagt, was er semantisch darstellt.
2. Öffne die [Datei `en.js`](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/1.0/_locales/en.js)
3. Füge einen neuen Objektschlüssel mit `LocalizedStringId` als Schlüssel und ein Objekt mit dem String und seiner Beschreibung als Wert hinzu. Beispielsweise:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
  description: 'This is a description of my string, explaining what it means and/or how it is used.',
},

/* ... */
```

1. Sende ein Pull Request mit deinen Änderungen.

# Neue Übersetzungen hinzufügen (nicht-englische Strings)

1. Finde heraus, welche Strings fehlen, indem du dir die [Tabelle mit Strings](https://bit.ly/amp-story-strings) ansiehst.
2. Öffne die Datei `*.js` Datei im [Verzeichnis `_locales`](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales) für die Sprache, für die du eine Übersetzung hinzufügen möchtest.
3. Füge einen neuen Objektschlüssel mit `LocalizedStringId` als Schlüssel und ein Objekt mit dem String als Wert hinzu. Beispielsweise:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
},

/* ... */
```

1. Sende ein Pull Request mit deinen Änderungen.

HINWEIS: Stelle sicher, dass die String-IDs in alphabetischer Reihenfolge bleiben und lasse in deinem String Objekt den Schlüssel `description` in nicht-englischen Sprachen weg.
