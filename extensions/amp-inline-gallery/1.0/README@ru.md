# Bento Inline Gallery

Компонент отображает слайды с опциональными миниатюрами и индикатором страниц.

Реализация компонента основана на [Bento Base Carousel](https://www.npmjs.com/package/@bentoproject/base-carousel), поэтому для его работы требуется установка обоих компонентов в соответствующем окружении (веб-компоненты или Preact).

## Веб-компонент

Чтобы гарантировать правильную загрузку, вы должны подключить необходимые CSS-библиотеки всех компонентов Bento (это нужно сделать перед добавлением пользовательских стилей). Как вариант, вы можете использовать встраиваемые облегченные стили от предыдущей версии компонента. См. [Макет и стиль](#layout-and-style).

Представленные ниже примеры демонстрируют использование веб-компонента `<bento-inline-gallery>`.

### Пример: импорт через npm

```sh
npm install @bentoproject/inline-gallery
```

```javascript
import {defineElement as defineBentoInlineGallery} from '@bentoproject/inline-gallery';
defineBentoInlineGallery();
```

### Пример: подключение через `<script>`

Ниже приведен пример элемента `bento-inline-gallery` с тремя слайдами, миниатюрами и индикатором страниц.

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

### Макет и стиль

У каждого компонента Bento есть небольшая библиотека CSS, которую следует подключать, чтобы гарантировать правильную загрузку без [сдвигов содержимого](https://web.dev/cls/). Поскольку приоритетность CSS определяется порядком, следует вручную убедиться, что таблицы стилей подключаются раньше каких-либо пользовательских стилей.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.css"
/>
```

Как вариант, вы также можете использовать встраиваемые облегченные стили от предыдущей версии компонента:

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

### Атрибуты элемента `<bento-inline-gallery-pagination>`

#### `inset`

По умолчанию: `false`

Логический атрибут. Если включить его, то индикатор страниц будет отображаться поверх кольцевой галереи, а не снаружи.

### Атрибуты элемента `<bento-inline-gallery-thumbnails>`

#### `aspect-ratio`

Необязательный

Число. Отношение ширины отображаемых слайдов к их высоте.

#### `loop`

По умолчанию: `false`

Логический атрибут, включающий зацикливание миниатюр.

### Стилизация

Вы можете использовать селекторы элементов `bento-inline-gallery`, `bento-inline-gallery-pagination`, `bento-inline-gallery-thumbnails` и `bento-base-carousel` для свободной стилизации индикатора страниц, миниатюр и кольцевой галереи.

---

## Компонент для Preact/React

В приведенных ниже примерах демонстрируется использование `<BentoInlineGallery>` в качестве функционального компонента, который можно использовать с библиотеками Preact или React.

### Пример: импорт через npm

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

### Макет и стиль

#### Тип контейнера

Компонент `BentoInlineGallery` использует тип макета с указанием размера. Чтобы обеспечить правильный рендеринг компонента, необходимо указать размер самого компонента и его непосредственных дочерних элементов при помощи свойств CSS (например, `width`). Их можно указывать как непосредственно в коде:

```jsx
<BentoInlineGallery style={{width: 300}}>...</BentoInlineGallery>
```

...так и при помощи `className`:

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

### Props элемента `BentoInlineGalleryPagination`

В дополнение к [стандартным props](../../../docs/spec/bento-common-props.md) элемент BentoInlineGalleryPagination поддерживает props, приведенные ниже:

#### `inset`

По умолчанию: `false`

Логический атрибут. Если включить его, то индикатор страниц будет отображаться поверх кольцевой галереи, а не снаружи.

### Props элемента `BentoInlineGalleryThumbnails`

В дополнение к [стандартным props](../../../docs/spec/bento-common-props.md) элемент BentoInlineGalleryThumbnails поддерживает props, приведенные ниже:

#### `aspectRatio`

Необязательный

Число. Отношение ширины отображаемых слайдов к их высоте.

#### `loop`

По умолчанию: `false`

Логический атрибут, включающий зацикливание миниатюр.
