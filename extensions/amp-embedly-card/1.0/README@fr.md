# Bento Embedly Card

Fournit des intégrations réactives et partageables à l'aide de [cartes Embedly](http://docs.embed.ly/docs/cards)

Les cartes sont le moyen le plus simple de tirer parti d'Embedly. Pour tous les supports, les cartes fournissent une intégration réactive avec des analyses d'intégration intégrées.

Si vous avez un plan payé, utilisez le composant `<bento-embedly-key>` ou `<BentoEmbedlyContext.Provider>` pour définir votre clé API. Vous n'avez besoin que d'une clé Bento Embedly par page pour supprimer la marque Embedly des cartes. Dans votre page, vous pouvez inclure une ou plusieurs instances de Bento Embedly Card.

## Composant Web

Vous devez inclure la bibliothèque CSS requise de chaque composant Bento pour garantir un chargement correct et avant d'ajouter des styles personnalisés. Ou utilisez les styles de pré-mise à niveau légers intégrés disponibles. Voir [Mise en page et style](#layout-and-style).

Les exemples ci-dessous illustrent l'utilisation du composant Web `<bento-embedly-card>`.

### Exemple : importation via npm

```sh
npm install @bentoproject/embedly-card
```

```javascript
import {defineElement as defineBentoEmbedlyCard} from '@bentoproject/embedly-card';
defineBentoEmbedlyCard();
```

### Exemple: inclusion via `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-embedly-card {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.js"
  ></script>
  <style>
    bento-embedly-card {
      width: 375px;
      height: 472px;
    }
  </style>
</head>
<body>
  <bento-embedly-key value="12af2e3543ee432ca35ac30a4b4f656a">
  </bento-embedly-key>

  <bento-embedly-card
    data-url="https://twitter.com/AMPhtml/status/986750295077040128"
    data-card-theme="dark"
    data-card-controls="0"
  >
  </bento-embedly-card>

  <bento-embedly-card
    id="my-url"
    data-url="https://www.youtube.com/watch?v=LZcKdHinUhE"
  >
  </bento-embedly-card>

  <div class="buttons" style="margin-top: 8px">
    <button id="change-url">Change embed</button>
  </div>

  <script>
    (async () => {
      const embedlyCard = document.querySelector('#my-url');
      await customElements.whenDefined('bento-embedly-card');

      // set up button actions
      document.querySelector('#change-url').onclick = () => {
        embedlyCard.setAttribute(
          'data-url',
          'https://www.youtube.com/watch?v=wcJSHR0US80'
        );
      };
    })();
  </script>
</body>
```

### Mise en page et style

Chaque composant Bento possède une petite bibliothèque CSS que vous devez inclure pour garantir un chargement correct sans [écart de contenu](https://web.dev/cls/). En raison de la spécificité basée sur l'ordre, vous devez vous assurer manuellement que les feuilles de style sont incluses avant tout style personnalisé.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.css"
/>
```

Vous pouvez également rendre les styles de pré-mise à niveau légers disponibles et intégrés :

```html
<style>
  bento-embedly-card {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Type de conteneur

Le composant `bento-embedly-card` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise en page CSS souhaitée (comme celle définie avec `height`, `width`, `aspect-ratio`, ou d'autres propriétés similaires) :

```css
bento-embedly-card {
  height: 100px;
  width: 100%;
}
```

### Attributs

#### `data-url`

L'URL pour récupérer les informations d'intégration.

#### `data-card-embed`

L'URL d'une vidéo ou d'un multimédia enrichi. À utiliser avec des intégrations statiques comme des articles, au lieu d'utiliser le contenu de la page statique dans la carte, la carte intégrera la vidéo ou le multimédia enrichi.

#### `data-card-image`

L'URL d'une image. Spécifie l'image à utiliser dans les cartes d'article lorsque `data-url` pointe vers un article. Toutes les URL d'image ne sont pas prises en charge ; si l'image n'est pas chargée, essayez une autre image ou un autre domaine.

#### `data-card-controls`

Active les icônes de partage.

-   `0` : Désactiver les icônes de partage.
-   `1` : Activer les icônes de partage

La valeur par défaut est `1`.

#### `data-card-align`

Aligne la carte. Les valeurs possibles sont `left`, `center` et `right`. La valeur par défaut est `center`.

#### `data-card-recommend`

Lorsque les recommandations sont prises en charge, les recommandations Embedly sur les cartes vidéo et enrichies est désactivée. Ces recommandations sont créées par Embedly.

-   `0` : Désactive les recommandations Embedly.
-   `1` : Active les recommandations Embedly.

La valeur par défaut est `1`.

#### `data-card-via` (facultatif)

Spécifie le contenu via dans la carte. C'est une excellente façon d'effectuer l'attribution.

#### `data-card-theme` (facultatif)

Permet de définir le thème `dark` qui modifie la couleur d'arrière-plan du conteneur de carte principal. Utilisez `dark` pour définir ce thème. Pour les arrière-plans sombres, il est préférable de le préciser. La valeur par défaut est `light`, qui ne définit aucune couleur d'arrière-plan du conteneur de carte principal.

#### titre (facultatif)

Définissez un attribut `title` pour que le composant se propage à l'élément `<iframe>` sous-jacent. La valeur par défaut est `"Embedly card"`.

---

## Composant Preact/React

Les exemples ci-dessous illustrent l'utilisation de `<BentoEmbedlyCard>` en tant que composant fonctionnel utilisable avec les bibliothèques Preact ou React.

### Exemple : importation via npm

```sh
npm install @bentoproject/embedly-card
```

```javascript
import {BentoEmbedlyCard} from '@bentoproject/embedly-card/react';
import '@bentoproject/embedly-card/styles.css';

function App() {
  return (
    <BentoEmbedlyContext.Provider
      value={{apiKey: '12af2e3543ee432ca35ac30a4b4f656a'}}
    >
      <BentoEmbedlyCard url="https://www.youtube.com/watch?v=LZcKdHinUhE"></BentoEmbedlyCard>
    </BentoEmbedlyContext.Provider>
  );
}
```

### Mise en page et style

#### Type de conteneur

Le composant `BentoEmbedlyCard` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise en page CSS souhaitée (comme celle définie avec `height`, `width`, `aspect-ratio`, ou d'autres propriétés similaires). Ceux-ci peuvent être appliqués de manière intégrée :

```jsx
<BentoEmbedlyCard
  style={{width: 300, height: 100}}
  url="https://www.youtube.com/watch?v=LZcKdHinUhE"
></BentoEmbedlyCard>
```

Ou via `className` :

```jsx
<BentoEmbedlyCard
  className="custom-styles"
  url="https://www.youtube.com/watch?v=LZcKdHinUhE"
></BentoEmbedlyCard>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Propriétés

#### `url`

L'URL pour récupérer les informations d'intégration.

#### `cardEmbed`

L'URL d'une vidéo ou d'un multimédia enrichi. À utiliser avec des intégrations statiques comme des articles, au lieu d'utiliser le contenu de la page statique dans la carte, la carte intégrera la vidéo ou le multimédia enrichi.

#### `cardImage`

L'URL d'une image. Spécifie l'image à utiliser dans les cartes d'article lorsque `data-url` pointe vers un article. Toutes les URL d'image ne sont pas prises en charge ; si l'image n'est pas chargée, essayez une autre image ou un autre domaine.

#### `cardControls`

Active les icônes de partage.

-   `0` : Désactiver les icônes de partage.
-   `1` : Activer les icônes de partage

La valeur par défaut est `1`.

#### `cardAlign`

Aligne la carte. Les valeurs possibles sont `left`, `center` et `right`. La valeur par défaut est `center`.

#### `cardRecommend`

Lorsque les recommandations sont prises en charge, les recommandations Embedly sur les cartes vidéo et enrichies est désactivée. Ces recommandations sont créées par Embedly.

-   `0` : Désactive les recommandations Embedly.
-   `1` : Active les recommandations Embedly.

La valeur par défaut est `1`.

#### `cardVia` (facultatif)

Spécifie le contenu via dans la carte. C'est une excellente façon d'effectuer l'attribution.

#### `cardTheme` (facultatif)

Permet de définir le thème `dark` qui modifie la couleur d'arrière-plan du conteneur de carte principal. Utilisez `dark` pour définir ce thème. Pour les arrière-plans sombres, il est préférable de le préciser. La valeur par défaut est `light`, qui ne définit aucune couleur d'arrière-plan du conteneur de carte principal.

#### titre (facultatif)

Définissez un attribut `title` pour que le composant se propage à l'élément `<iframe>` sous-jacent. La valeur par défaut est `"Embedly card"`.
