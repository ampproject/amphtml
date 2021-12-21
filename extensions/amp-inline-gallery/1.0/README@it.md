# Bento Inline Gallery

Permette di visualizzare le diapositive, con punti di impaginazione e miniature facoltativi.

La sua implementazione utilizza un componente [Bento Base Carousel](https://www.npmjs.com/package/@bentoproject/base-carousel). Entrambi i componenti devono essere installati correttamente per l'ambiente di utilizzo (Componente Web vs Preact).

## Componente web

Per garantirne il corretto caricamento, occorre inserire la libreria CSS richiesta per ogni componente Bento prima di aggiungere stili personalizzati. Si possono anche usare i poco ingombranti stili di pre-aggiornamento disponibili inline. Consultare la sezione [Layout e stile](#layout-and-style).

Gli esempi seguenti mostrano l'uso del componente web `<bento-inline-gallery>`.

### Esempio: importazione tramite npm

```sh
npm install @bentoproject/inline-gallery
```

```javascript
import {defineElement as defineBentoInlineGallery} from '@bentoproject/inline-gallery';
defineBentoInlineGallery();
```

### Esempio: inclusione tramite `<script>`

L'esempio seguente contiene un componente `bento-inline-gallery` composto da tre diapositive con miniature e un indicatore di divisione in pagine.

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

### Layout e stile

Ogni componente Bento dispone di una piccola libreria CSS che va inclusa per garantire un caricamento corretto senza [spostamenti dei contenuti](https://web.dev/cls/). A causa dell'importanza dell'ordine degli elementi, occorre verificare manualmente che i fogli di stile siano inclusi prima di qualsiasi stile personalizzato.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.css"
/>
```

Oppure, si possono rendere disponibili i poco ingombranti stili di pre-aggiornamento inline:

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

### Attributi di `<bento-inline-gallery-pagination>`

#### `inset`

Valore predefinito: `false`

Attributo booleano che indica se visualizzare l'indicatore di divisione in pagine in rilievo (sovrapponendolo alla sequenza stessa)

### Attributi di `<bento-inline-gallery-thumbnails>`

#### `aspect-ratio`

Opzionale

Valore numerico: rapporto tra larghezza e altezza con cui devono essere visualizzate le diapositive.

#### `loop`

Valore predefinito: `false`

Attributo booleano indicante se le miniature devono formare un ciclo.

### Stile

Si possono usare i selettori di elementi `bento-inline-gallery`, `bento-inline-gallery-pagination`, `bento-inline-gallery-thumbnails` e `bento-base-carousel` per definire liberamente lo stile dell'indicatore di divisione in pagine, delle miniature e della sequenza.

---

## Componente Preact/React

Gli esempi seguenti mostrano l'uso di `<BentoInlineGallery>` come componente funzionale utilizzabile con le librerie Preact o React.

### Esempio: importazione tramite npm

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

### Layout e stile

#### Tipo di contenitore

Il componente `BentoInlineGallery` ha un tipo di layout di dimensione definita. Per garantire il corretto rendering del componente, occorre applicare una dimensione al componente e agli elementi che sono suoi discendenti diretti tramite un layout CSS opportuno (come quelli definiti con le proprietà `width`). Essi sono applicabili inline:

```jsx
<BentoInlineGallery style={{width: 300}}>...</BentoInlineGallery>
```

Oppure tramite `className`:

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

### Oggetti per `BentoInlineGalleryPagination`

Oltre agli [oggetti comuni](../../../docs/spec/bento-common-props.md), BentoInlineGalleryPagination supporta gli oggetti seguenti:

#### `inset`

Valore predefinito: `false`

Attributo booleano che indica se visualizzare l'indicatore di divisione in pagine in rilievo (sovrapponendolo alla sequenza stessa)

### Oggetti per `BentoInlineGalleryThumbnails`

Oltre agli [oggetti comuni](../../../docs/spec/bento-common-props.md), BentoInlineGalleryThumbnails supporta gli oggetti seguenti:

#### `aspectRatio`

Opzionale

Valore numerico: rapporto tra larghezza e altezza con cui devono essere visualizzate le diapositive.

#### `loop`

Valore predefinito: `false`

Attributo booleano indicante se le miniature devono formare un ciclo.
