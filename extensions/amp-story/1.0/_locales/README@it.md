# Lingue supportate

Per visualizzare un elenco delle lingue supportate, consultare l'elenco dei file `*.js` nella [directory `_locales`](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales).

# Lingue di fallback

Le lingue effettuano il fallback alle loro varianti più generali e, infine, alla lingua di `default`. Le varianti sono indicate da un trattino nel codice della lingua.

Ad esempio, il codice di lingua `en-GB` proverà la disponibilità delle seguenti lingue (in questo ordine):

-   `en-GB` (Inglese, Gran Bretagna)
-   `en` (Inglese)
-   `default` (Lingua predefinita)

Il codice della lingua di `default` è il fallback utilizzato nel caso in cui il codice della lingua indicato dall'editore non esista. Fa uso di una quantità minima di stringhe in inglese, in modo che il documento possa essere visualizzato in gran parte nella sua lingua principale. Qualsiasi etichetta che descriva icone già facilmente identificabili o comprensibili può essere eliminata. Ad esempio, poiché le icone di condivisione mostrano il logo della rete di condivisione (ad es. il logo di Twitter), la stringa "Twitter" è ridondante e può essere omessa dalla lingua `default`.

# Visualizzazione delle stringhe correnti

Le traduzioni fornite per ogni lingua sono disponibili in [questo foglio di calcolo](https://bit.ly/amp-story-strings). Le celle con testo `undefined` indicano che la stringa non verrà mostrata nella lingua specificata e verranno invece utilizzate le lingue di fallback.

# Aggiunta di nuove stringhe (inglese)

1. Si può aggiungere un nuovo ID stringa in [`LocalizedStringId`](https://github.com/ampproject/amphtml/blob/main/src/localized-strings.js#L31). Occorre mantenere l'elenco di `LocalizedStringId` in ordine alfabetico e usare un nome per l'ID che indichi chiaramente l'oggetto semantico rappresentato.
2. Aprire il [file `en.js`](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/1.0/_locales/en.js)
3. Aggiungere la chiave per un nuovo oggetto con `LocalizedStringId` come chiave e un oggetto contenente la stringa e la relativa descrizione come valore. Ad esempio:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
  description: 'This is a description of my string, explaining what it means and/or how it is used.',
},

/* ... */
```

1. Inviare una richiesta pull con le modifiche

# Aggiunta di nuove traduzioni (stringhe non inglesi)

1. Le stringhe mancanti possono essere trovate consultando [il foglio di calcolo delle stringhe](https://bit.ly/amp-story-strings).
2. Aprire il file `*.js` dalla[ directory `_locales`](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales) per la lingua per cui si intende aggiungere una traduzione.
3. Aggiungere la chiave per un nuovo oggetto con `LocalizedStringId` come chiave e un oggetto contenente la stringa come valore. Ad esempio:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
},

/* ... */
```

1. Inviare una richiesta pull con le modifiche

NOTA: Mantenere gli ID delle stringhe in ordine alfabetico e non includere la chiave `description` nell'oggetto delle stringhe per lingue diverse dall'inglese.
