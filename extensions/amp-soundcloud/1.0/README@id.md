# Bento Soundcloud

Menyematkan klip [Soundcloud](https://soundcloud.com).

## Komponen Web

Anda harus menyertakan perpustakaan CSS yang diperlukan setiap komponen Bento untuk menjamin pemuatan yang tepat dan sebelum menambahkan gaya khusus. Atau gunakan gaya pra-peningkatan ringan yang tersedia inline. Lihat [Tata Letak dan gaya](#layout-and-style).

Contoh di bawah ini menunjukkan penggunaan komponen web `<bento-soundcloud>`.

### Contoh: Impor melalui npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import {defineElement as defineBentoSoundcloud} from '@bentoproject/soundcloud';
defineBentoSoundcloud();
```

### Contoh: Sertakan melalui `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-soundcloud {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.js"
  ></script>
  <style>
    bento-soundcloud {
      aspect-ratio: 1;
    }
  </style>
</head>
<bento-soundcloud
  id="my-track"
  data-trackid="243169232"
  data-visual="true"
></bento-soundcloud>
<div class="buttons" style="margin-top: 8px">
  <button id="change-track">Change track</button>
</div>

<script>
  (async () => {
    const soundcloud = document.querySelector('#my-track');
    await customElements.whenDefined('bento-soundcloud');

    // set up button actions
    document.querySelector('#change-track').onclick = () => {
      soundcloud.setAttribute('data-trackid', '243169232');
      soundcloud.setAttribute('data-color', 'ff5500');
      soundcloud.removeAttribute('data-visual');
    };
  })();
</script>
```

### Tata letak dan gaya

Setiap komponen Bento memiliki perpustakaan CSS kecil yang harus Anda sertakan untuk menjamin pemuatan yang tepat tanpa [pergeseran konten](https://web.dev/cls/). Karena kekhususan berbasis urutan, Anda harus secara manual memastikan bahwa lembar gaya (stylesheet) disertakan sebelum gaya kustom apa pun.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
/>
```

Sebagai pilihan lain, Anda juga dapat membuat gaya pra-peningkatan ringan yang tersedia inline:

```html
<style>
  bento-soundcloud {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Jenis wadah

Komponen `bento-soundcloud` memiliki jenis ukuran tata letak yang telah ditentukan. Untuk memastikan bahwa komponen dirender dengan benar, pastikan untuk menerapkan ukuran pada komponen dan turunan langsungnya (slide) melalui tata letak CSS yang diinginkan (seperti yang ditentukan dengan `height`, `width`, `aspect-ratio`, atau properti sejenis lainnya):

```css
bento-soundcloud {
  height: 100px;
  width: 100%;
}
```

### Atribut

<table>
  <tr>
    <td width="40%"><strong>data-trackid</strong></td>
    <td>Atribut ini diperlukan jika <code>data-playlistid</code> tidak ditentukan.<br> Nilai untuk atribut ini adalah ID trek, bilangan bulat.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlistid</strong></td>
    <td>Atribut ini diperlukan jika <code>data-trackid</code> tidak ditentukan. Nilai untuk atribut ini adalah ID daftar putar, bilangan bulat.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-secret-token (optional)</strong></td>
    <td>Token rahasia trek, jika bersifat pribadi.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-visual (optional)</strong></td>
    <td>Jika ditetapkan ke <code>true</code>, menampilkan mode "Visual" lebar penuh; jika tidak, ini akan ditampilkan sebagai mode "Klasik". Nilai default atau standarnya adalah <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-color (optional)</strong></td>
    <td>Atribut ini adalah penggantian warna khusus untuk mode "Klasik". Atribut diabaikan dalam mode "Visual". Tentukan nilai warna heksadesimal, tanpa awalan # (cth.: <code>data-color="e540ff"</code>).</td>
  </tr>
</table>

---

## Komponen Preact/React

Contoh di bawah ini menunjukkan penggunaan `<BentoSoundcloud>` sebagai komponen fungsional yang dapat digunakan dengan perpustakaan Preact atau React.

### Contoh: Impor melalui npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import React from 'react';
import {BentoSoundcloud} from '@bentoproject/soundcloud/react';
import '@bentoproject/soundcloud/styles.css';

function App() {
  return <BentoSoundcloud trackId="243169232" visual={true}></BentoSoundcloud>;
}
```

### Tata letak dan gaya

#### Jenis wadah

Komponen `BentoSoundcloud` memiliki jenis ukuran tata letak yang telah ditentukan. Untuk memastikan bahwa komponen dirender dengan benar, pastikan untuk menerapkan ukuran pada komponen dan turunan langsungnya (slide) melalui tata letak CSS yang diinginkan (seperti yang ditentukan dengan `height`, `width`, `aspect-ratio`, atau properti sejenis lainnya). Ini dapat diterapkan inline:

```jsx
<BentoSoundcloud
  style={{width: 300, height: 100}}
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

Atau melalui `className`:

```jsx
<BentoSoundcloud
  className="custom-styles"
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Prop

<table>
  <tr>
    <td width="40%"><strong>trackId</strong></td>
    <td>Atribut ini diperlukan jika <code>data-playlistid</code> tidak ditentukan.<br> Nilai untuk atribut ini adalah ID trek, bilangan bulat.</td>
  </tr>
  <tr>
    <td width="40%"><strong>playlistId</strong></td>
    <td>Atribut ini diperlukan jika <code>data-trackid</code> tidak ditentukan. Nilai untuk atribut ini adalah ID daftar putar, bilangan bulat.</td>
  </tr>
  <tr>
    <td width="40%"><strong>secretToken (optional)</strong></td>
    <td>Token rahasia trek, jika bersifat pribadi.</td>
  </tr>
  <tr>
    <td width="40%"><strong>visual (optional)</strong></td>
    <td>Jika ditetapkan ke <code>true</code>, menampilkan mode "Visual" lebar penuh; jika tidak, ini akan ditampilkan sebagai mode "Klasik". Nilai default atau standarnya adalah <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>color (optional)</strong></td>
    <td>Atribut ini adalah penggantian warna khusus untuk mode "Klasik". Atribut diabaikan dalam mode "Visual". Tentukan nilai warna heksadesimal, tanpa awalan # (cth.: <code>data-color="e540ff"</code>).</td>
  </tr>
</table>
