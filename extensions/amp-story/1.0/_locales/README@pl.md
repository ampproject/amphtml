# Obsługiwane języki

Aby sprawdzić listę obsługiwanych języków, sprawdź listę plików `*.js` w katalogu [`_locales`](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales).

# Języki zastępcze

Języki będą zastępowane swoimi ogólniejszymi odmianami, ostatecznie do języka `default`. Odmiany są oznaczone w kodzie języka myślnikiem.

Na przykład kod języka `en-GB` będzie skutkować sprawdzaniem następujących języków (w tej kolejności):

- `en-GB` (angielski, Wielka Brytania)
- `en` (angielski)
- `default` (domyślny)

Kod języka `default` to język zastępczy, używany w przypadku, gdy kod języka określony przez wydawcę nie istnieje. Używa on minimalnej ilości angielskich ciągów znaków, tak aby dokument mógł być wyświetlany głównie w języku podstawowym. Wszelkie etykiety, które opisują znaną lub zrozumiałą ikonografię, mogą zostać całkowicie usunięte. Na przykład, jako że ikony udostępniania pokazują logotyp sieci udostępniania (np. Twittera), ciąg „Twitter” jest zbędny i może zostać usunięty z języka `default`.

# Wyświetlanie bieżących ciągów znaków

Tłumaczenia na każdy język można zobaczyć w [tym arkuszu kalkulacyjnym](https://bit.ly/amp-story-strings). Wszystkie komórki z tekstem `undefined` znaczą, że dany ciąg znaków nie będzie wyświetlany w danym języku, a zamiast niego zostaną użyte języki zastępcze.

# Dodawanie nowych ciągów znaków (w języku angielskim)

1. Dodaj nowy identyfikator ciągu znaków na liście [`LocalizedStringId`](https://github.com/ampproject/amphtml/blob/main/src/localized-strings.js#L31). Utrzymuj listę `LocalizedStringId` w porządku alfabetycznym i upewnij się, że nazwa Twojego ID jest zrozumiała co do tego, co reprezentuje semantycznie.
2. Otwórz plik [`en.js`](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/1.0/_locales/en.js)
3. Dodaj nowy klucz obiektu z listy `LocalizedStringId` jako klucz oraz obiekt zawierający ciąg znaków i jego opis jako wartość. Na przykład:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
  description: 'This is a description of my string, explaining what it means and/or how it is used.',
},

/* ... */
```

1. Wyślij żądanie ściągnięcia z Twoimi zmianami

# Dodawanie nowych tłumaczeń (ciągów znaków  w językach innych niż angielski)

1. Znajdź brakujące ciągi znaków, posługując się [arkuszem ciągów](https://bit.ly/amp-story-strings).
2. Otwórz plik `*.js` języka, dla którego chcesz dodać tłumaczenie, z katalogu [`_locales`](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales).
3. Dodaj nowy klucz obiektu z listy `LocalizedStringId` jako klucz oraz obiekt zawierający ciąg znaków i jego opis jako jego wartość. Na przykład:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
},

/* ... */
```

1. Wyślij żądanie ściągnięcia z Twoimi zmianami.

UWAGA: zachowaj identyfikatory ciągów znaków w porządku alfabetycznym i nie umieszczaj klucza `description` w swoim obiekcie ciągu dla języków innych niż angielski.
