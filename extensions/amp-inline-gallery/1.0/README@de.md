# Bento Inline Gallery

Zeigt Folien mit optionalen Paginierungspunkten und Miniaturansichten an.

Die Implementierung verwendet ein [Bento Base Carousel](https://www.npmjs.com/package/@bentoproject/base-carousel)  Beide Komponenten müssen unter Berücksichtigung der Umgebung ordnungsgemäß installiert werden (Webkomponente vs. Preact).

## Webkomponente

Bevor du benutzerdefinierte Stile hinzufügst, musst du die erforderliche CSS Bibliothek jeder Bento Komponente einbinden, um ein ordnungsgemäßes Laden zu gewährleisten. Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles verwenden, die inline verfügbar sind. Siehe [Layout und Style](#layout-and-style).

Die folgenden Beispiele veranschaulichen die Verwendung der Webkomponente `<bento-inline-gallery>`.

### Beispiel: Import via npm

```sh
npm install @bentoproject/inline-gallery
```

```javascript
import {defineElement as defineBentoInlineGallery} from '@bentoproject/inline-gallery';
defineBentoInlineGallery();
```

### Beispiel: Einbinden via `<script>`

Das folgende Beispiel enthält das Element `bento-inline-gallery` bestehend aus drei Folien mit Miniaturansichten und einem Indikator für die Paginierung.

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

### Layout und Style

Jede Bento Komponente verfügt über eine kleine CSS Bibliothek, die du einbinden musst, um ein ordnungsgemäßes Laden ohne [Sprünge im Inhalt](https://web.dev/cls/) zu gewährleisten. Da hierbei die Reihenfolge wichtig ist, musst du manuell sicherstellen, dass Stylesheets vor allen benutzerdefinierten Styles eingebunden werden.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.css"
/>
```

Alternativ kannst du die leichtgewichtigen Pre-Upgrade Styles auch inline verfügbar machen:

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

### Attribute für `<bento-inline-gallery-pagination>`

#### `inset`

Standard: `false`

Boolesches Attribut, das angibt, ob der Paginierungsindikator eingerückt angezeigt werden soll (und das Karussell selbst überlagert).

### Attribute für `<bento-inline-gallery-thumbnails>`

#### `aspect-ratio`

Optional

Zahl: Verhältnis (Breite zu Höhe), in dem Folien angezeigt werden sollen.

#### `loop`

Standard: `false`

Boolesches Attribut, das angibt, ob Miniaturansichten als Schleife angezeigt werden sollen.

### Styling

Du kannst die Selektoren der Elemente `bento-inline-gallery`, `bento-inline-gallery-pagination`, `bento-inline-gallery-thumbnails` und `bento-base-carousel` verwenden, um den Paginierungsindikator, die Miniaturansichten und das Karussell frei zu gestalten.

---

## Preact/React Komponente

Die folgenden Beispiele demonstrieren die Verwendung von `<BentoInlineGallery>` als funktionale Komponente, die mit den Bibliotheken Preact oder React verwendet werden kann.

### Beispiel: Import via npm

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

### Layout und Style

#### Containertyp

Die Komponente `BentoInlineGallery` besitzt einen definierten Layout Größentyp. Um zu gewährleisten, dass die Komponente richtig rendert, musst du der Komponente und ihren unmittelbar untergeordneten Elementen eine Größe mithilfe eines CSS Layouts zuweisen (z. B. eines Layouts, das mittels `width` definiert wird). Diese können inline angewendet werden:

```jsx
<BentoInlineGallery style={{width: 300}}>...</BentoInlineGallery>
```

Oder via `className`:

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

### Eigenschaften für `BentoInlineGalleryPagination`

Zusätzlich zu den [allgemeinen Eigenschaften](../../../docs/spec/bento-common-props.md) unterstützt BentoInlineGalleryPagination die folgenden Eigenschaften:

#### `inset`

Standard: `false`

Boolesches Attribut, das angibt, ob der Paginierungsindikator eingerückt angezeigt werden soll (und das Karussell selbst überlagert).

### Eigenschaften für `BentoInlineGalleryThumbnails`

Zusätzlich zu den [allgemeinen Eigenschaften](../../../docs/spec/bento-common-props.md) unterstützt BentoInlineGalleryThumbnails die folgenden Eigenschaften:

#### `aspectRatio`

Optional

Zahl: Verhältnis (Breite zu Höhe), in dem Folien angezeigt werden sollen.

#### `loop`

Standard: `false`

Boolesches Attribut, das angibt, ob Miniaturansichten als Schleife angezeigt werden sollen.
