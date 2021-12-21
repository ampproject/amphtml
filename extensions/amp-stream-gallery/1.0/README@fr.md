# Bento Stream Gallery

## Utilisation

Bento Stream Gallery permet d'afficher plusieurs éléments de contenu similaires à la fois le long d'un axe horizontal. Pour implémenter une UX plus personnalisée, voir [`bento-base-carousel`](../../amp-base-carousel/1.0/README.md).

Utilisez Bento Stream Gallery comme composant Web ([`<bento-stream-gallery>`](#web-component)) ou comme composant fonctionnel Preact/React ([`<BentoStreamGallery>`](#preactreact-component)).

### Composant Web

Vous devez inclure la bibliothèque CSS requise de chaque composant Bento pour garantir un chargement correct et avant d'ajouter des styles personnalisés. Ou utilisez les styles de pré-mise à niveau légers intégrés disponibles. Voir [Mise en page et style](#layout-and-style).

Les exemples ci-dessous illustrent l'utilisation du composant Web `<bento-stream-gallery>`.

#### Exemple : importation via npm

[example preview="top-frame" playground="false"]

Installation via npm:

```sh
npm install @ampproject/bento-stream-gallery
```

```javascript
import '@ampproject/bento-stream-gallery';
```

[/example]

#### Exemple: inclusion via `<script>`

L'exemple ci-dessous contient un `bento-stream-gallery` à trois sections. L'attribut `expanded` de la troisième section l'étend au chargement de la page.

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <script async src="https://cdn.ampproject.org/v0/bento-stream-gallery-1.0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-streamGallery-1.0.css">

</head>
<body>
  <bento-stream-gallery>
    <img src="img1.png">
    <img src="img2.png">
    <img src="img3.png">
    <img src="img4.png">
    <img src="img5.png">
    <img src="img6.png">
    <img src="img7.png">
  </bento-stream-gallery>
  <script>
    (async () => {
      const streamGallery = document.querySelector('#my-stream-gallery');
      await customElements.whenDefined('bento-stream-gallery');
      const api = await streamGallery.getApi();

      // programatically expand all sections
      api.next();
      // programatically collapse all sections
      api.prev();
      // programatically go to slide
      api.goToSlide(4);
    })();
  </script>
</body>
```

[/example]

#### Interactivité et utilisation de l'API

Les composants compatibles Bento en utilisation autonome sont hautement interactifs via leur API. L'API du composant `bento-stream-gallery` est accessible en incluant la balise de script suivante dans votre document :

```javascript
await customElements.whenDefined('bento-stream-gallery');
const api = await streamGallery.getApi();
```

##### Actions

**next()**

Déplace le carrousel vers l'avant en fonction du nombre de diapositives visibles.

```js
api.next();
```

**prev()**

Déplace le carrousel vers l'arrière en fonction du nombre de diapositives visibles.

```js
api.prev();
```

**goToSlide(index: number)**

Déplace le carrousel vers la diapositive spécifiée par l'argument `index`. Remarque : `index` sera normalisé à un nombre supérieur ou égal à <code>0</code> et inférieur au nombre de diapositives donné.

```js
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

##### Événements

Le composant Bento Stream Gallery vous permet d'enregistrer et de répondre aux événements suivants :

**slideChange**

Cet événement est déclenché lorsque l'index affiché par le carrousel a changé. Le nouvel index est disponible via `event.data.index`.

```js
streamGallery.addEventListener('slideChange', (e) => console.log(e.data.index))
```

#### Mise en page et style

Chaque composant Bento possède une petite bibliothèque CSS que vous devez inclure pour garantir un chargement correct sans [écart de contenu](https://web.dev/cls/). En raison de la spécificité basée sur l'ordre, vous devez vous assurer manuellement que les feuilles de style sont incluses avant tout style personnalisé.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-streamGallery-1.0.css">
```

Vous pouvez également rendre les styles de pré-mise à niveau légers disponibles et intégrés :

```html
<style data-bento-boilerplate>
  bento-stream-gallery {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Attributs

##### Comportement

###### `controls`

Soit `"always"` , `"auto"` ou `"never"`, la valeur par défaut est `"auto"`. Cela détermine si et quand les flèches de navigation Précédent/Suivant sont affichées. Remarque : Lorsque `outset-arrows` est sur `true`, les flèches sont affichées `"always"`.

-   `always` : les flèches sont toujours affichées.
-   `auto` : les flèches s'affichent lorsque le carrousel a reçu la dernière interaction via la souris et ne s'affichent pas lorsque le carrousel a reçu la dernière interaction via commande tactile. Lors du premier chargement pour les appareils tactiles, des flèches sont affichées jusqu'à la première interaction.
-   `never` : les flèches ne sont jamais affichées.

###### `extra-space`

Soit `"around"` ou indéfini. Cela détermine comment l'espace supplémentaire est alloué après l'affichage du nombre calculé de diapositives visibles dans le carrousel. S'il est défini sur `"around"`, l'espace est uniformément réparti autour du carrousel avec `justify-content: center`; sinon, un espace est alloué à droite du carrousel pour les documents LTR et à gauche pour les documents RTL.

###### `loop`

Soit `true` ou `false`, la valeur par défaut est `true`. Lorsqu'il est défini sur true, le carrousel permettra à l'utilisateur de passer du premier élément au dernier élément et vice versa. Il doit y avoir au moins trois diapositives présentes pour pouvoir effectuer la boucle.

###### `outset-arrows`

Soit `true` ou `false`, la valeur par défaut est `false`. S'il est défini sur true, le carrousel affichera ses flèches sortantes et de chaque côté des diapositives. Notez qu'avec les flèches de départ, le conteneur de diapositives aura une longueur effective de 100px de moins que l'espace alloué pour son conteneur donné - 50px par flèche de chaque côté. Lorsqu'il est défini sur false, le carrousel affichera ses flèches incrustées et superposées sur les bords gauche et droit des diapositives.

###### `peek`

Un nombre, la valeur par défaut est `0`. Il détermine le nombre de diapositives supplémentaires à afficher (sur un ou les deux côtés de la diapositive actuelle) en tant qu'affordance pour l'utilisateur indiquant qu'il peut balayer le carrousel.

##### Visibilité des diapositives de la galerie

###### `min-visible-count`

Un nombre, la valeur par défaut est `1`. Détermine le nombre minimum de diapositives qui doivent être affichées à un moment donné. Des valeurs fractionnaires peuvent être utilisées pour rendre visible une partie d'une ou plusieurs diapositives supplémentaires.

###### `max-visible-count`

Un nombre, par défaut [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Détermine le nombre maximum de diapositives qui doivent être affichées à un moment donné. Des valeurs fractionnaires peuvent être utilisées pour rendre visible une partie d'une ou plusieurs diapositives supplémentaires.

###### `min-item-width`

Un nombre, la valeur par défaut est `1`. Détermine la largeur minimale de chaque élément, utilisée pour déterminer le nombre d'éléments entiers pouvant être affichés à la fois dans la largeur totale de la galerie.

###### `max-item-width`

Un nombre, par défaut [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Détermine la largeur maximale de chaque élément, utilisée pour déterminer le nombre d'éléments entiers pouvant être affichés à la fois dans la largeur totale de la galerie.

##### Accrochage des diapositives

###### `slide-align`

Soit `start` soit `center`. Lors du démarrage de l'alignement, le début d'une diapositive (par exemple le bord gauche, lors d'un alignement horizontal) est aligné avec le début d'un carrousel. Lors de l'alignement du centre, le centre d'une diapositive est aligné avec le centre d'un carrousel.

###### `snap`

Soit `true` ou `false`, la valeur par défaut est `true`. Détermine si le carrousel doit ou non s'accrocher aux diapositives lors du défilement.

#### Styles

Vous pouvez utiliser `bento-stream-gallery` pour styliser librement la streamGallery.

### Composant Preact/React

Les exemples ci-dessous illustrent l'utilisation de `<BentoStreamGallery>` en tant que composant fonctionnel utilisable avec les bibliothèques Preact ou React.

#### Exemple : importation via npm

[example preview="top-frame" playground="false"]

Installation via npm:

```sh
npm install @ampproject/bento-stream-gallery
```

```javascript
import React from 'react';
import { BentoStreamGallery } from '@ampproject/bento-stream-gallery/react';
import '@ampproject/bento-stream-gallery/styles.css';

function App() {
  return (
    <BentoStreamGallery>
      <img src="img1.png">
      <img src="img2.png">
      <img src="img3.png">
      <img src="img4.png">
      <img src="img5.png">
      <img src="img6.png">
      <img src="img7.png">
    </BentoStreamGallery>
  );
}
```

[/example]

#### Interactivité et utilisation de l'API

Les composants Bento sont hautement interactifs via leur API. L'API `BentoStreamGallery` est accessible en passant une `ref` :

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoStreamGallery ref={ref}>
      <img src="img1.png">
      <img src="img2.png">
      <img src="img3.png">
      <img src="img4.png">
      <img src="img5.png">
      <img src="img6.png">
      <img src="img7.png">
    </BentoStreamGallery>
  );
}
```

##### Actions

L'API `BentoStreamGallery` vous permet d'effectuer les actions suivantes :

**next()**

Déplace le carrousel vers l'avant de <code>advanceCount</code> diapositives.

```javascript
ref.current.next();
```

**prev()**

Déplace le carrousel vers l'arrière de `advanceCount` diapositives.

```javascript
ref.current.prev();
```

**goToSlide(index: number)**

Déplace le carrousel vers la diapositive spécifiée par l'argument `index`. Remarque : `index` sera normalisé à un nombre supérieur ou égal à `0` et inférieur au nombre de diapositives donné.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

##### Événements

**onSlideChange**

Cet événement est déclenché lorsque l'index affiché par le carrousel a changé.

```jsx
<BentoStreamGallery onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoStreamGallery>
```

#### Mise en page et style

**Type de conteneur**

Le composant `BentoStreamGallery` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise à jour CSS souhaitée (comme celle définie avec `width` ). Ceux-ci peuvent être appliqués de manière intégrée :

```jsx
<BentoStreamGallery style={{width: '300px'}}>
  ...
</BentoStreamGallery>
```

Ou via `className` :

```jsx
<BentoStreamGallery className='custom-styles'>
  ...
</BentoStreamGallery>
```

```css
.custom-styles {
  background-color: red;
}
```

#### Propriétés

##### Propriétés communes

Ce composant prend en charge les [propriétés communes](../../../docs/spec/bento-common-props.md) pour les composants React et Preact.

##### Comportement

###### `controls`

Soit `"always"` , `"auto"` ou `"never"`, la valeur par défaut est `"auto"`. Cela détermine si et quand les flèches de navigation Précédent/Suivant sont affichées. Remarque : Lorsque `outset-arrows` est sur `true`, les flèches sont affichées `"always"`.

-   `always` : les flèches sont toujours affichées.
-   `auto` : les flèches s'affichent lorsque le carrousel a reçu la dernière interaction via la souris et ne s'affichent pas lorsque le carrousel a reçu la dernière interaction via commande tactile. Lors du premier chargement pour les appareils tactiles, des flèches sont affichées jusqu'à la première interaction.
-   `never` : les flèches ne sont jamais affichées.

###### `extraSpace`

Soit `"around"` ou indéfini. Cela détermine comment l'espace supplémentaire est alloué après l'affichage du nombre calculé de diapositives visibles dans le carrousel. S'il est défini sur `"around"`, l'espace est uniformément réparti autour du carrousel avec `justify-content: center`; sinon, un espace est alloué à droite du carrousel pour les documents LTR et à gauche pour les documents RTL.

###### `loop`

Soit `true` ou `false`, la valeur par défaut est `true`. Lorsqu'il est défini sur true, le carrousel permettra à l'utilisateur de passer du premier élément au dernier élément et vice versa. Il doit y avoir au moins trois diapositives présentes pour pouvoir effectuer la boucle.

###### `outsetArrows`

Soit `true` ou `false`, la valeur par défaut est `false`. S'il est défini sur true, le carrousel affichera ses flèches sortantes et de chaque côté des diapositives. Notez qu'avec les flèches de départ, le conteneur de diapositives aura une longueur effective de 100px de moins que l'espace alloué pour son conteneur donné - 50px par flèche de chaque côté. Lorsqu'il est défini sur false, le carrousel affichera ses flèches incrustées et superposées sur les bords gauche et droit des diapositives.

###### `peek`

Un nombre, la valeur par défaut est `0`. Il détermine le nombre de diapositives supplémentaires à afficher (sur un ou les deux côtés de la diapositive actuelle) en tant qu'affordance pour l'utilisateur indiquant qu'il peut balayer le carrousel.

##### Visibilité des diapositives de la galerie

###### `minVisibleCount`

Un nombre, la valeur par défaut est `1`. Détermine le nombre minimum de diapositives qui doivent être affichées à un moment donné. Des valeurs fractionnaires peuvent être utilisées pour rendre visible une partie d'une ou plusieurs diapositives supplémentaires.

###### `maxVisibleCount`

Un nombre, par défaut [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Détermine le nombre maximum de diapositives qui doivent être affichées à un moment donné. Des valeurs fractionnaires peuvent être utilisées pour rendre visible une partie d'une ou plusieurs diapositives supplémentaires.

###### `minItemWidth`

Un nombre, la valeur par défaut est `1`. Détermine la largeur minimale de chaque élément, utilisée pour déterminer le nombre d'éléments entiers pouvant être affichés à la fois dans la largeur totale de la galerie.

###### `maxItemWidth`

Un nombre, par défaut [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Détermine la largeur maximale de chaque élément, utilisée pour déterminer le nombre d'éléments entiers pouvant être affichés à la fois dans la largeur totale de la galerie.

##### Accrochage des diapositives

###### `slideAlign`

Soit `start` soit `center`. Lors du démarrage de l'alignement, le début d'une diapositive (par exemple le bord gauche, lors d'un alignement horizontal) est aligné avec le début d'un carrousel. Lors de l'alignement du centre, le centre d'une diapositive est aligné avec le centre d'un carrousel.

###### `snap`

Soit `true` ou `false`, la valeur par défaut est `true`. Détermine si le carrousel doit ou non s'accrocher aux diapositives lors du défilement.
