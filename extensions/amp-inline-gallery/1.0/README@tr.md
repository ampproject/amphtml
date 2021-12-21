# Bento Inline Gallery

İsteğe bağlı sayfalandırma noktaları ve küçük resimlerle slaytları görüntüler.

Uygulaması bir [Bento Base Carousel](https://www.npmjs.com/package/@bentoproject/base-carousel) kullanır. Her iki bileşen de (Web Bileşeni ve Preact) ortam için uygun şekilde kurulmalıdır.

## Web Bileşeni

Uygun yüklemeyi garanti etmek için ve özel stiller eklemeden önce her Bento bileşeninin gerekli CSS kitaplığını eklemelisiniz. Veya satır içi olarak sunulan hafif ön yükseltme stillerini kullanın. [Yerleşim ve stil](#layout-and-style) konusuna bakın.

Aşağıdaki örnekler, `<bento-inline-gallery>` web bileşeninin kullanımını göstermektedir.

### Örnek: npm ile içe aktarma

```sh
npm install @bentoproject/inline-gallery
```

```javascript
import {defineElement as defineBentoInlineGallery} from '@bentoproject/inline-gallery';
defineBentoInlineGallery();
```

### Örnek: `<script>` ile ekleme

Aşağıdaki örnek, küçük resimler ve bir sayfalandırma göstergesi ile üç slayttan oluşan `bento-inline-gallery`'yi içeriyor.

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

### Yerleşim ve stil

[Her Bento bileşeni, içerik kaymaları](https://web.dev/cls/) olmadan düzgün yüklemeyi garanti etmek için eklemeniz gereken küçük bir CSS kitaplığına sahiptir. Düzene dayalı özgüllük nedeniyle, herhangi bir özel stilden önce stil sayfalarının dahil edilmesini manuel olarak sağlamalısınız.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.css"
/>
```

Alternatif olarak, hafif ön yükseltme stillerini satır içi olarak da kullanıma sunabilirsiniz:

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

### `<bento-inline-gallery-pagination>` üzerinde öznitelikler

#### `inset`

Varsayılan: `false`

Sayfalandırma göstergesinin iç metin olarak görüntülenip görüntülenmeyeceğini belirten Boole özelliği (döngünün kendisini kaplar)

### `<bento-inline-gallery-thumbnails>` üzerinde öznitelikler

#### `aspect-ratio`

İsteğe bağlı

Sayı: Slaytların görüntülenmesi gereken genişlik ve yükseklik oranı.

#### `loop`

Varsayılan: `false`

Küçük resimlerin döngüye girmesi gerekip gerekmediğini gösteren Boole özelliği.

### Stil

`bento-inline-gallery`, `bento-inline-gallery-pagination`, `bento-inline-gallery-thumbnails` ve `bento-base-carousel` öğe seçicilerini, sayfalandırma göstergesine, küçük resimlere ve döngüye özgürce stil vermek için kullanabilirsiniz.

---

## Preact/React Bileşeni

Aşağıdaki örnekler, Preact veya React kitaplıklarıyla kullanılabilen işlevsel bir bileşen olarak `<BentoInlineGallery>`'yi gösteriyor.

### Örnek: npm ile içe aktarma

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

### Yerleşim ve stil

#### Kapsayıcı tipi

`BentoInlineGallery` bileşeninin tanımlanmış bir yerleşim boyutu türü vardır. Bileşenin doğru bir şekilde oluşturulduğundan emin olmak için, bileşene ve onun en yakın alt öğelerine istenen bir CSS yerleşimi ile bir boyut uygulamayı unutmayın (örneğin, `width` ile tanımlanmış bir düzen). Bunlar satır içinde uygulanabilir:

```jsx
<BentoInlineGallery style={{width: 300}}>...</BentoInlineGallery>
```

Veya `className` aracılığıyla:

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

### `BentoInlineGalleryPagination` için aksesuarlar

BentoInlineGalleryPagination, [ortak aksesuarlara](../../../docs/spec/bento-common-props.md) ek olarak aşağıdaki aksesuarları da destekler:

#### `inset`

Varsayılan: `false`

Sayfalandırma göstergesinin iç metin olarak görüntülenip görüntülenmeyeceğini belirten Boole özelliği (döngünün kendisini kaplar)

### `BentoInlineGalleryThumbnails` için aksesuarlar

BentoInlineGalleryThumbnails, [ortak aksesuarlara](../../../docs/spec/bento-common-props.md) ek olarak aşağıdaki aksesuarları da destekler:

#### `aspectRatio`

İsteğe bağlı

Sayı: Slaytların görüntülenmesi gereken genişlik ve yükseklik oranı.

#### `loop`

Varsayılan: `false`

Küçük resimlerin döngüye girmesi gerekip gerekmediğini gösteren Boole özelliği.
