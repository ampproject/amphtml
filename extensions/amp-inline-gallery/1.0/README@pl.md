# Składnik Bento Inline Gallery

Wyświetla slajdy z opcjonalnymi kropkami paginacji i miniaturami.

Jego implementacja wykorzystuje składnik [Bento Base Carousel](https://www.npmjs.com/package/@bentoproject/base-carousel). Oba składniki muszą być odpowiednio zainstalowane dla danego środowiska (składnik internetowy albo Preact).

## Składnik internetowy

Przed dodaniem własnych stylów musisz dołączyć wymaganą bibliotekę CSS każdego składnika Bento, aby zagwarantować prawidłowe ładowanie. Można też użyć dostępnych inline uproszczonych stylów sprzed uaktualnienia. Patrz sekcja [Układ i styl](#layout-and-style).

Poniższe przykłady przedstawiają użycie składnika internetowego `<bento-inline-gallery>`.

### Przykład: import za pomocą narzędzia npm

```sh
npm install @bentoproject/inline-gallery
```

```javascript
import {defineElement as defineBentoInlineGallery} from '@bentoproject/inline-gallery';
defineBentoInlineGallery();
```

### Przykład: dołączanie za pomocą znacznika `<script>`

Poniższy przykład zawiera składnik `bento-inline-gallery` składający się z trzech slajdów z miniaturami i wskaźnikiem paginacji.

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

### Układ i styl

Każdy składnik Bento ma małą bibliotekę CSS, którą należy dołączyć, aby zagwarantować prawidłowe ładowanie bez [przesunięć treści](https://web.dev/cls/). Ze względu na specyfikę opartą na kolejności musisz ręcznie zapewnić dołączanie arkuszy stylów przed wszelkimi stylami niestandardowymi.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.css"
/>
```

Można również udostępnić dostępne inline uproszczone style sprzed uaktualnienia:

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

### Atrybuty w sekcji `<bento-inline-gallery-pagination>`

#### `inset`

Domyślnie: `false`

Atrybut logiczny określający, czy wskaźnik paginacji ma być wyświetlany jako wstawka (nakładająca się na samą karuzelę)

### Atrybuty w sekcji `<bento-inline-gallery-thumbnails>`

#### `aspect-ratio`

Opcjonalna

Liczba: proporcja szerokości do wysokości, w jakiej mają być wyświetlane slajdy.

#### `loop`

Domyślnie: `false`

Atrybut logiczny wskazujący, czy miniatury mają być zapętlone.

### Stylizacja

Aby dowolnie stylizować wskaźnik paginacji, miniatury i karuzelę, można użyć selektorów elementów `bento-inline-gallery`, `bento-inline-gallery-paginacja`, `bento-inline-gallery-thumbnails` i `bento-base-carousel`.

---

## Składnik Preact/React

Poniższe przykłady demonstrują użycie `<BentoInlineGallery>` jako składnika funkcjonalnego, którego można używać z bibliotekami Preact lub React.

### Przykład: import za pomocą narzędzia npm

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

### Układ i styl

#### Typ kontenera

Składnik `BentoInlineGallery` ma definiowany typ rozmiaru układu. Aby zapewnić prawidłowe renderowanie składnika, należy zastosować rozmiar do składnika i jego bezpośrednich elementów podrzędnych za pomocą żądanego układu CSS (np. zdefiniowanego za pomocą właściwości `width`). Można je zastosować inline:

```jsx
<BentoInlineGallery style={{width: 300}}>...</BentoInlineGallery>
```

Albo za pomocą atrybutu `className`:

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

### Props for `BentoInlineGalleryPagination`

Oprócz [wspólnych właściwości](../../../docs/spec/bento-common-props.md), składnik BentoInlineGalleryPagination obsługuje poniższe właściwości:

#### `inset`

Domyślnie: `false`

Atrybut logiczny określający, czy wskaźnik paginacji ma być wyświetlany jako wstawka (nakładająca się na samą karuzelę)

### Właściwości elementu `BentoInlineGalleryThumbnails`

Oprócz [wspólnych właściwości](../../../docs/spec/bento-common-props.md), składnik BentoInlineGalleryThumbnails obsługuje poniższe właściwości:

#### `aspectRatio`

Opcjonalny

Liczba: proporcja szerokości do wysokości, w jakiej mają być wyświetlane slajdy.

#### `loop`

Domyślnie: `false`

Atrybut logiczny wskazujący, czy miniatury mają być zapętlone.
