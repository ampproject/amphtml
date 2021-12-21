# Bento WordPress Embed

## Penggunaan

Iframe yang menampilkan [kutipan](https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/) dari postingan atau halaman WordPress. Gunakan Bento WordPress Embed sebagai komponen web [`<bento-wordpress-embed>`](#web-component), atau komponen fungsional Preact/React [`<BentoWordPressEmbed>`](#preactreact-component).

### Komponen Web

Anda harus menyertakan perpustakaan CSS yang diperlukan setiap komponen Bento untuk menjamin pemuatan yang tepat dan sebelum menambahkan gaya khusus. Atau gunakan gaya pra-peningkatan ringan yang tersedia inline. Lihat [Tata Letak dan gaya](#layout-and-style).

Contoh di bawah ini menunjukkan penggunaan komponen web `<bento-wordpress-embed>`.

#### Contoh: Impor melalui npm

[example preview="top-frame" playground="false"]

Instal melalui npm:

```sh
npm install @ampproject/bento-wordpress-embed
```

```javascript
import '@ampproject/bento-wordpress-embed';
```

[/example]

#### Contoh: Sertakan melalui `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-wordpress-embed {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script async src="https://cdn.ampproject.org/v0/bento-wordpress-embed-1.0.js"></script>
</head>
<bento-wordpress-embed id="my-embed"
  data-url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></bento-wordpress-embed>
<div class="buttons" style="margin-top: 8px;">
  <button id="switch-button">Switch embed</button>
</div>

<script>
  (async () => {
    const embed = document.querySelector('#my-embed');
    await customElements.whenDefined('bento-wordpress-embed');

    // set up button actions
    document.querySelector('#switch-button').onclick = () => embed.setAttribute('data-url', 'https://make.wordpress.org/core/2021/09/09/core-editor-improvement-cascading-impact-of-improvements-to-featured-images/');
  })();
</script>
```

[/example]

#### Tata letak dan gaya

Setiap komponen Bento memiliki perpustakaan CSS kecil yang harus Anda sertakan untuk menjamin pemuatan yang tepat tanpa [pergeseran konten](https://web.dev/cls/). Karena kekhususan berbasis urutan, Anda harus secara manual memastikan bahwa lembar gaya (stylesheet) disertakan sebelum gaya kustom apa pun.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-wordpress-embed-1.0.css">
```

Sebagai pilihan lain, Anda juga dapat membuat gaya pra-peningkatan ringan yang tersedia inline:

```html
<style data-bento-boilerplate>
  bento-wordpress-embed {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**Jenis wadah**

Komponen `bento-wordpress-embed` memiliki jenis ukuran tata letak yang telah ditentukan. Untuk memastikan bahwa komponen dirender dengan benar, pastikan untuk menerapkan ukuran pada komponen dan turunan langsungnya (slide) melalui tata letak CSS yang diinginkan (seperti yang ditentukan dengan `height`, `width`, `aspect-ratio`, atau properti sejenis lainnya):

```css
bento-wordpress-embed {
  height: 100px;
  width: 100%;
}
```

#### Atribut

##### data-url (diperlukan)

URL postingan yang akan disematkan.

### Komponen Preact/React

Contoh di bawah ini menunjukkan penggunaan `<BentoWordPressEmbed>` sebagai komponen fungsional yang dapat digunakan dengan perpustakaan Preact atau React.

#### Contoh: Impor melalui npm

[example preview="top-frame" playground="false"]

Instal melalui npm:

```sh
npm install @ampproject/bento-wordpress-embed
```

```jsx
import React from 'react';
import {BentoWordPressEmbed} from '@ampproject/bento-wordpress-embed/react';

function App() {
  return (
    <BentoWordPressEmbed
      url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
    ></BentoWordPressEmbed>
  );
}
```

[/example]

#### Tata letak dan gaya

**Jenis wadah**

Komponen `BentoWordPressEmbedl` memiliki jenis ukuran tata letak yang telah ditentukan. Untuk memastikan bahwa komponen dirender dengan benar, pastikan untuk menerapkan ukuran pada komponen dan turunan langsungnya (slide) melalui tata letak CSS yang diinginkan (seperti yang ditentukan dengan `height`, `width`, `aspect-ratio`, atau properti sejenis lainnya). Ini dapat diterapkan inline:

```jsx
<BentoWordPressEmbed style={{width: '100%', height: '100px'}}
  url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></BentoWordPressEmbed>
```

Atau melalui `className`:

```jsx
<BentoWordPressEmbed className="custom-styles"
  url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></BentoWordPressEmbed>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

#### Prop

##### url (diperlukan)

URL postingan yang akan disematkan.
