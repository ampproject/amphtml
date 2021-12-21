# Bento Carousel

Korsel umum untuk menampilkan beberapa konten serupa di sepanjang sumbu horizontal atau vertikal.

Setiap turunan langsung komponen ini dianggap sebagai item di dalam korsel. Masing-masing nodus ini mungkin juga memiliki turunan (anak) yang berubah-ubah.

Korsel terdiri dari sejumlah item yang berubah-ubah, serta panah navigasi opsional untuk maju atau mundur satu item.

Korsel bergerak maju di antara item jika pengguna mengusap atau menggunakan tombol tanda panah yang dapat disesuaikan.

## Komponen Web

Anda harus menyertakan perpustakaan CSS yang diperlukan setiap komponen Bento untuk menjamin pemuatan yang tepat dan sebelum menambahkan gaya khusus. Atau gunakan gaya pra-peningkatan ringan yang tersedia inline. Lihat [Tata Letak dan gaya](#layout-and-style).

Contoh di bawah ini menunjukkan penggunaan komponen web `<bento-base-carousel>`.

### Contoh: Impor melalui npm

```sh
npm install @bentoproject/base-carousel
```

```javascript
import {defineElement as defineBentoBaseCarousel} from '@bentoproject/base-carousel';
defineBentoBaseCarousel();
```

### Contoh: Sertakan melalui `<script>`

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

### Interaktivitas dan penggunaan API

Komponen berkemampuan Bento yang digunakan sebagai komponen web mandiri sangat interaktif melalui API mereka. API komponen `bento-base-carousel` dapat diakses dengan menyertakan tag skrip berikut ini di dokumen Anda:

```javascript
await customElements.whenDefined('bento-base-carousel');
const api = await carousel.getApi();
```

#### Tindakan

API `bento-base-carousel` memungkinkan Anda melakukan tindakan berikut ini:

##### next()

Memindahkan korsel ke depan dengan slide `advance-count`.

```javascript
api.next();
```

##### prev()

Memindahkan korsel ke belakang dengan slide `advance-count`.

```javascript
api.prev();
```

##### goToSlide(index: number)

Memindahkan korsel ke slide yang ditentukan oleh argumen `index`. Catatan: `index` akan dinormalisasi ke angka yang lebih besar atau sama dengan `0` dan lebih kecil dari jumlah slide yang diberikan.

```javascript
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

#### Peristiwa

API `bento-base-carousel` memungkinkan Anda untuk mendaftar dan merespons peristiwa berikut ini:

##### slideChange

Peristiwa ini dipicu ketika indeks yang ditampilkan oleh korsel telah berubah. Indeks baru tersedia melalui `event.data.index`.

```javascript
carousel.addEventListener('slideChange', (e) => console.log(e.data.index));
```

### Tata letak dan gaya

Setiap komponen Bento memiliki perpustakaan CSS kecil yang harus Anda sertakan untuk menjamin pemuatan yang tepat tanpa [pergeseran konten](https://web.dev/cls/). Karena kekhususan berbasis urutan, Anda harus secara manual memastikan bahwa lembar gaya (stylesheet) disertakan sebelum gaya kustom apa pun.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css"
/>
```

Sebagai pilihan lain, Anda juga dapat membuat gaya pra-peningkatan ringan yang tersedia inline:

```html
<style>
  bento-base-carousel {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Jenis wadah

Komponen `bento-base-carousel` memiliki jenis ukuran tata letak yang telah ditentukan. Untuk memastikan bahwa komponen dirender dengan benar, pastikan untuk menerapkan ukuran pada komponen dan turunan langsungnya (slide) melalui tata letak CSS yang diinginkan (seperti yang ditentukan dengan `height`, `width`, `aspect-ratio`, atau properti sejenis lainnya):

```css
bento-base-carousel {
  height: 100px;
  width: 100%;
}

bento-base-carousel > * {
  aspect-ratio: 4/1;
}
```

### Perubahan slide kanan-ke-kiri

`<bento-base-carousel>` mengharuskan Anda menentukan kapan berada dalam konteks kanan-ke-kiri (rtl) (cth.: halaman Arab, Ibrani). Sementara korsel umumnya akan bekerja tanpa ini, mungkin ada beberapa bug. Anda dapat memberi tahu korsel bahwa ia harus beroperasi sebagai `rtl` sebagai berikut:

```html
<bento-base-carousel dir="rtl" …>
  …
</bento-base-carousel>
```

Jika korsel berada dalam konteks RTL, dan Anda ingin korsel beroperasi sebagai LTR, Anda dapat secara eksplisit menetapkan `dir="ltr"` pada korsel.

### Tata letak slide

Ukuran slide secara otomatis diatur oleh korsel saat **tidak** menentukan `mixed-lengths`.

```html
<bento-base-carousel …>
  <img style="height: 100%; width: 100%" src="…" />
</bento-base-carousel>
```

Slide memiliki tinggi implisit saat korsel ditata. Ini dapat dengan mudah diubah dengan CSS. Saat menentukan ketinggian, slide akan dipusatkan secara vertikal di dalam korsel.

Jika Anda ingin memusatkan konten slide Anda secara horizontal, Anda sebaiknya membuat elemen pembungkus, dan menggunakannya untuk memusatkan konten.

### Jumlah slide yang terlihat

Saat mengubah jumlah slide yang terlihat dengan menggunakan slide yang `visible-slides`, sebagai respons terhadap kueri media, Anda mungkin ingin mengubah rasio aspek korsel itu sendiri agar sesuai dengan jumlah slide baru yang terlihat. Misalnya, jika Anda ingin menampilkan tiga slide sekaligus dengan rasio aspek satu per satu, Anda ingin rasio aspek tiga per satu untuk korsel itu sendiri. Demikian pula, dengan empat slide sekaligus Anda menginginkan rasio aspek empat per satu. Selain itu, saat mengubah `visible-slides`, Anda mungkin ingin mengubah `advance-count`.

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

### Atribut

#### Kueri Media

Atribut untuk `<bento-base-carousel>` dapat dikonfigurasi untuk menggunakan opsi yang berbeda berdasarkan [kueri media](./../../../docs/spec/amp-html-responsive-attributes.md).

#### Jumlah slide yang terlihat

##### mixed-length

Baik `true` maupun `false`, membuat default ke `false`. Jika benar, gunakan lebar yang ada (atau tinggi saat horizontal) untuk setiap slide. Ini memungkinkan korsel dengan slide dengan lebar berbeda untuk digunakan.

##### visible-count

Sebuah angka, default ke `1`. Menentukan berapa banyak slide yang harus ditampilkan pada waktu tertentu. Nilai pecahan dapat digunakan untuk membuat bagian dari sebuah slide tambahan terlihat. Opsi ini diabaikan jika `mixed-length` adalah `true`.

##### advance-count

Sebuah angka, default ke `1`. Menentukan berapa banyak slide yang akan dimajukan korsel saat maju menggunakan tanda panah sebelumnya atau berikutnya. Ini berguna saat menentukan atribut `visible-count`.

#### Maju otomatis

##### auto-advance

Baik `true` maupun `false`, membuat default ke `false`. Secara otomatis memajukan korsel ke slide berikutnya berdasarkan penundaan. Jika pengguna mengubah slide secara manual, maka gerak maju otomatis dihentikan. Harap ketahui bahwa jika `loop` tidak diaktifkan, saat mencapai item terakhir, gerak maju otomatis akan bergerak mundur ke item pertama.

##### auto-advance-count

Angka, default ke `1`. Menentukan berapa banyak slide yang akan dimajukan korsel saat maju secara otomatis. Ini berguna saat menentukan atribut `visible-count`.

##### auto-advance-interval

Angka, default ke `1000`. Menentukan jumlah waktu, dalam milidetik, antara gerak maju otomatis berikutnya dari korsel.

##### auto-advance-loops

Angka, default ke `∞`. Berapa kali korsel harus maju melalui slide sebelum berhenti.

#### Snapping

##### snap

Baik `true` maupun `false`, default ke `true`. Menentukan apakah korsel harus terjepret (snap) pada slide saat menggulir atau tidak.

##### snap-align

Baik `start` maupun `center`. Saat mulai menyelaraskan, awal slide (cth.: tepi kiri, saat menyelaraskan horizontal) disejajarkan dengan awal korsel. Saat menyelaraskan tengah, bagian tengah slide disejajarkan dengan bagian tengah korsel.

##### snap-by

Angka, default ke `1`. Ini menentukan granularitas jepretan dan berguna saat menggunakan `visible-count`.

#### Lain-lain

##### controls

Baik `"always"` , `"auto"`, maupun `"never"`, default ke `"auto"`. Ini menentukan apakah dan kapan panah navigasi sebelumnya/berikutnya ditampilkan. Catatan: Jika `outset-arrows` bernilai `true`, panah akan ditampilkan `"always"`.

-   `always`: Panah selalu ditampilkan.
-   `auto`: Panah ditampilkan saat korsel baru saja menerima interaksi melalui mouse, dan tidak ditampilkan saat korsel baru saja menerima interaksi melalui sentuhan. Pada pemuatan pertama untuk perangkat sentuh, panah ditampilkan hingga interaksi pertama.
-   `never`: Panah tidak pernah ditampilkan.

##### slide

Angka, default ke `0`. Ini menentukan slide awal yang ditampilkan di korsel. Ini dapat dimutasi dengan `Element.setAttribute` untuk mengontrol slide mana yang sedang ditampilkan.

##### loop

Baik `true` maupun `false`, default ke `false` jika dihilangkan. Jika benar, korsel akan memungkinkan pengguna untuk berpindah dari item pertama kembali ke item terakhir dan sebaliknya. Harus ada minimal tiga kali `visible-count` slide yang terlihat agar perulangan terjadi.

##### orientation

Baik `horizontal` maupun `vertical`, default ke `horizontal`. Saat `horizontal`, korsel akan ditata secara horizontal, di mana pengguna dapat mengusap ke kiri dan kanan. Saat `vertical`, korsel ditata secara vertikal, di mana pengguna dapat mengusap ke atas dan ke bawah.

### Penataan gaya

Anda dapat menggunakan pemilih elemen `bento-base-carousel` untuk menata korsel dengan bebas.

#### Menyesuaikan tombol tanda panah

Tombol tanda panah dapat dikustomisasi dengan memasukkan markah kustom Anda sendiri. Misalnya, Anda dapat membuat ulang gaya default dengan HTML dan CSS berikut ini:

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

## Komponen Preact/React

Contoh di bawah ini menunjukkan penggunaan `<BentoBaseCarousel>` sebagai komponen fungsional yang dapat digunakan dengan perpustakaan Preact atau React.

### Contoh: Impor melalui npm

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

### Interaktivitas dan penggunaan API

Komponen Bento sangat interaktif melalui API mereka. API komponen `BentoBaseCarousel` dapat diakses dengan melewatkan `ref`:

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

#### Tindakan

API `BentoBaseCarousel` memungkinkan Anda melakukan tindakan berikut ini:

##### next()

Memajukan korsel sebanyak `advanceCount` slide.

```javascript
ref.current.next();
```

##### prev()

Memundurkan korsel sebanyak `advanceCount` slide

```javascript
ref.current.prev();
```

##### goToSlide(index: number)

Memindahkan korsel ke slide yang ditentukan oleh argumen `index`. Catatan: `index` akan dinormalisasi ke angka yang lebih besar atau sama dengan `0` dan lebih kecil dari jumlah slide yang diberikan.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

#### Peristiwa

API `BentoBaseCarousel` memungkinkan Anda untuk mendaftar dan merespons peristiwa berikut ini:

##### onSlideChange

Peristiwa ini dipicu ketika indeks yang ditampilkan oleh korsel telah berubah.

```jsx
<BentoBaseCarousel onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

### Tata letak dan gaya

#### Jenis wadah

Komponen `BentoBaseCarousel` memiliki jenis ukuran tata letak yang telah ditentukan. Untuk memastikan bahwa komponen dirender dengan benar, pastikan untuk menerapkan ukuran pada komponen dan turunan langsungnya (slide) melalui tata letak CSS yang diinginkan (seperti yang ditentukan dengan `height`, `width`, `aspect-ratio`, atau properti sejenis lainnya). Ini dapat diterapkan inline:

```jsx
<BentoBaseCarousel style={{width: 300, height: 100}}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

Atau melalui `className`:

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

### Perubahan slide kanan-ke-kiri

`<BentoBaseCarousel>` mengharuskan Anda menentukan kapan berada dalam konteks kanan-ke-kiri (rtl) (cth.: halaman Arab, Ibrani). Sementara korsel umumnya akan bekerja tanpa ini, mungkin ada beberapa bug. Anda dapat memberi tahu korsel bahwa ia harus beroperasi sebagai `rtl` sebagai berikut:

```jsx
<BentoBaseCarousel dir="rtl">…</BentoBaseCarousel>
```

Jika korsel berada dalam konteks RTL, dan Anda ingin korsel beroperasi sebagai LTR, Anda dapat secara eksplisit menetapkan `dir="ltr"` pada korsel.

### Tata letak slide

Ukuran slide secara otomatis diatur oleh korsel saat **tidak** menentukan `mixedLengths`.

```jsx
<BentoBaseCarousel>
  <img style={{height: '100%', width: '100%'}} src="…" />
</BentoBaseCarousel>
```

Slide memiliki tinggi implisit saat korsel ditata. Ini dapat dengan mudah diubah dengan CSS. Saat menentukan ketinggian, slide akan dipusatkan secara vertikal di dalam korsel.

Jika Anda ingin memusatkan konten slide Anda secara horizontal, Anda sebaiknya membuat elemen pembungkus, dan menggunakannya untuk memusatkan konten.

### Jumlah slide yang terlihat

Saat mengubah jumlah slide yang terlihat dengan menggunakan slide yang `visibleSlides`, sebagai respons terhadap kueri media, Anda mungkin ingin mengubah rasio aspek korsel itu sendiri agar sesuai dengan jumlah slide baru yang terlihat. Misalnya, jika Anda ingin menampilkan tiga slide sekaligus dengan rasio aspek satu per satu, Anda ingin rasio aspek tiga per satu untuk korsel itu sendiri. Demikian pula, dengan empat slide sekaligus Anda menginginkan rasio aspek empat per satu. Selain itu, saat mengubah `visibleSlides`, Anda mungkin ingin mengubah `advanceCount`.

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

### Prop

#### Jumlah slide yang terlihat

##### mixedLength

Baik `true` maupun `false`, membuat default ke `false`. Jika benar, gunakan lebar yang ada (atau tinggi saat horizontal) untuk setiap slide. Ini memungkinkan korsel dengan slide dengan lebar berbeda untuk digunakan.

##### visibleCount

Sebuah angka, default ke `1`. Menentukan berapa banyak slide yang harus ditampilkan pada waktu tertentu. Nilai pecahan dapat digunakan untuk membuat bagian dari sebuah slide tambahan terlihat. Opsi ini diabaikan jika `mixed-length` adalah `true`.

##### advanceCount

Sebuah angka, default ke `1`. Menentukan berapa banyak slide yang akan dimajukan korsel saat maju menggunakan tanda panah sebelumnya atau berikutnya. Ini berguna saat menentukan atribut `visibleCount`.

#### Maju otomatis

##### autoAdvance

Baik `true` maupun `false`, membuat default ke `false`. Secara otomatis memajukan korsel ke slide berikutnya berdasarkan penundaan. Jika pengguna mengubah slide secara manual, maka gerak maju otomatis dihentikan. Harap ketahui bahwa jika `loop` tidak diaktifkan, saat mencapai item terakhir, gerak maju otomatis akan bergerak mundur ke item pertama.

##### autoAdvanceCount

Angka, default ke `1`. Menentukan berapa banyak slide yang akan dimajukan korsel saat maju secara otomatis. Ini berguna saat menentukan atribut `visible-count`.

##### autoAdvanceInterval

Angka, default ke `1000`. Menentukan jumlah waktu, dalam milidetik, antara gerak maju otomatis berikutnya dari korsel.

##### autoAdvanceLoops

Angka, default ke `∞`. Berapa kali korsel harus maju melalui slide sebelum berhenti.

#### Snapping

##### snap

Baik `true` maupun `false`, default ke `true`. Menentukan apakah korsel harus terjepret (snap) pada slide saat menggulir atau tidak.

##### snapAlign

Baik `start` maupun `center`. Saat mulai menyelaraskan, awal slide (cth.: tepi kiri, saat menyelaraskan horizontal) disejajarkan dengan awal korsel. Saat menyelaraskan tengah, bagian tengah slide disejajarkan dengan bagian tengah korsel.

##### snapBy

Angka, default ke `1`. Ini menentukan granularitas jepretan dan berguna saat menggunakan `visible-count`.

#### Lain-lain

##### controls

Baik `"always"` , `"auto"`, maupun `"never"`, default ke `"auto"`. Ini menentukan apakah dan kapan panah navigasi sebelumnya/berikutnya ditampilkan. Catatan: Jika `outset-arrows` bernilai `true`, panah akan ditampilkan `"always"`.

-   `always`: Panah selalu ditampilkan.
-   `auto`: Panah ditampilkan saat korsel baru saja menerima interaksi melalui mouse, dan tidak ditampilkan saat korsel baru saja menerima interaksi melalui sentuhan. Pada pemuatan pertama untuk perangkat sentuh, panah ditampilkan hingga interaksi pertama.
-   `never`: Panah tidak pernah ditampilkan.

##### defaultSlide

Angka, default ke `0`. Ini menentukan slide awal yang ditampilkan di korsel.

##### loop

Baik `true` maupun `false`, default ke `false` jika dihilangkan. Jika benar, korsel akan memungkinkan pengguna untuk berpindah dari item pertama kembali ke item terakhir dan sebaliknya. Harus ada minimal tiga kali `visible-count` slide yang terlihat agar perulangan terjadi.

##### orientation

Baik `horizontal` maupun `vertical`, default ke `horizontal`. Saat `horizontal`, korsel akan ditata secara horizontal, di mana pengguna dapat mengusap ke kiri dan kanan. Saat `vertical`, korsel ditata secara vertikal, di mana pengguna dapat mengusap ke atas dan ke bawah.

### Penataan gaya

Anda dapat menggunakan pemilih elemen `BentoBaseCarousel` untuk menata korsel dengan bebas.

#### Menyesuaikan tombol tanda panah

Tombol tanda panah dapat dikustomisasi dengan memasukkan markah kustom Anda sendiri. Misalnya, Anda dapat membuat ulang gaya default dengan HTML dan CSS berikut ini:

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
