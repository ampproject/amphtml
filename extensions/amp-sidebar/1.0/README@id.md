# Bento Sidebar

Menyediakan cara untuk menampilkan konten meta yang ditujukan untuk akses sementara, seperti navigasi, tautan, tombol, menu. Bilah samping (sidebar) dapat dibuka dengan menekan tombol, sementara konten utama tetap berada di bawahnya secara visual.

## Komponen Web

Anda harus menyertakan perpustakaan CSS yang diperlukan setiap komponen Bento untuk menjamin pemuatan yang tepat dan sebelum menambahkan gaya khusus. Atau gunakan gaya pra-peningkatan ringan yang tersedia inline. Lihat [Tata Letak dan gaya](#layout-and-style).

Contoh di bawah ini menunjukkan penggunaan komponen web `<bento-sidebar>`.

### Contoh: Impor melalui npm

```sh
npm install @bentoproject/sidebar
```

```javascript
import {defineElement as defineBentoSidebar} from '@bentoproject/sidebar';
defineBentoSidebar();
```

### Contoh: Sertakan melalui `<script>`

```html
<head>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-sidebar:not([open]) {
      display: none !important;
    }
  </style>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-sidebar-1.0.js"
  ></script>
</head>
<body>
  <bento-sidebar id="sidebar1" side="right">
    <ul>
      <li>Nav item 1</li>
      <li>Nav item 2</li>
      <li>Nav item 3</li>
      <li>Nav item 4</li>
      <li>Nav item 5</li>
      <li>Nav item 6</li>
    </ul>
  </bento-sidebar>

  <div class="buttons" style="margin-top: 8px">
    <button id="open-sidebar">Open sidebar</button>
  </div>

  <script>
    (async () => {
      const sidebar = document.querySelector('#sidebar1');
      await customElements.whenDefined('bento-sidebar');
      const api = await sidebar.getApi();

      // set up button actions
      document.querySelector('#open-sidebar').onclick = () => api.open();
    })();
  </script>
</body>
```

### Bento Toolbar

Anda dapat membuat elemen Bento Toolbar yang ditampilkan di `<body>` dengan menentukan atribut `toolbar` dengan media kueri dan atribut `toolbar-target` dengan ID elemen pada elemen `<nav>` yang merupakan anak (turunan) dari `<bento-sidebar>`. `toolbar` menduplikasi elemen `<nav>` dan turunannya dan menambahkan elemen ke elemen `toolbar-target`.

#### Perilaku

-   Bilah samping dapat menerapkan bilah alat dengan menambahkan elemen nav dengan atribut `toolbar` dan `toolbar-target`.
-   Elemen navigasi harus merupakan turunan dari `<bento-sidebar>` dan mengikuti format ini: `<nav toolbar="(media-query)" toolbar-target="elementID">`.
    -   Misalnya, ini akan menjadi penggunaan bilah alat yang valid: `<nav toolbar="(max-width: 1024px)" toolbar-target="target-element">`.
-   Perilaku toolbar (bilah alat) hanya diterapkan saat kueri media atribut `toolbar` valid. Selain itu, sebuah elemen dengan ID atribut `toolbar-target` harus ada pada halaman agar bilah alat dapat diterapkan.

##### Contoh: Bilah Alat Dasar

Di dalam contoh berikut ini, kami menampilkan `toolbar` jika lebar jendela kurang dari atau sama dengan 767px. `toolbar` berisi elemen input pencarian. Elemen `toolbar` akan ditambahkan ke elemen `<div id="target-element">`.

```html
<bento-sidebar id="sidebar1" side="right">
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>

  <nav toolbar="(max-width: 767px)" toolbar-target="target-element">
    <ul>
      <li>
        <input placeholder="Search..." />
      </li>
    </ul>
  </nav>
</bento-sidebar>

<div id="target-element"></div>
```

### Interaktivitas dan penggunaan API

Komponen berkemampuan Bento yang digunakan sebagai komponen web mandiri sangat interaktif melalui API mereka. API komponen `bento-sidebar` dapat diakses dengan menyertakan tag skrip berikut ini di dokumen Anda:

```javascript
await customElements.whenDefined('bento-sidebar');
const api = await carousel.getApi();
```

#### Tindakan

API `bento-sidebar` memungkinkan Anda melakukan tindakan berikut ini:

##### open()

Membuka bilah samping.

```javascript
api.open();
```

##### close()

Menutup bilah samping.

```javascript
api.close();
```

##### toggle()

Mengalihkan status buka bilah samping.

```javascript
api.toggle(0);
```

### Tata letak dan gaya

Setiap komponen Bento memiliki perpustakaan CSS kecil yang harus Anda sertakan untuk menjamin pemuatan yang tepat tanpa [pergeseran konten](https://web.dev/cls/). Karena kekhususan berbasis urutan, Anda harus secara manual memastikan bahwa lembar gaya (stylesheet) disertakan sebelum gaya kustom apa pun.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-sidebar-1.0.css"
/>
```

Sebagai pilihan lain, Anda juga dapat membuat gaya pra-peningkatan ringan yang tersedia inline:

```html
<style>
  bento-sidebar:not([open]) {
    display: none !important;
  }
</style>
```

#### Gaya kustom

Komponen `bento-sidebar` dapat ditata dengan CSS standar.

-   `width` pada `bento-sidebar` dapat diatur untuk menyesuaikan lebar dari nilai 45px yang telah ditentukan sebelumnya.
-   Ketinggian `bento-sidebar` dapat diatur untuk menyesuaikan ketinggian bilah samping, jika diperlukan. Jika tingginya melebihi 100 vw, bilah samping akan memiliki bilah gulir (scrollbar) vertikal. Tinggi preset bilah samping adalah 100 vw dan dapat diganti dalam CSS untuk membuatnya lebih pendek.
-   Status bilah samping saat ini ditampilkan melalui `open` yang ditetapkan pada `bento-sidebar` saat bilah samping terbuka pada halaman.

```css
bento-sidebar[open] {
  height: 100%;
  width: 50px;
}
```

### Pertimbangan UX

Saat menggunakan `<bento-sidebar>` , ingatlah bahwa pengguna Anda akan sering melihat halaman Anda pada perangkat seluler, yang mungkin menampilkan tajuk pada posisi tetap. Selain itu, browser sering kali menampilkan tajuk tetapnya sendiri di bagian atas halaman. Menambahkan elemen posisi tetap lainnya di bagian atas layar akan menghabiskan banyak ruang layar seluler dengan konten yang tidak memberikan informasi baru kepada pengguna.

Karena alasan ini, kami merekomendasikan agar keterjangkauan untuk membuka bilah samping tidak ditempatkan di tajuk lebar penuh yang tetap.

-   Bilah samping hanya dapat muncul di sisi kiri atau kanan halaman.
-   Tinggi maksimal bilah samping adalah 100 vh, jika tingginya melebihi 100 vh maka akan muncul bilah gulir vertikal. Tinggi default ditetapkan ke 100 vh dalam CSS dan dapat diganti dalam CSS.
-   Lebar bilah samping dapat diatur dan disesuaikan dengan menggunakan CSS.
-   `<bento-sidebar>` _direkomendasikan_ untuk menjadi anak langsung dari `<body>` untuk mempertahankan urutan DOM logis untuk aksesibilitas serta untuk menghindari perubahan perilakunya dengan elemen wadah. Perhatikan bahwa memiliki leluhur `bento-sidebar` dengan seperangkat `z-index` dapat menyebabkan bilah samping muncul di bawah elemen lain (seperti tajuk), dan ini merusak fungsinya.

### Atribut

#### side

Menunjukkan dari sisi halaman mana bilah samping harus dibuka, `left` atau `right`. Jika `side` tidak ditentukan, nilai `side` akan diwarisi dari atribut `dir` tag `body` (`ltr` =&gt; `left`, `rtl` =&gt; `right`); jika tidak ada `dir`, `side` distandarkan ke `left`.

#### open

Atribut ini hadir saat bilah samping terbuka.

#### toolbar

Atribut ini ada pada elemen `<nav toolbar="(media-query)" toolbar-target="elementID">` anak, dan menerima kueri media tentang kapan harus menampilkan bilah alat. Kunjungi bagian [Bilah Alat](#bento-toolbar) untuk mengetahui informasi lebih lanjut tentang penggunaan bilah alat.

#### toolbar-target

Atribut ini ada pada `<nav toolbar="(media-query)" toolbar-target="elementID">` anak, dan menerima ID elemen pada halaman. Atribut `toolbar-target` akan menempatkan bilah alat ke dalam ID tertentu dari elemen pada halaman, tanpa penataan bilah alat default. Kunjungi bagian [Bilah Alat](#bento-toolbar) untuk mengetahui informasi lebih lanjut tentang penggunaan bilah alat.

---

## Komponen Preact/React

Contoh di bawah ini menunjukkan penggunaan `<BentoSidebar>` sebagai komponen fungsional yang dapat digunakan dengan perpustakaan Preact atau React.

### Contoh: Impor melalui npm

```sh
npm install @bentoproject/sidebar
```

```javascript
import React from 'react';
import {BentoSidebar} from '@bentoproject/sidebar/react';
import '@bentoproject/sidebar/styles.css';

function App() {
  return (
    <BentoSidebar>
      <ul>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>Nav item 4</li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
      </ul>
    </BentoSidebar>
  );
}
```

### Bento Toolbar

Anda dapat membuat elemen Bento Toolbar yang ditampilkan di `<body>` dengan menentukan prop `toolbar` dengan sebuah kueri media dan prop `toolbarTarget` dengan ID elemen pada komponen `<BentoSidebarToolbar>` yang merupakan anak dari `<BentoSidebar>`. `toolbar` menduplikasi elemen `<BentoSidebarToolbar>` dan turunannya dan menambahkan elemen ke elemen `toolbarTarget`.

#### Perilaku

-   Bilah samping dapat menerapkan bilah alat dengan menambahkan elemen nav dengan prop `toolbar` dan `toolbarTarget`.
-   Elemen navigasi harus merupakan turunan dari `<BentoSidebar>` dan mengikuti format ini: `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">`.
    -   Misalnya, ini akan menjadi penggunaan bilah alat yang valid: `<BentoSidebarToolbar toolbar="(max-width: 1024px)" toolbarTarget="target-element">`.
-   Perilaku bilah alat hanya diterapkan saat kueri media prop `toolbar` valid. Selain itu, sebuah elemen dengan ID prop `toolbarTarget` harus ada pada halaman agar bilah alat dapat diterapkan.

##### Contoh: Bilah Alat Dasar

Di dalam contoh berikut ini, kami menampilkan `toolbar` jika lebar jendela kurang dari atau sama dengan 767px. `toolbar` berisi elemen input pencarian. Elemen `toolbar` akan ditambahkan ke elemen `<div id="target-element">`.

```jsx
<>
  <BentoSidebar>
    <ul>
      <li>Nav item 1</li>
      <li>Nav item 2</li>
      <li>Nav item 3</li>
      <li>Nav item 4</li>
      <li>Nav item 5</li>
      <li>Nav item 6</li>
    </ul>
    <BentoSidebarToolbar
      toolbar="(max-width: 767px)"
      toolbarTarget="target-element"
    >
      <ul>
        <li>Toolbar Item 1</li>
        <li>Toolbar Item 2</li>
      </ul>
    </BentoSidebarToolbar>
  </BentoSidebar>

  <div id="target-element"></div>
</>
```

### Interaktivitas dan penggunaan API

Komponen Bento sangat interaktif melalui API mereka. API komponen `BentoSidebar` dapat diakses dengan melewatkan `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoSidebar ref={ref}>
      <ul>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>Nav item 4</li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
      </ul>
    </BentoSidebar>
  );
}
```

#### Tindakan

API `BentoSidebar` memungkinkan Anda melakukan tindakan berikut ini:

##### open()

Membuka bilah samping.

```javascript
ref.current.open();
```

##### close()

Menutup bilah samping.

```javascript
ref.current.close();
```

##### toggle()

Mengalihkan status buka bilah samping.

```javascript
ref.current.toggle(0);
```

### Tata letak dan gaya

Komponen `BentoSidebar` dapat ditata dengan CSS standar.

-   `width` pada `bento-sidebar` dapat diatur untuk menyesuaikan lebar dari nilai 45px yang telah ditentukan sebelumnya.
-   Ketinggian `bento-sidebar` dapat diatur untuk menyesuaikan ketinggian bilah samping, jika diperlukan. Jika tingginya melebihi 100 vw, bilah samping akan memiliki bilah gulir (scrollbar) vertikal. Tinggi preset bilah samping adalah 100 vw dan dapat diganti dalam CSS untuk membuatnya lebih pendek.

Untuk memastikan komponen merender seperti yang Anda inginkan, pastikan untuk menerapkan ukuran pada komponen. Ini dapat diterapkan inline:

```jsx
<BentoSidebar style={{width: 300, height: '100%'}}>
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
</BentoSidebar>
```

Atau melalui `className`:

```jsx
<BentoSidebar className="custom-styles">
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
</BentoSidebar>
```

```css
.custom-styles {
  height: 100%;
  width: 300px;
}
```

### Pertimbangan UX

Saat menggunakan `<BentoSidebar>` , ingatlah bahwa pengguna Anda akan sering melihat halaman Anda pada perangkat seluler, yang mungkin menampilkan tajuk pada posisi tetap. Selain itu, browser sering kali menampilkan tajuk tetapnya sendiri di bagian atas halaman. Menambahkan elemen posisi tetap lainnya di bagian atas layar akan menghabiskan banyak ruang layar seluler dengan konten yang tidak memberikan informasi baru kepada pengguna.

Karena alasan ini, kami merekomendasikan agar keterjangkauan untuk membuka bilah samping tidak ditempatkan di tajuk lebar penuh yang tetap.

-   Bilah samping hanya dapat muncul di sisi kiri atau kanan halaman.
-   Tinggi maksimal bilah samping adalah 100 vh, jika tingginya melebihi 100 vh maka akan muncul bilah gulir vertikal. Tinggi default ditetapkan ke 100 vh dalam CSS dan dapat diganti dalam CSS.
-   Lebar bilah samping dapat diatur dan disesuaikan dengan menggunakan CSS.
-   `<BentoSidebar>` _direkomendasikan_ untuk menjadi anak langsung dari `<body>` untuk mempertahankan urutan DOM logis untuk aksesibilitas serta untuk menghindari perubahan perilakunya dengan elemen wadah. Perhatikan bahwa memiliki leluhur `BentoSidebar` dengan seperangkat `z-index` dapat menyebabkan bilah samping muncul di bawah elemen lain (seperti tajuk), dan ini merusak fungsinya.

### Prop

#### side

Menunjukkan dari sisi halaman mana bilah samping harus dibuka, `left` atau `right`. Jika `side` tidak ditentukan, nilai `side` akan diwarisi dari atribut `dir` tag `body` (`ltr` =&gt; `left`, `rtl` =&gt; `right`); jika tidak ada `dir`, `side` distandarkan ke `left`.

#### toolbar

Prop ini ada pada elemen `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` anak, dan menerima kueri media tentang kapan harus menampilkan bilah alat. Kunjungi bagian [Bilah Alat](#bento-toolbar) untuk mengetahui informasi lebih lanjut tentang penggunaan bilah alat.

#### toolbarTarget

Atribut ini ada pada `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` anak, dan menerima ID elemen pada halaman. Prop `toolbarTarget` akan menempatkan bilah alat ke dalam ID tertentu dari elemen pada halaman, tanpa penataan bilah alat default. Kunjungi bagian [Bilah Alat](#bento-toolbar) untuk mengetahui informasi lebih lanjut tentang penggunaan bilah alat.
