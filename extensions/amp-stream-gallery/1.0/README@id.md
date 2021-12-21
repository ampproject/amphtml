# Bento Stream Gallery

## Penggunaan

Bento Stream Gallery adalah untuk menampilkan beberapa konten serupa sekaligus di sepanjang sumbu horizontal. Untuk menerapkan UX yang lebih disesuaikan, lihat [`bento-base-carousel`](../../amp-base-carousel/1.0/README.md).

Gunakan Bento Stream Gallery sebagai komponen web ([`<bento-stream-gallery>`](#web-component)), atau komponen fungsional Preact/React ([`<BentoStreamGallery>`](#preactreact-component)).

### Komponen Web

Anda harus menyertakan perpustakaan CSS yang diperlukan setiap komponen Bento untuk menjamin pemuatan yang tepat dan sebelum menambahkan gaya khusus. Atau gunakan gaya pra-peningkatan ringan yang tersedia inline. Lihat [Tata Letak dan gaya](#layout-and-style).

Contoh di bawah ini menunjukkan penggunaan komponen web `<bento-stream-gallery>`.

#### Contoh: Impor melalui npm

[example preview="top-frame" playground="false"]

Instal melalui npm:

```sh
npm install @ampproject/bento-stream-gallery
```

```javascript
import '@ampproject/bento-stream-gallery';
```

[/example]

#### Contoh: Sertakan melalui `<script>`

Contoh di bawah ini berisi `bento-stream-gallery` dengan tiga bagian. Atribut `expanded` pada bagian ketiga memperluasnya pada pemuatan halaman.

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

#### Interaktivitas dan penggunaan API

Komponen berkemampuan Bento yang digunakan sebagai komponen mandiri sangat interaktif melalui API mereka. API komponen `bento-stream-gallery` dapat diakses dengan menyertakan tag skrip berikut ini di dokumen Anda:

```javascript
await customElements.whenDefined('bento-stream-gallery');
const api = await streamGallery.getApi();
```

##### Tindakan

**next()**

Memajukan korsel menurut jumlah slide yang terlihat.

```js
api.next();
```

**prev()**

Memundurkan korsel menurut jumlah slide yang terlihat.

```js
api.prev();
```

**goToSlide(index: number)**

Memindahkan korsel ke slide yang ditentukan oleh argumen `index`. Catatan: `index` akan dinormalisasi ke angka yang lebih besar atau sama dengan `0` dan lebih kecil dari jumlah slide yang diberikan.

```js
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

##### Peristiwa

Komponen Bento Stream Gallery memungkinkan Anda mendaftar dan merespons peristiwa berikut ini:

**slideChange**

Peristiwa ini dipicu ketika indeks yang ditampilkan oleh korsel telah berubah. Indeks baru tersedia melalui `event.data.index`.

```js
streamGallery.addEventListener('slideChange', (e) => console.log(e.data.index))
```

#### Tata letak dan gaya

Setiap komponen Bento memiliki perpustakaan CSS kecil yang harus Anda sertakan untuk menjamin pemuatan yang tepat tanpa [pergeseran konten](https://web.dev/cls/). Karena kekhususan berbasis urutan, Anda harus secara manual memastikan bahwa lembar gaya (stylesheet) disertakan sebelum gaya kustom apa pun.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-streamGallery-1.0.css">
```

Sebagai pilihan lain, Anda juga dapat membuat gaya pra-peningkatan ringan yang tersedia inline:

```html
<style data-bento-boilerplate>
  bento-stream-gallery {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Atribut

##### Perilaku

###### `controls`

Baik `"always"` , `"auto"`, maupun `"never"`, default ke `"auto"`. Ini menentukan apakah dan kapan panah navigasi sebelumnya/berikutnya ditampilkan. Catatan: Jika `outset-arrows` bernilai `true`, panah akan ditampilkan `"always"`.

-   `always`: Panah selalu ditampilkan.
-   `auto`: Panah ditampilkan saat korsel baru saja menerima interaksi melalui mouse, dan tidak ditampilkan saat korsel baru saja menerima interaksi melalui sentuhan. Pada pemuatan pertama untuk perangkat sentuh, panah ditampilkan hingga interaksi pertama.
-   `never`: Panah tidak pernah ditampilkan.

###### `extra-space`

`"around"` atau tidak terdefinisi. Ini menentukan bagaimana ruang ekstra dialokasikan setelah menampilkan jumlah slide yang terlihat di korsel yang dihitung. Jika `"around"`, spasi putih didistribusikan secara merata di sekitar korsel dengan `justify-content: center`; jika tidak, ruang dialokasikan di sebelah kanan korsel untuk dokumen LTR dan di sebelah kiri untuk dokumen RTL.

###### `loop`

Baik `true` maupun `false`, default ke `true`. Jika benar, korsel akan memungkinkan pengguna untuk berpindah dari item pertama kembali ke item terakhir dan sebaliknya. Harus ada minimal tiga slide agar perulangan bisa terjadi.

###### `outset-arrows`

Baik `true` maupun `false`, default ke `false`. Jika benar, korsel akan menampilkan panahnya di awal dan di kedua sisi slide. Perhatikan bahwa dengan panah awal, wadah slide akan memiliki panjang efektif 100px kurang dari ruang yang dialokasikan untuk wadah yang diberikan — 50px per panah di kedua sisi. Jika salah, korsel akan menampilkan panah yang disisipkan dan dihamparkan di atas tepi kiri dan kanan slide.

###### `peek`

Angka, default ke `0`. Ini menentukan berapa banyak slide tambahan yang akan ditampilkan (di satu atau kedua sisi slide saat ini) sebagai keterjangkauan kepada pengguna yang menunjukkan bahwa korsel dapat diusap.

##### Visibilitas slide galeri

###### `min-visible-count`

Angka, default ke `1`. Menentukan jumlah minimum slide yang harus ditampilkan pada waktu tertentu. Nilai pecahan dapat digunakan untuk membuat bagian dari slide tambahan terlihat.

###### `max-visible-count`

Angka, default ke [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Menentukan jumlah maksimum slide yang harus ditampilkan pada waktu tertentu. Nilai pecahan dapat digunakan untuk membuat bagian dari slide tambahan terlihat.

###### `min-item-width`

Angka, default ke `1`. Menentukan lebar minimum setiap item, digunakan untuk menentukan jumlah item yang dapat ditampilkan sekaligus dalam keseluruhan lebar galeri.

###### `max-item-width`

Angka, default ke [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Menentukan lebar minimum setiap item, digunakan untuk menentukan jumlah item yang dapat ditampilkan sekaligus dalam keseluruhan lebar galeri.

##### Jepretan slide

###### `slide-align`

Baik `start` maupun `center`. Saat mulai menyelaraskan, awal slide (cth.: tepi kiri, saat menyelaraskan horizontal) disejajarkan dengan awal korsel. Saat menyelaraskan tengah, bagian tengah slide disejajarkan dengan bagian tengah korsel.

###### `snap`

Baik `true` maupun `false`, default ke `true`. Menentukan apakah korsel harus terjepret (snap) pada slide saat menggulir atau tidak.

#### Penataan gaya

Anda dapat menggunakan pemilih elemen `bento-stream-gallery` untuk menata gaya streamGallery dengan bebas.

### Komponen Preact/React

Contoh di bawah ini menunjukkan penggunaan `<BentoStreamGallery>` sebagai komponen fungsional yang dapat digunakan dengan perpustakaan Preact atau React.

#### Contoh: Impor melalui npm

[example preview="top-frame" playground="false"]

Instal melalui npm:

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

#### Interaktivitas dan penggunaan API

Komponen Bento sangat interaktif melalui API mereka. API komponen `BentoStreamGallery` dapat diakses dengan melewatkan `ref`:

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

##### Tindakan

API `BentoStreamGallery` memungkinkan Anda melakukan tindakan berikut ini:

**next()**

Memajukan korsel sebanyak `advanceCount` slide.

```javascript
ref.current.next();
```

**prev()**

Memundurkan korsel sebanyak `advanceCount` slide

```javascript
ref.current.prev();
```

**goToSlide(index: number)**

Memindahkan korsel ke slide yang ditentukan oleh argumen `index`. Catatan: `index` akan dinormalisasi ke angka yang lebih besar atau sama dengan `0` dan lebih kecil dari jumlah slide yang diberikan.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

##### Peristiwa

**onSlideChange**

Peristiwa ini dipicu ketika indeks yang ditampilkan oleh korsel telah berubah.

```jsx
<BentoStreamGallery onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoStreamGallery>
```

#### Tata letak dan gaya

**Jenis wadah**

Komponen `BentoStreamGallery` memiliki tipe ukuran tata letak yang ditentukan. Untuk memastikan komponen dirender dengan benar, pastikan untuk menerapkan ukuran ke komponen dan turunan langsungnya (anak) melalui tata letak CSS yang diinginkan (seperti yang ditentukan dengan `width`). Ini dapat diterapkan inline:

```jsx
<BentoStreamGallery style={{width: '300px'}}>
  ...
</BentoStreamGallery>
```

Atau melalui `className`:

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

#### Prop

##### Prop umum

Komponen ini mendukung [prop umum](../../../docs/spec/bento-common-props.md) untuk komponen React dan Preact.

##### Perilaku

###### `controls`

Baik `"always"`, `"auto"`, maupun `"never"`, default ke `"auto"`. Ini menentukan apakah dan kapan panah navigasi sebelumnya/berikutnya ditampilkan. Catatan: Jika `outset-arrows` bernilai `true`, panah akan ditampilkan `"always"`.

-   `always`: Panah selalu ditampilkan.
-   `auto`: Panah ditampilkan saat korsel baru saja menerima interaksi melalui mouse, dan tidak ditampilkan saat korsel baru saja menerima interaksi melalui sentuhan. Pada pemuatan pertama untuk perangkat sentuh, panah ditampilkan hingga interaksi pertama.
-   `never`: Panah tidak pernah ditampilkan.

###### `extraSpace`

`"around"` atau tidak terdefinisi. Ini menentukan bagaimana ruang ekstra dialokasikan setelah menampilkan jumlah slide yang terlihat di korsel yang dihitung. Jika `"around"`, spasi putih didistribusikan secara merata di sekitar korsel dengan `justify-content: center`; jika tidak, ruang dialokasikan di sebelah kanan korsel untuk dokumen LTR dan di sebelah kiri untuk dokumen RTL.

###### `loop`

Baik `true` maupun `false`, default ke `true`. Jika benar, korsel akan memungkinkan pengguna untuk berpindah dari item pertama kembali ke item terakhir dan sebaliknya. Harus ada minimal tiga slide agar perulangan bisa terjadi.

###### `outsetArrows`

Baik `true` maupun `false`, default ke `false`. Jika benar, korsel akan menampilkan panahnya di awal dan di kedua sisi slide. Perhatikan bahwa dengan panah awal, wadah slide akan memiliki panjang efektif 100px kurang dari ruang yang dialokasikan untuk wadah yang diberikan — 50px per panah di kedua sisi. Jika salah, korsel akan menampilkan panah yang disisipkan dan dihamparkan di atas tepi kiri dan kanan slide.

###### `peek`

Angka, default ke `0`. Ini menentukan berapa banyak slide tambahan yang akan ditampilkan (di satu atau kedua sisi slide saat ini) sebagai keterjangkauan kepada pengguna yang menunjukkan bahwa korsel dapat diusap.

##### Visibilitas slide galeri

###### `minVisibleCount`

Angka, default ke `1`. Menentukan jumlah minimum slide yang harus ditampilkan pada waktu tertentu. Nilai pecahan dapat digunakan untuk membuat bagian dari slide tambahan terlihat.

###### `maxVisibleCount`

Angka, default ke [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Menentukan jumlah maksimum slide yang harus ditampilkan pada waktu tertentu. Nilai pecahan dapat digunakan untuk membuat bagian dari slide tambahan terlihat.

###### `minItemWidth`

Angka, default ke `1`. Menentukan lebar minimum setiap item, digunakan untuk menentukan jumlah item yang dapat ditampilkan sekaligus dalam keseluruhan lebar galeri.

###### `maxItemWidth`

Angka, default ke [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE). Menentukan lebar minimum setiap item, digunakan untuk menentukan jumlah item yang dapat ditampilkan sekaligus dalam keseluruhan lebar galeri.

##### Jepretan slide

###### `slideAlign`

Baik `start` maupun `center`. Saat mulai menyelaraskan, awal slide (cth.: tepi kiri, saat menyelaraskan horizontal) disejajarkan dengan awal korsel. Saat menyelaraskan tengah, bagian tengah slide disejajarkan dengan bagian tengah korsel.

###### `snap`

Baik `true` maupun `false`, default ke `true`. Menentukan apakah korsel harus terjepret (snap) pada slide saat menggulir atau tidak.
