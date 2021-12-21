# Bento WordPress Embed

## Utilisation

Un iframe affichant [l'extrait](https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/) d'un article ou d'une page WordPress. Utilisez Bento WordPress Embed comme composant Web [`<bento-wordpress-embed>`](#web-component), ou comme composant fonctionnel Preact/React [`<BentoWordPressEmbed>`](#preactreact-component).

### Composant Web

Vous devez inclure la bibliothèque CSS requise de chaque composant Bento pour garantir un chargement correct et avant d'ajouter des styles personnalisés. Ou utilisez les styles de pré-mise à niveau légers intégrés disponibles. Voir [Mise en page et style](#layout-and-style).

Les exemples ci-dessous illustrent l'utilisation du composant Web `<bento-wordpress-embed>`.

#### Exemple : importation via npm

[example preview="top-frame" playground="false"]

Installation via npm:

```sh
npm install @ampproject/bento-wordpress-embed
```

```javascript
import '@ampproject/bento-wordpress-embed';
```

[/example]

#### Exemple: inclusion via `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-wordpress-embed {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script async src="https://cdn.ampproject.org/v0/bento-wordpress-embed-1.0.js"></script>
</head>
<bento-wordpress-embed id="my-embed"
  data-url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></bento-wordpress-embed>
<div class="buttons" style="margin-top: 8px;">
  <button id="switch-button">Switch embed</button>
</div>

<script>
  (async () => {
    const embed = document.querySelector('#my-embed');
    await customElements.whenDefined('bento-wordpress-embed');

    // set up button actions
    document.querySelector('#switch-button').onclick = () => embed.setAttribute('data-url', 'https://make.wordpress.org/core/2021/09/09/core-editor-improvement-cascading-impact-of-improvements-to-featured-images/');
  })();
</script>
```

[/example]

#### Mise en page et style

Chaque composant Bento possède une petite bibliothèque CSS que vous devez inclure pour garantir un chargement correct sans [écart de contenu](https://web.dev/cls/). En raison de la spécificité basée sur l'ordre, vous devez vous assurer manuellement que les feuilles de style sont incluses avant tout style personnalisé.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-wordpress-embed-1.0.css">
```

Vous pouvez également rendre les styles de pré-mise à niveau légers disponibles et intégrés :

```html
<style data-bento-boilerplate>
  bento-wordpress-embed {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**Type de conteneur**

Le composant `bento-wordpress-embed` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise en page CSS souhaitée (comme celle définie avec `height`, `width`, `aspect-ratio`, ou d'autres propriétés similaires) :

```css
bento-wordpress-embed {
  height: 100px;
  width: 100%;
}
```

#### Attributs

##### data-url (requis)

L'URL de la publication à intégrer.

### Composant Preact/React

Les exemples ci-dessous illustrent l'utilisation de `<BentoWordPressEmbed>` en tant que composant fonctionnel utilisable avec les bibliothèques Preact ou React.

#### Exemple : importation via npm

[example preview="top-frame" playground="false"]

Installation via npm:

```sh
npm install @ampproject/bento-wordpress-embed
```

```jsx
import React from 'react';
import {BentoWordPressEmbed} from '@ampproject/bento-wordpress-embed/react';

function App() {
  return (
    <BentoWordPressEmbed
      url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
    ></BentoWordPressEmbed>
  );
}
```

[/example]

#### Mise en page et style

**Type de conteneur**

Le composant `BentoWordPressEmbed` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise en page CSS souhaitée (comme celle définie avec `height`, `width`, `aspect-ratio`, ou d'autres propriétés similaires). Ceux-ci peuvent être appliqués de manière intégrée :

```jsx
<BentoWordPressEmbed style={{width: '100%', height: '100px'}}
  url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></BentoWordPressEmbed>
```

Ou via `className` :

```jsx
<BentoWordPressEmbed className="custom-styles"
  url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></BentoWordPressEmbed>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

#### Propriétés

##### url (requis)

L'URL de la publication à intégrer.
