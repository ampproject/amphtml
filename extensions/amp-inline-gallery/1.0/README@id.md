# Bento Inline Gallery

Menampilkan slide, dengan titik dan thumbnail (gambar mini) paginasi opsional.

Penerapannya menggunakan [Bento Base Carousel](https://www.npmjs.com/package/@bentoproject/base-carousel). Kedua komponen harus diinstal dengan benar untuk lingkungan (Komponen Web vs Preact).

## Komponen Web

Anda harus menyertakan perpustakaan CSS yang diperlukan setiap komponen Bento untuk menjamin pemuatan yang tepat dan sebelum menambahkan gaya khusus. Atau gunakan gaya pra-peningkatan ringan yang tersedia inline. Lihat [Tata Letak dan gaya](#layout-and-style).

Contoh di bawah ini menunjukkan penggunaan komponen web `<bento-inline-gallery>`.

### Contoh: Impor melalui npm

```sh
npm install @bentoproject/inline-gallery
```

```javascript
import {defineElement as defineBentoInlineGallery} from '@bentoproject/inline-gallery';
defineBentoInlineGallery();
```

### Contoh: Sertakan melalui `<script>`

Contoh di bawah ini berisi `bento-inline-gallery` yang terdiri dari tiga slide dengan thumbnail dan indikator paginasi.

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

### Tata letak dan gaya

Setiap komponen Bento memiliki perpustakaan CSS kecil yang harus Anda sertakan untuk menjamin pemuatan yang tepat tanpa [pergeseran konten](https://web.dev/cls/). Karena kekhususan berbasis urutan, Anda harus secara manual memastikan bahwa lembar gaya (stylesheet) disertakan sebelum gaya kustom apa pun.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.css"
/>
```

Sebagai pilihan lain, Anda juga dapat membuat gaya pra-peningkatan ringan yang tersedia inline:

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

### Atribut pada `<bento-inline-gallery-pagination>`

#### `inset`

Default: `false`

Atribut Boolean yang menunjukkan apakah akan menampilkan indikator paginasi sebagai sisipan (melapisi korsel itu sendiri)

### Atribut pada `<bento-inline-gallery-thumbnails>`

#### `aspect-ratio`

Opsional

Angka: rasio lebar dan tinggi tempat slide harus ditampilkan.

#### `loop`

Default: `false`

Atribut Boolean yang menunjukkan apakah thumbnail harus berulang.

### Penataan gaya

Anda dapat menggunakan pemilih elemen `bento-base-carousel`, `bento-inline-gallery`, `bento-inline-gallery-pagination`, dan `bento-inline-gallery-thumbnails` untuk mengatur gaya indikator paginasi, thumbnail, dan korsel dengan bebas.

---

## Komponen Preact/React

Contoh di bawah ini menunjukkan penggunaan `<BentoInlineGallery>` sebagai komponen fungsional yang dapat digunakan dengan perpustakaan Preact atau React.

### Contoh: Impor melalui npm

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

### Tata letak dan gaya

#### Jenis wadah

Komponen `BentoInlineGallery` memiliki tipe ukuran tata letak yang ditentukan. Untuk memastikan komponen dirender dengan benar, pastikan untuk menerapkan ukuran ke komponen dan turunan langsungnya (anak) melalui tata letak CSS yang diinginkan (seperti yang ditentukan dengan `width`). Ini dapat diterapkan inline:

```jsx
<BentoInlineGallery style={{width: 300}}>...</BentoInlineGallery>
```

Atau melalui `className`:

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

### Prop untuk `BentoInlineGalleryPagination`

Selain [prop umum](../../../docs/spec/bento-common-props.md), BentoInlineGalleryPagination mendukung prop di bawah ini:

#### `inset`

Default: `false`

Atribut Boolean yang menunjukkan apakah akan menampilkan indikator paginasi sebagai sisipan (melapisi korsel itu sendiri)

### Prop untuk `BentoInlineGalleryThumbnails`

Selain [prop umum](../../../docs/spec/bento-common-props.md), BentoInlineGalleryThumbnails mendukung prop di bawah ini:

#### `aspectRatio`

Opsional

Angka: rasio lebar dan tinggi tempat slide harus ditampilkan.

#### `loop`

Default: `false`

Atribut Boolean yang menunjukkan apakah thumbnail harus berulang.
