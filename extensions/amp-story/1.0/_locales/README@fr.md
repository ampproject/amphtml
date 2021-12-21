# Langues prises en charge

Pour voir une liste des langues prises en charge, consultez la liste des fichiers `*.js` dans le [répertoire `_locales`](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales) .

# Langues de secours

Les langues retombent d'abord sur les variantes plus générales, et enfin sur la langue `default` Les variantes sont indiquées par un tiret dans le code de langue.

Par exemple, le code de langue `en-GB` vérifiera les langues suivantes (dans cet ordre) :

- `en-GB` (anglais, Grande-Bretagne)
- `en` (anglais)
- `default` (par défaut)

Le code de langue `default` est une solution de secours utilisée dans le cas où le code de langue spécifié par l'éditeur n'existe pas. Il utilise une quantité minimale de chaînes en anglais, de sorte que le document peut être affiché principalement dans sa langue principale. Toutes les étiquettes qui décrivent une iconographie par ailleurs familière ou intelligible peuvent être entièrement supprimées. Par exemple, étant donné que les icônes de partage affichent le logo du réseau de partage (par exemple le logo Twitter), la chaîne « Twitter » est redondante et peut ne pas figurer dans la langue `default`.

# Affichage des chaînes actuelles

Vous pouvez consulter les traductions fournies pour chaque langue dans [cette feuille de calcul](https://bit.ly/amp-story-strings). Toutes les cellules avec le texte `undefined` signifient que la chaîne ne sera pas affichée dans la langue spécifiée et que la ou les langues de secours seront utilisées à la place.

# Ajout de nouvelles chaînes (anglais)

1. Ajoutez un nouvel ID de chaîne dans [`LocalizedStringId`](https://github.com/ampproject/amphtml/blob/main/src/localized-strings.js#L31). Conservez la liste `LocalizedStringId` par ordre alphabétique et assurez-vous que le sens du nom de votre ID est clair.
2. Ouvrez le [fichier `en.js`](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/1.0/_locales/en.js)
3. Ajoutez une nouvelle clé d'objet avec `LocalizedStringId` comme clé et un objet contenant la chaîne et sa description comme valeur. Par exemple :

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
  description: 'This is a description of my string, explaining what it means and/or how it is used.',
},

/* ... */
```

1. Envoyez une demande d'extraction avec vos modifications

# Ajout de nouvelles traductions (chaînes non anglaises)

1. Trouvez la ou les chaînes manquantes en consultant [la feuille de calcul des chaînes](https://bit.ly/amp-story-strings).
2. Ouvrez le fichier du `*.js` [répertoire `_locales`](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales) de la langue pour laquelle vous souhaitez ajouter une traduction.
3. Ajoutez une nouvelle clé d'objet avec `LocalizedStringId` comme clé et un objet contenant la chaîne comme valeur. Par exemple :

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
},

/* ... */
```

1. Envoyez une demande d'extraction avec vos modifications.

REMARQUE : conservez les ID de chaîne par ordre alphabétique et n'incluez pas la clé `description` dans votre objet de chaîne pour les langues autres que l'anglais.
