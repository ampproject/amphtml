# Bento Inline Gallery

Affiche les diapositives, avec des points de pagination et des vignettes en option.

Sa mise en œuvre utilise un [Bento Base Carousel](https://www.npmjs.com/package/@bentoproject/base-carousel). Les deux composants doivent être correctement installés pour l'environnement (composant Web vs Preact).

## Composant Web

Vous devez inclure la bibliothèque CSS requise de chaque composant Bento pour garantir un chargement correct et avant d'ajouter des styles personnalisés. Ou utilisez les styles de pré-mise à niveau légers intégrés disponibles. Voir [Mise en page et style](#layout-and-style).

Les exemples ci-dessous illustrent l'utilisation du composant Web `<bento-inline-gallery>`.

### Exemple : importation via npm

```sh
npm install @bentoproject/inline-gallery
```

```javascript
import {defineElement as defineBentoInlineGallery} from '@bentoproject/inline-gallery';
defineBentoInlineGallery();
```

### Exemple: inclusion via `<script>`

L'exemple ci-dessous contient un composant `bento-inline-gallery` composé de trois diapositives avec des vignettes et un indicateur de pagination.

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>

  <script async src="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.js"></script>
  <link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.css">

  <script async src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.js"></script>
  <link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css">
<body>
  <bento-inline-gallery id="inline-gallery">
    <bento-inline-gallery-thumbnails style="height: 100px;" loop></bento-inline-gallery-thumbnails>

    <bento-base-carousel style="height: 200px;" snap-align="center" visible-count="3" loop>
      <img src="img1.jpeg" data-thumbnail-src="img1-thumbnail.jpeg" />
      <img src="img2.jpeg" data-thumbnail-src="img2-thumbnail.jpeg" />
      <img src="img3.jpeg" data-thumbnail-src="img3-thumbnail.jpeg" />
      <img src="img4.jpeg" data-thumbnail-src="img4-thumbnail.jpeg" />
      <img src="img5.jpeg" data-thumbnail-src="img5-thumbnail.jpeg" />
      <img src="img6.jpeg" data-thumbnail-src="img6-thumbnail.jpeg" />
    </bento-base-carousel>

    <bento-inline-gallery-pagination style="height: 20px;"></bento-inline-gallery-pagination>
  </bento-inline-gallery>
</body>
```

### Mise en page et style

Chaque composant Bento possède une petite bibliothèque CSS que vous devez inclure pour garantir un chargement correct sans [écart de contenu](https://web.dev/cls/). En raison de la spécificité basée sur l'ordre, vous devez vous assurer manuellement que les feuilles de style sont incluses avant tout style personnalisé.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.css"
/>
```

Vous pouvez également rendre les styles de pré-mise à niveau légers disponibles et intégrés :

```html
<style>
  bento-inline-gallery,
  bento-inline-gallery-pagination,
  bento-inline-gallery-thumbnails {
    display: block;
  }
  bento-inline-gallery {
    contain: layout;
  }
  bento-inline-gallery-pagination,
  bento-inline-gallery-thumbnails {
    overflow: hidden;
    position: relative;
  }
</style>
```

### Attributs sur `<bento-inline-gallery-pagination>`

#### `inset`

Par défaut : `false`

Attribut booléen indiquant s'il faut afficher l'indicateur de pagination en encart (superposant le carrousel lui-même)

### Attributs sur `<bento-inline-gallery-thumbnails>`

#### `aspect-ratio`

Facultatif

Nombre : rapport entre la largeur et la hauteur dans lequel les diapositives doivent être affichées.

#### `loop`

Par défaut : `false`

Attribut booléen indiquant si les vignettes doivent être bouclées.

### Styles

Vous pouvez utiliser les éléments `bento-inline-gallery`, `bento-inline-gallery-pagination`, `bento-inline-gallery-thumbnails` et `bento-base-carousel` pour styliser librement l'indicateur de pagination, les vignettes et le carrousel.

---

## Composant Preact/React

Les exemples ci-dessous illustrent l'utilisation de `<BentoInlineGallery>` tant que composant fonctionnel utilisable avec les bibliothèques Preact ou React.

### Exemple : importation via npm

```sh
npm install @bentoproject/inline-gallery
```

```javascript
import React from 'react';
import {BentoInlineGallery} from '@bentoproject/inline-gallery/react';
import '@bentoproject/inline-gallery/styles.css';

function App() {
  return (
    <BentoInlineGallery id="inline-gallery">
      <BentoInlineGalleryThumbnails aspect-ratio="1.5" loop />
      <BentoBaseCarousel snap-align="center" visible-count="1.2" loop>
        <img src="server.com/static/inline-examples/images/image1.jpg" />
        <img src="server.com/static/inline-examples/images/image2.jpg" />
        <img src="server.com/static/inline-examples/images/image3.jpg" />
      </BentoBaseCarousel>
      <BentoInlineGalleryPagination inset />
    </BentoInlineGallery>
  );
}
```

### Mise en page et style

#### Type de conteneur

Le composant `BentoInlineGallery` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise à jour CSS souhaitée (comme celle définie avec `width` ). Ceux-ci peuvent être appliqués de manière intégrée :

```jsx
<BentoInlineGallery style={{width: 300}}>...</BentoInlineGallery>
```

Ou via `className` :

```jsx
<BentoInlineGallery className="custom-styles">...</BentoInlineGallery>
```

```css
.custom-styles {
  background-color: red;
}
```

<!-- TODO(wg-bento): This section was empty, fix it.
### Props for `BentoInlineGallery`
-->

### Accessoires pour `BentoInlineGalleryPagination`

En plus des [propriétés communes](../../../docs/spec/bento-common-props.md), BentoInlineGalleryPagination prend en charge les propriétés ci-dessous :

#### `inset`

Par défaut : `false`

Attribut booléen indiquant s'il faut afficher l'indicateur de pagination en encart (superposant le carrousel lui-même)

### Propriétés pour `BentoInlineGalleryThumbnails`

En plus des [propriétés communes](../../../docs/spec/bento-common-props.md), BentoInlineGalleryThumbnails prend en charge les propriétés ci-dessous :

#### `aspectRatio`

Facultatif

Nombre : rapport entre la largeur et la hauteur dans lequel les diapositives doivent être affichées.

#### `loop`

Par défaut : `false`

Attribut booléen indiquant si les vignettes doivent être bouclées.
