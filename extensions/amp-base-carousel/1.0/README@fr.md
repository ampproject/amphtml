# Bento Carousel

Un carrousel générique pour afficher plusieurs éléments de contenu similaires le long d'un axe horizontal ou vertical.

Chacun des enfants immédiats du composant est considéré comme un élément dans le carrousel. Chacun de ces nœuds peut également avoir des enfants arbitraires.

Le carrousel se compose d'un nombre arbitraire d'éléments, ainsi que de flèches de navigation facultatives pour avancer ou reculer d'un seul élément.

Le carrousel avance entre les éléments si l'utilisateur glisse ou utilise les boutons fléchés personnalisables.

## Composant Web

Vous devez inclure la bibliothèque CSS requise de chaque composant Bento pour garantir un chargement correct et avant d'ajouter des styles personnalisés. Ou utilisez les styles de pré-mise à niveau légers intégrés disponibles. Voir [Mise en page et style](#layout-and-style).

Les exemples ci-dessous illustrent l'utilisation du composant Web `<bento-base-carousel>`.

### Exemple : importation via npm

```sh
npm install @bentoproject/base-carousel
```

```javascript
import {defineElement as defineBentoBaseCarousel} from '@bentoproject/base-carousel';
defineBentoBaseCarousel();
```

### Exemple: inclusion via `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-base-carousel {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.js"
  ></script>
  <style>
    bento-base-carousel,
    bento-base-carousel > div {
      aspect-ratio: 4/1;
    }
    .red {
      background: darkred;
    }
    .blue {
      background: steelblue;
    }
    .green {
      background: seagreen;
    }
  </style>
</head>
<bento-base-carousel id="my-carousel">
  <div class="red"></div>
  <div class="blue"></div>
  <div class="green"></div>
</bento-base-carousel>
<div class="buttons" style="margin-top: 8px">
  <button id="prev-button">Go to previous slide</button>
  <button id="next-button">Go to next slide</button>
  <button id="go-to-button">Go to slide with green gradient</button>
</div>

<script>
  (async () => {
    const carousel = document.querySelector('#my-carousel');
    await customElements.whenDefined('bento-base-carousel');
    const api = await carousel.getApi();

    // programatically advance to next slide
    api.next();

    // set up button actions
    document.querySelector('#prev-button').onclick = () => api.prev();
    document.querySelector('#next-button').onclick = () => api.next();
    document.querySelector('#go-to-button').onclick = () => api.goToSlide(2);
  })();
</script>
```

### Interactivité et utilisation de l'API

Les composants compatibles Bento en utilisation autonome sont hautement interactifs via leur API. L'API du composant `bento-base-carousel` est accessible en incluant la balise de script suivante dans votre document :

```javascript
await customElements.whenDefined('bento-base-carousel');
const api = await carousel.getApi();
```

#### Actions

L'API `bento-base-carousel` vous permet d'effectuer les actions suivantes :

##### next()

Déplace le carrousel vers l'avant par des diapositives `advance-count`

```javascript
api.next();
```

##### prev()

Déplace le carrousel vers l'arrière par des diapositives `advance-count`

```javascript
api.prev();
```

##### goToSlide(index: number)

Déplace le carrousel vers la diapositive spécifiée par l'argument `index`. Remarque : `index` sera normalisé à un nombre supérieur ou égal à `0` et inférieur au nombre de diapositives donné.

```javascript
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

#### Événements

L'API `bento-base-carousel` vous permet d'enregistrer et de répondre aux événements suivants :

##### slideChange

Cet événement est déclenché lorsque l'index affiché par le carrousel a changé. Le nouvel index est disponible via `event.data.index`.

```javascript
carousel.addEventListener('slideChange', (e) => console.log(e.data.index));
```

### Mise en page et style

Chaque composant Bento possède une petite bibliothèque CSS que vous devez inclure pour garantir un chargement correct sans [écart de contenu](https://web.dev/cls/). En raison de la spécificité basée sur l'ordre, vous devez vous assurer manuellement que les feuilles de style sont incluses avant tout style personnalisé.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css"
/>
```

Vous pouvez également rendre les styles de pré-mise à niveau légers disponibles et intégrés :

```html
<style>
  bento-base-carousel {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Type de conteneur

Le composant `bento-base-carousel` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise en page CSS souhaitée (comme celle définie avec `height`, `width`, `aspect-ratio`, ou d'autres propriétés similaires) :

```css
bento-base-carousel {
  height: 100px;
  width: 100%;
}

bento-base-carousel > * {
  aspect-ratio: 4/1;
}
```

### Changement de diapositive de droite à gauche

`<bento-base-carousel>` nécessite que vous définissiez quand il est dans un contexte de droite à gauche (rtl) (par exemple, les pages arabes et hébraïques). Bien que le carrousel fonctionne généralement sans cela, il peut y avoir quelques bugs. Vous pouvez indiquer au carrousel qu'il doit fonctionner en `rtl` comme suit :

```html
<bento-base-carousel dir="rtl" …>
  …
</bento-base-carousel>
```

Si le carrousel est dans un contexte RTL et que vous souhaitez que le carrousel fonctionne en LTR, vous pouvez explicitement définir `dir="ltr"` sur le carrousel.

### Mise en page des diapositives

Les diapositives sont automatiquement dimensionnées par le carrousel lorsque vous ne spécifiez **pas** de `mixed-lengths`.

```html
<bento-base-carousel …>
  <img style="height: 100%; width: 100%" src="…" />
</bento-base-carousel>
```

Les diapositives ont une hauteur implicite lorsque le carrousel est mis en page. Cela peut facilement être modifié avec CSS. Lors de la spécification de la hauteur, la diapositive sera centrée verticalement dans le carrousel.

Si vous souhaitez centrer horizontalement le contenu de votre diapositive, vous devrez créer un élément d'emballage et l'utiliser pour centrer le contenu.

### Nombre de diapositives visibles

Lorsque vous modifiez le nombre de diapositives visibles à l'aide de `visible-slides`, en réponse à une requête multimédia, vous souhaiterez probablement modifier les proportions du carrousel lui-même pour qu'il corresponde au nouveau nombre de diapositives visibles. Par exemple, si vous souhaitez afficher trois diapositives à la fois avec des proportions d'un par un, vous souhaiterez des proportions de trois par un pour le carrousel lui-même. De même, avec quatre diapositives à la fois, vous voudriez des proportions de quatre par un. De plus, lorsque vous modifiez `visible-slides`, vous souhaiterez probablement modifier `advance-count`.

```html
<!-- Using an aspect ratio of 3:2 for the slides in this example. -->
<bento-base-carousel
  visible-count="(min-width: 600px) 4, 3"
  advance-count="(min-width: 600px) 4, 3"
>
  <img style="height: 100%; width: 100%" src="…" />
  …
</bento-base-carousel>
```

### Attributs

#### Requêtes multimédias

Les attributs de `<bento-base-carousel>` peuvent être configurés pour utiliser différentes options en fonction d'une [requête multimédia](./../../../docs/spec/amp-html-responsive-attributes.md).

#### Nombre de diapositives visibles

##### mixed-length

Soit `true` ou `false`, la valeur par défaut est `false`. Si elle est sur true, elle utilise la largeur existante (ou la hauteur lorsqu'elle est horizontale) pour chacune des diapositives. Cela permet d'utiliser un carrousel avec des diapositives de différentes largeurs.

##### visible-count

Un nombre, la valeur par défaut est `1`. Détermine combien de diapositives doivent être affichées à un moment donné. Des valeurs fractionnaires peuvent être utilisées pour rendre visible une partie d'une ou plusieurs diapositives supplémentaires. Cette option est ignorée lorsque `mixed-length` est sur `true`.

##### advance-count

Un nombre, la valeur par défaut est `1`. Détermine le nombre de diapositives que le carrousel avancera lors de l'avancement à l'aide des flèches Précédent ou Suivant. Ceci est utile lors de la spécification de l'attribut `visible-count`.

#### Avance automatique

##### auto-advance

Soit `true` ou `false`, la valeur par défaut est `false`. Avance automatiquement le carrousel à la diapositive suivante en fonction d'un délai. Si l'utilisateur modifie manuellement les diapositives, l'avance automatique est arrêtée. Notez que si `loop` n'est pas activé, lorsque vous atteignez le dernier élément, l'avance automatique reviendra au premier élément.

##### auto-advance-count

Un nombre, la valeur par défaut est `1`. Détermine le nombre de diapositives que le carrousel avancera lors de l'avance automatique. Ceci est utile lors de la spécification de l'attribut `visible-count`.

##### auto-advance-interval

Un nombre, la valeur par défaut est `1000`. Spécifie la durée, en millisecondes, entre les avances automatiques suivantes du carrousel.

##### auto-advance-loops

Un nombre, par défaut `∞`. Le nombre de fois que le carrousel doit avancer à travers les diapositives avant de s'arrêter.

#### Accrochage

##### snap

Soit `true` ou `false`, la valeur par défaut est `true`. Détermine si le carrousel doit ou non s'accrocher aux diapositives lors du défilement.

##### snap-align

Soit `start` soit `center`. Lors du démarrage de l'alignement, le début d'une diapositive (par exemple le bord gauche, lors d'un alignement horizontal) est aligné avec le début d'un carrousel. Lors de l'alignement du centre, le centre d'une diapositive est aligné avec le centre d'un carrousel.

##### snap-by

Un nombre, la valeur par défaut est `1`. Cela détermine la granularité de l'accrochage et est utile lors de l'utilisation de `visible-count`.

#### Divers

##### controls

Soit `"always"` , `"auto"` ou `"never"`, la valeur par défaut est `"auto"`. Cela détermine si et quand les flèches de navigation Précédent/Suivant sont affichées. Remarque : Lorsque `outset-arrows` est sur `true`, les flèches sont affichées `"always"`.

-   `always` : les flèches sont toujours affichées.
-   `auto` : les flèches s'affichent lorsque le carrousel a reçu la dernière interaction via la souris et ne s'affichent pas lorsque le carrousel a reçu la dernière interaction via commande tactile. Lors du premier chargement pour les appareils tactiles, des flèches sont affichées jusqu'à la première interaction.
-   `never` : les flèches ne sont jamais affichées.

##### slide

Un nombre, la valeur par défaut est `0`. Cela détermine la diapositive initiale affichée dans le carrousel. Cela peut être muté avec `Element.setAttribute` pour contrôler quelle diapositive est actuellement affichée.

##### loop

Soit `true` ou `false`, la valeur par défaut est `false` en cas d'omission. Lorsqu'elle est définie sur true, le carrousel permettra à l'utilisateur de passer du premier élément au dernier élément et vice versa. Il doit y avoir au moins trois fois le nombre `visible-count` de diapositives présentes pour que la boucle se produise.

##### orientation

Soit `horizontal` ou `vertical`, la valeur par défaut est `horizontal`. Lorsqu'elle est sur `horizontal`, le carrousel s'affichera horizontalement, l'utilisateur pourra alors balayer vers la gauche et la droite. Lorsqu'elle est définie sur `vertical` , le carrousel s'affiche verticalement, l'utilisateur peut alors balayer de haut en bas.

### Styles

Vous pouvez utiliser l'élément `bento-base-carousel` pour styliser librement le carrousel.

#### Personnalisation des boutons fléchés

Les boutons fléchés peuvent être personnalisés en intégrant votre propre balisage personnalisé. Par exemple, vous pouvez recréer le style par défaut avec les codes HTML et CSS suivants :

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```html
<bento-base-carousel …>
  <div>first slide</div>
  …
  <button slot="next-arrow" class="carousel-next" aria-label="Next"></button>
  <button
    slot="prev-arrow"
    class="carousel-prev"
    aria-label="Previous"
  ></button>
</bento-base-carousel>
```

---

## Composant Preact/React

Les exemples ci-dessous illustrent l'utilisation de `<BentoBaseCarousel>` en tant que composant fonctionnel utilisable avec les bibliothèques Preact ou React.

### Exemple : importation via npm

```sh
npm install @bentoproject/base-carousel
```

```javascript
import React from 'react';
import {BentoBaseCarousel} from '@bentoproject/base-carousel/react';
import '@bentoproject/base-carousel/styles.css';

function App() {
  return (
    <BentoBaseCarousel>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

### Interactivité et utilisation de l'API

Les composants Bento sont hautement interactifs via leur API. L'API du composant `BentoBaseCarousel` est accessible en passant une `ref` :

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoBaseCarousel ref={ref}>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

#### Actions

L'API `BentoBaseCarousel` vous permet d'effectuer les actions suivantes :

##### next()

Déplace le carrousel vers l'avant de `advanceCount` diapositives.

```javascript
ref.current.next();
```

##### prev()

Déplace le carrousel vers l'arrière de `advanceCount` diapositives.

```javascript
ref.current.prev();
```

##### goToSlide(index: number)

Déplace le carrousel vers la diapositive spécifiée par l'argument `index`. Remarque : `index` sera normalisé à un nombre supérieur ou égal à `0` et inférieur au nombre de diapositives donné.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

#### Événements

L'API `BentoBaseCarousel` vous permet de vous inscrire et de répondre aux événements suivants :

##### onSlideChange

Cet événement est déclenché lorsque l'index affiché par le carrousel a changé.

```jsx
<BentoBaseCarousel onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

### Mise en page et style

#### Type de conteneur

Le composant `BentoBaseCarousel` a un type de taille de mise en page défini. Pour vous assurer que le composant s'affiche correctement, assurez-vous d'appliquer une taille au composant et à ses enfants immédiats via une mise en page CSS souhaitée (comme celle définie avec `height`, `width`, `aspect-ratio`, ou d'autres propriétés similaires). Ceux-ci peuvent être appliqués de manière intégrée :

```jsx
<BentoBaseCarousel style={{width: 300, height: 100}}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

Ou via `className`:

```jsx
<BentoBaseCarousel className="custom-styles">
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}

.custom-styles > * {
  aspect-ratio: 4/1;
}
```

### Changement de diapositive de droite à gauche

`<BentoBaseCarousel>` nécessite que vous définissiez quand il est dans un contexte de droite à gauche (rtl) (par exemple, les pages arabes et hébraïques). Bien que le carrousel fonctionne généralement sans cela, il peut y avoir quelques bugs. Vous pouvez indiquer au carrousel qu'il doit fonctionner en `rtl` comme suit :

```jsx
<BentoBaseCarousel dir="rtl">…</BentoBaseCarousel>
```

Si le carrousel est dans un contexte RTL et que vous souhaitez que le carrousel fonctionne en LTR, vous pouvez explicitement définir `dir="ltr"` sur le carrousel.

### Mise en page des diapositives

Les diapositives sont automatiquement dimensionnées par le carrousel lorsque vous ne spécifiez **pas** de `mixedLengths`.

```jsx
<BentoBaseCarousel>
  <img style={{height: '100%', width: '100%'}} src="…" />
</BentoBaseCarousel>
```

Les diapositives ont une hauteur implicite lorsque le carrousel est mis en page. Cela peut facilement être modifié avec CSS. Lors de la spécification de la hauteur, la diapositive sera centrée verticalement dans le carrousel.

Si vous souhaitez centrer horizontalement le contenu de votre diapositive, vous devrez créer un élément d'emballage et l'utiliser pour centrer le contenu.

### Nombre de diapositives visibles

Lorsque vous modifiez le nombre de diapositives visibles à l'aide de `visibleSlides`, en réponse à une requête multimédia, vous souhaiterez probablement modifier les proportions du carrousel lui-même pour qu'il corresponde au nouveau nombre de diapositives visibles. Par exemple, si vous souhaitez afficher trois diapositives à la fois avec des proportions d'un par un, vous souhaiterez des proportions de trois par un pour le carrousel lui-même. De même, avec quatre diapositives à la fois, vous voudriez des proportions de quatre par un. De plus, lorsque vous modifiez `visibleSlides`, vous souhaiterez probablement modifier `advanceCount`.

```jsx
const count = window.matchMedia('(max-width: 600px)').matches ? 4 : 3;

<BentoBaseCarousel
  visibleCount={count}
  advanceCount={count}
>
  <img style={{height: '100%', width: '100%'}} src="…" />
  …
</BentoBaseCarousel>
```

### Propriétés

#### Nombre de diapositives visibles

##### mixedLength

Soit `true` ou `false`, la valeur par défaut est `false`. Si elle est sur true, elle utilise la largeur existante (ou la hauteur lorsqu'elle est horizontale) pour chacune des diapositives. Cela permet d'utiliser un carrousel avec des diapositives de différentes largeurs.

##### visibleCount

Un nombre, la valeur par défaut est `1`. Détermine combien de diapositives doivent être affichées à un moment donné. Des valeurs fractionnaires peuvent être utilisées pour rendre visible une partie d'une ou plusieurs diapositives supplémentaires. Cette option est ignorée lorsque `mixed-length` est sur `true`.

##### advanceCount

Un nombre, la valeur par défaut est `1`. Détermine le nombre de diapositives que le carrousel avancera lors de l'avancement à l'aide des flèches Précédent ou Suivant. Ceci est utile lors de la spécification de l'attribut `visibleCount`.

#### Avance automatique

##### autoAdvance

Soit `true` ou `false`, la valeur par défaut est `false`. Avance automatiquement le carrousel à la diapositive suivante en fonction d'un délai. Si l'utilisateur modifie manuellement les diapositives, l'avance automatique est arrêtée. Notez que si `loop` n'est pas activé, lorsque vous atteignez le dernier élément, l'avance automatique reviendra au premier élément.

##### autoAdvanceCount

Un nombre, la valeur par défaut est `1`. Détermine le nombre de diapositives que le carrousel avancera lors de l'avance automatique. Ceci est utile lors de la spécification de l'attribut `visible-count`.

##### autoAdvanceInterval

Un nombre, la valeur par défaut est `1000`. Spécifie la durée, en millisecondes, entre les avances automatiques suivantes du carrousel.

##### autoAdvanceLoops

Un nombre, par défaut `∞`. Le nombre de fois que le carrousel doit avancer à travers les diapositives avant de s'arrêter.

#### Accrochage

##### snap

Soit `true` ou `false`, la valeur par défaut est `true`. Détermine si le carrousel doit ou non s'accrocher aux diapositives lors du défilement.

##### snapAlign

Soit `start` soit `center`. Lors du démarrage de l'alignement, le début d'une diapositive (par exemple le bord gauche, lors d'un alignement horizontal) est aligné avec le début d'un carrousel. Lors de l'alignement du centre, le centre d'une diapositive est aligné avec le centre d'un carrousel.

##### snapBy

Un nombre, la valeur par défaut est `1`. Cela détermine la granularité de l'accrochage et est utile lors de l'utilisation de `visible-count`.

#### Divers

##### controls

Soit `"always"` , `"auto"` ou `"never"`, la valeur par défaut est `"auto"`. Cela détermine si et quand les flèches de navigation Précédent/Suivant sont affichées. Remarque : Lorsque `outset-arrows` est sur `true`, les flèches sont affichées `"always"`.

-   `always` : les flèches sont toujours affichées.
-   `auto` : les flèches s'affichent lorsque le carrousel a reçu la dernière interaction via la souris et ne s'affichent pas lorsque le carrousel a reçu la dernière interaction via commande tactile. Lors du premier chargement pour les appareils tactiles, des flèches sont affichées jusqu'à la première interaction.
-   `never` : les flèches ne sont jamais affichées.

##### defaultSlide

Un nombre, la valeur par défaut est `0`. Cela détermine la diapositive initiale affichée dans le carrousel.

##### loop

Soit `true` ou `false`, la valeur par défaut est `false` en cas d'omission. Lorsqu'elle est définie sur true, le carrousel permettra à l'utilisateur de passer du premier élément au dernier élément et vice versa. Il doit y avoir au moins trois fois le nombre `visible-count` de diapositives présentes pour que la boucle se produise.

##### orientation

Soit `horizontal` ou `vertical`, la valeur par défaut est `horizontal`. Lorsqu'elle est sur `horizontal`, le carrousel s'affichera horizontalement, l'utilisateur pourra alors balayer vers la gauche et la droite. Lorsqu'elle est définie sur `vertical` , le carrousel s'affiche verticalement, l'utilisateur peut alors balayer de haut en bas.

### Styles

Vous pouvez utiliser l'élément `BentoBaseCarousel` pour styliser librement le carrousel.

#### Personnalisation des boutons fléchés

Les boutons fléchés peuvent être personnalisés en intégrant votre propre balisage personnalisé. Par exemple, vous pouvez recréer le style par défaut avec les codes HTML et CSS suivants :

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```jsx
function CustomPrevButton(props) {
  return <button {...props} className="carousel-prev" />;
}

function CustomNextButton(props) {
  return <button {...props} className="carousel-prev" />;
}

<BentoBaseCarousel
  arrowPrevAs={CustomPrevButton}
  arrowNextAs={CustomNextButton}
>
  <div>first slide</div>
  // …
</BentoBaseCarousel>
```
