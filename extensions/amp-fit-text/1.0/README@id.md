# Bento Fit Text

Menentukan ukuran font terbaik agar sesuai dengan semua konten teks tertentu dalam ruang yang tersedia.

Konten yang diharapkan untuk Bento Fit Text adalah teks atau konten inline lainnya, tetapi dapat juga berisi konten non-inline.

## Komponen Web

Anda harus menyertakan perpustakaan CSS yang diperlukan setiap komponen Bento untuk menjamin pemuatan yang tepat dan sebelum menambahkan gaya khusus. Atau gunakan gaya pra-peningkatan ringan yang tersedia inline. Lihat [Tata Letak dan gaya](#layout-and-style).

Contoh di bawah ini menunjukkan penggunaan komponen web `<bento-fit-text>`

### Contoh: Impor melalui npm

```sh
npm install @bentoproject/fit-text
```

```javascript
import {defineElement as defineBentoFitText} from '@bentoproject/fit-text';
defineBentoFitText();
```

### Contoh: Sertakan melalui `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-fit-text {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
</head>
<bento-fit-text id="my-fit-text">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque inermis
  reprehendunt.
</bento-fit-text>
<div class="buttons" style="margin-top: 8px">
  <button id="font-button">Change max-font-size</button>
  <button id="content-button">Change content</button>
</div>

<script>
  (async () => {
    const fitText = document.querySelector('#my-fit-text');
    await customElements.whenDefined('bento-fit-text');

    // set up button actions
    document.querySelector('#font-button').onclick = () =>
      fitText.setAttribute('max-font-size', '40');
    document.querySelector('#content-button').onclick = () =>
      (fitText.textContent = 'new content');
  })();
</script>
```

### Konten meluap

Jika konten `bento-fit-text` melebihi ruang yang tersedia, bahkan setelah `min-font-size` ditentukan, konten yang meluap akan terpotong dan disembunyikan. Browser berbasis WebKit dan Blink menunjukkan elipsis untuk konten yang meluap.

Dalam contoh berikut, kami menetapkan `min-font-size` `40`, dan menambahkan lebih banyak konten di dalam elemen `bento-fit-text`. Ini menyebabkan konten melebihi ukuran induk blok tetapnya, sehingga teks terpotong agar sesuai dengan wadahnya.

```html
<div style="width: 300px; height: 300px; background: #005af0; color: #fff">
  <bento-fit-text min-font-size="40">
    Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
    inermis reprehendunt. Lorem ipsum dolor sit amet, has nisl nihil convenire
    et, vim at aeque inermis reprehendunt
  </bento-fit-text>
</div>
```

### Tata letak dan gaya

Setiap komponen Bento memiliki perpustakaan CSS kecil yang harus Anda sertakan untuk menjamin pemuatan yang tepat tanpa [pergeseran konten](https://web.dev/cls/). Karena kekhususan berbasis urutan, Anda harus secara manual memastikan bahwa lembar gaya (stylesheet) disertakan sebelum gaya kustom apa pun.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-fit-text-1.0.css"
/>
```

Sebagai pilihan lain, Anda juga dapat membuat gaya pra-peningkatan ringan yang tersedia inline:

```html
<style>
  bento-fit-text {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Jenis wadah

Komponen `bento-fit-text` memiliki jenis ukuran tata letak yang telah ditentukan. Untuk memastikan bahwa komponen dirender dengan benar, pastikan untuk menerapkan ukuran pada komponen dan turunan langsungnya (slide) melalui tata letak CSS yang diinginkan (seperti yang ditentukan dengan `height`, `width`, `aspect-ratio`, atau properti sejenis lainnya):

```css
bento-fit-text {
  height: 100px;
  width: 100%;
}
```

### Pertimbangan aksesibilitas untuk konten yang meluap

Walaupun konten yang meluap *secara visual* terpotong agar sesuai dengan wadah, perhatikan bahwa bagian tersebut masih ada di dokumen. Jangan andalkan perilaku luapan untuk sekadar "mengisi" konten dalam jumlah besar di halaman Anda — meskipun secara visual mungkin terlihat sesuai, hal itu dapat menyebabkan halaman menjadi terlalu bertele-tele bagi pengguna teknologi bantu (seperti pembaca layar), karena untuk pengguna seperti ini, semua konten yang terpotong akan tetap dibaca/diumumkan secara penuh.

### Atribut

#### Kueri Media

Atribut untuk `<bento-fit-text>` dapat dikonfigurasi untuk menggunakan opsi yang berbeda berdasarkan [kueri media](./../../../docs/spec/amp-html-responsive-attributes.md).

#### `min-font-size`

Menentukan ukuran font minimum dalam piksel sebagai bilangan bulat yang dapat digunakan `bento-fit-text`.

#### `max-font-size`

Menentukan ukuran font maksimum dalam piksel sebagai bilangan bulat yang dapat digunakan `bento-fit-text`.

---

## Komponen Preact/React

Contoh di bawah ini menunjukkan penggunaan `<BentoFitText>` sebagai komponen fungsional yang dapat digunakan dengan perpustakaan Preact atau React.

### Contoh: Impor melalui npm

```sh
npm install @bentoproject/fit-text
```

```javascript
import React from 'react';
import {BentoFitText} from '@bentoproject/fit-text/react';
import '@bentoproject/fit-text/styles.css';

function App() {
  return (
    <BentoFitText>
      Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
      inermis reprehendunt.
    </BentoFitText>
  );
}
```

### Tata letak dan gaya

#### Jenis wadah

Komponen `BentoFitText` memiliki jenis ukuran tata letak yang telah ditentukan. Untuk memastikan bahwa komponen dirender dengan benar, pastikan untuk menerapkan ukuran pada komponen dan turunan langsungnya (slide) melalui tata letak CSS yang diinginkan (seperti yang ditentukan dengan `height`, `width`, `aspect-ratio`, atau properti sejenis lainnya). Ini dapat diterapkan inline:

```jsx
<BentoFitText style={{width: 300, height: 100}}>
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

Atau melalui `className`:

```jsx
<BentoFitText className="custom-styles">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Prop

#### `minFontSize`

Menentukan ukuran font minimum dalam piksel sebagai bilangan bulat yang dapat digunakan `bento-fit-text`.

#### `maxFontSize`

Menentukan ukuran font maksimum dalam piksel sebagai bilangan bulat yang dapat digunakan `bento-fit-text`.
