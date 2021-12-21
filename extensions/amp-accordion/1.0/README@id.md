# Bento Accordion

Gunakan Bento Accordion sebagai komponen web ( [`<bento-accordion>`](#web-component)), atau komponen fungsional Preact/React ([`<BentoAccordion>`](#preactreact-component)).

- Bento Accordion menerima satu atau lebih `<section>` sebagai turunan langsungnya.
- Setiap `<section>` harus berisi tepat dua turunan (anak) langsung.
- Anak pertama dalam `<section>` adalah judul untuk bagian Bento Accordion tersebut. Itu harus berupa elemen tajuk, seperti `<h1>-<h6>` atau `<header>`.
- Anak kedua dalam `<section>` adalah konten yang dapat diperluas/diciutkan.
    - Ini bisa berupa tag apa saja yang diizinkan di [HTML AMP](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md).
- Klik atau ketukan pada `<section>` akan memperluas atau menciutkan bagian tersebut.
- Bento Accordion dengan `id` yang telah ditentukan mempertahankan status diciutkan atau diperluas dari setiap bagian selagi pengguna berada di domain Anda.

## Komponen Web

Anda harus menyertakan perpustakaan CSS yang diperlukan setiap komponen Bento untuk menjamin pemuatan yang tepat dan sebelum menambahkan gaya khusus. Atau gunakan gaya pra-peningkatan ringan yang tersedia inline. Lihat [Tata Letak dan gaya](#layout-and-style).

Contoh di bawah ini menunjukkan penggunaan komponen web `<bento-accordion>`.

### Contoh: Impor melalui npm

```sh
npm install @bentoproject/accordion
```

```javascript
import {defineElement as defineBentoAccordion} from '@bentoproject/accordion';
defineBentoAccordion();
```

### Contoh: Sertakan melalui `<script>`

Contoh di bawah ini berisi `bento-accordion` dengan tiga bagian. Atribut `expanded` pada bagian ketiga memperluasnya pada pemuatan halaman.

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-accordion-1.0.js"
  ></script>
  <link
    rel="stylesheet"
    type="text/css"
    href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
  />
</head>
<body>
  <bento-accordion id="my-accordion" disable-session-states>
    <section>
      <h2>Section 1</h2>
      <p>Content in section 1.</p>
    </section>
    <section>
      <h2>Section 2</h2>
      <div>Content in section 2.</div>
    </section>
    <section expanded>
      <h2>Section 3</h2>
      <div>Content in section 3.</div>
    </section>
  </bento-accordion>
  <script>
    (async () => {
      const accordion = document.querySelector('#my-accordion');
      await customElements.whenDefined('bento-accordion');
      const api = await accordion.getApi();

      // programatically expand all sections
      api.expand();
      // programatically collapse all sections
      api.collapse();
    })();
  </script>
</body>
```

### Interaktivitas dan penggunaan API

Komponen berkemampuan Bento yang digunakan sebagai komponen mandiri sangat interaktif melalui API mereka. API komponen `bento-accordion` dapat diakses dengan menyertakan tag skrip berikut ini di dokumen Anda:

```javascript
await customElements.whenDefined('bento-accordion');
const api = await accordion.getApi();
```

#### Tindakan

##### toggle()

Tindakan `toggle` menukar status `expanded` dan `collapsed` pada bagian `bento-accordion`. Saat dipanggil tanpa argumen, ini akan mengalihkan semua bagian akordeon. Untuk menentukan bagian tertentu, tambahkan argumen `section` dan gunakan <code>id</code> yang sesuai sebagai nilainya.

```html
<bento-accordion id="myAccordion">
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Bunch of awesome content</div>
  </section>
</bento-accordion>
<button id="button1">Toggle All Sections</button>
<button id="button2">Toggle Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.toggle();
    };
    document.querySelector('#button2').onclick = () => {
      api.toggle('section1');
    };
  })();
</script>
```

##### expand()

Tindakan `expand` memperluas bagian `bento-accordion`. Jika sebuah bagian sudah diperluas, maka akan tetap diperluas. Saat dipanggil tanpa argumen, ini memperluas semua bagian akordeon. Untuk menentukan bagian, tambahkan argumen `section`, dan gunakan <code>id</code> yang sesuai sebagai nilainya.

```html
<button id="button1">Expand All Sections</button>
<button id="button2">Expand Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.expand();
    };
    document.querySelector('#button2').onclick = () => {
      api.expand('section1');
    };
  })();
</script>
```

##### collapse()

Tindakan `collapse` menciutkan bagian `bento-accordion`. Jika sebuah bagian sudah diciutkan, maka akan tetap diciutkan. Saat dipanggil tanpa argumen, ini akan menciutkan semua bagian akordeon. Untuk menentukan bagian tertentu, tambahkan argumen `section`, dan gunakan <code>id</code> yang sesuai sebagai nilainya.

```html
<button id="button1">Collapse All Sections</button>
<button id="button2">Collapse Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.collapse();
    };
    document.querySelector('#button2').onclick = () => {
      api.collapse('section1');
    };
  })();
</script>
```

#### Peristiwa

API `bento-accordion` memungkinkan Anda untuk mendaftar dan merespons peristiwa berikut ini:

##### expand

Peristiwa ini dipicu ketika sebuah bagian akordeon diperluas dan dikirimkan dari bagian yang diperluas.

Lihat contohnya di bawah.

##### collapse

Peristiwa ini dipicu ketika sebuah bagian akordeon diciutkan dan dikirimkan dari bagian yang diciutkan.

Pada contoh di bawah ini, `section 1` mendengar peristiwa `expand` dan memperluas `section 2` saat ia diperluas. `section 2` mendengar peristiwa `collapse` dan menciutkan `section 1` saat ia diciutkan.

Lihat contohnya di bawah.

```html
<bento-accordion id="eventsAccordion" animate>
  <section id="section1">
    <h2>Section 1</h2>
    <div>Puppies are cute.</div>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Kittens are furry.</div>
  </section>
</bento-accordion>

<script>
  (async () => {
    const accordion = document.querySelector('#eventsAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // when section 1 expands, section 2 also expands
    // when section 2 collapses, section 1 also collapses
    const section1 = document.querySelector('#section1');
    const section2 = document.querySelector('#section2');
    section1.addEventListener('expand', () => {
      api.expand('section2');
    });
    section2.addEventListener('collapse', () => {
      api.collapse('section1');
    });
  })();
</script>
```

### Tata letak dan gaya

Setiap komponen Bento memiliki perpustakaan CSS kecil yang harus Anda sertakan untuk menjamin pemuatan yang tepat tanpa [pergeseran konten](https://web.dev/cls/). Karena kekhususan berbasis urutan, Anda harus secara manual memastikan bahwa lembar gaya (stylesheet) disertakan sebelum gaya kustom apa pun.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
/>
```

Sebagai pilihan lain, Anda juga dapat membuat gaya pra-peningkatan ringan yang tersedia inline:

```html
<style>
  bento-accordion {
    display: block;
    contain: layout;
  }

  bento-accordion,
  bento-accordion > section,
  bento-accordion > section > :first-child {
    margin: 0;
  }

  bento-accordion > section > * {
    display: block;
    float: none;
    overflow: hidden; /* clearfix */
    position: relative;
  }

  @media (min-width: 1px) {
    :where(bento-accordion > section) > :first-child {
      cursor: pointer;
      background-color: #efefef;
      padding-right: 20px;
      border: 1px solid #dfdfdf;
    }
  }

  .i-amphtml-accordion-header {
    cursor: pointer;
    background-color: #efefef;
    padding-right: 20px;
    border: 1px solid #dfdfdf;
  }

  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating),
  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating)
    * {
    display: none !important;
  }
</style>
```

### Atribut

#### animate

Sertakan atribut `animate` dalam `<bento-accordion>` untuk menambahkan animasi "bergulir turun" saat konten diperluas dan animasi "bergulir naik" saat diciutkan.

Atribut ini dapat dikonfigurasi berdasarkan [kueri media](./../../../docs/spec/amp-html-responsive-attributes.md).

```html
<bento-accordion animate>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Content in section 2.</div>
  </section>
</bento-accordion>
```

#### expanded

Terapkan atribut `expanded` pada `<section>` yang bersarang untuk meluaskan bagian tersebut saat halaman dimuat.

```html
<bento-accordion>
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section id="section3" expanded>
    <h2>Section 3</h2>
    <div>Bunch of awesome expanded content</div>
  </section>
</bento-accordion>
```

#### expand-single-section

Izinkan hanya satu bagian untuk diperluas pada satu waktu dengan menerapkan atribut `expand-single-section` pada elemen `<bento-accordion>`. Ini berarti jika pengguna mengetuk `<section>` yang diciutkan, ini akan meluas dan menciutkan `<section>` lain yang diperluas.

```html
<bento-accordion expand-single-section>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <img
      src="https://source.unsplash.com/random/320x256"
      width="320"
      height="256"
    />
  </section>
</bento-accordion>
```

### Penataan gaya

Anda dapat menggunakan pemilih elemen `bento-accordion` untuk menata akordeon dengan bebas.

Ingatlah poin-poin berikut ini saat Anda menata amp-accordion:

- Elemen `bento-accordion` selalu `display: block`.
- `float` tidak dapat menata elemen konten,`<section>`, atau tajuk.
- Bagian yang diperluas menerapkan atribut `expanded` pada elemen `<section>`.
- Elemen konten diperbaiki dengan `overflow: hidden`, dan karenanya tidak dapat memiliki scrollbar.
- Margin elemen `<bento-accordion>`, `<section>`, tajuk, dan konten ditetapkan ke `0`, tetapi dapat diganti dalam gaya kustom.
- Baik elemen tajuk maupun konten adalah `position: relative`.

---

## Komponen Preact/React

Contoh di bawah ini menunjukkan penggunaan `<BentoAccordion>` sebagai komponen fungsional yang dapat digunakan dengan perpustakaan Preact atau React.

### Contoh: Impor melalui npm

```sh
npm install @bentoproject/accordion
```

```javascript
import React from 'react';
import {BentoAccordion} from '@bentoproject/accordion/react';
import '@bentoproject/accordion/styles.css';

function App() {
  return (
    <BentoAccordion>
      <BentoAccordionSection key={1}>
        <BentoAccordionHeader>
          <h1>Section 1</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={2}>
        <BentoAccordionHeader>
          <h1>Section 2</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={3}>
        <BentoAccordionHeader>
          <h1>Section 3</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

### Interaktivitas dan penggunaan API

Komponen Bento sangat interaktif melalui API mereka. API komponen `BentoAccordion` dapat diakses dengan melewatkan `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoAccordion ref={ref}>
      <BentoAccordionSection id="section1" key={1}>
        <BentoAccordionHeader><h1>Section 1</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section2" key={2}>
        <BentoAccordionHeader><h1>Section 2</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section3" key={3}>
        <BentoAccordionHeader><h1>Section 3</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

#### Tindakan

API `BentoAccordion` memungkinkan Anda melakukan tindakan berikut ini:

##### toggle()

Tindakan `toggle` menukar status `expanded` dan `collapsed` pada bagian `bento-accordion`. Saat dipanggil tanpa argumen, ini akan mengalihkan semua bagian akordeon. Untuk menentukan bagian tertentu, tambahkan argumen `section` dan gunakan <code>id</code> yang sesuai sebagai nilainya.

```javascript
ref.current.toggle();
ref.current.toggle('section1');
```

##### expand()

Tindakan `expand` memperluas bagian `bento-accordion`. Jika sebuah bagian sudah diperluas, maka akan tetap diperluas. Saat dipanggil tanpa argumen, ini memperluas semua bagian akordeon. Untuk menentukan bagian, tambahkan argumen `section`, dan gunakan <code>id</code> yang sesuai sebagai nilainya.

```javascript
ref.current.expand();
ref.current.expand('section1');
```

##### collapse()

Tindakan `collapse` menciutkan bagian `bento-accordion`. Jika sebuah bagian sudah diciutkan, maka akan tetap diciutkan. Saat dipanggil tanpa argumen, ini akan menciutkan semua bagian akordeon. Untuk menentukan bagian tertentu, tambahkan argumen `section`, dan gunakan <code>id</code> yang sesuai sebagai nilainya.

```javascript
ref.current.collapse();
ref.current.collapse('section1');
```

#### Peristiwa

API Bento Accordion memungkinkan Anda merespons peristiwa berikut ini:

##### onExpandStateChange

Peristiwa ini dipicu pada sebuah bagian saat sebuah bagian akordeon diperluas atau diciutkan dan dikirimkan dari bagian yang diperluas.

Lihat contohnya di bawah.

##### onCollapse

Peristiwa ini dipicu ketika sebuah bagian akordeon diciutkan dan dikirimkan dari bagian yang diciutkan.

Pada contoh di bawah ini, `section 1` mendengar peristiwa `expand` dan memperluas `section 2` saat ia diperluas. `section 2` mendengar peristiwa `collapse` dan menciutkan `section 1` saat ia diciutkan.

Lihat contohnya di bawah.

```jsx
<BentoAccordion ref={ref}>
  <BentoAccordionSection
    id="section1"
    key={1}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section1 expanded' : 'section1 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 1</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 1</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section2"
    key={2}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section2 expanded' : 'section2 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 2</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 2</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section3"
    key={3}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section3 expanded' : 'section3 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 3</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 3</BentoAccordionContent>
  </BentoAccordionSection>
</BentoAccordion>
```

### Tata letak dan gaya

#### Jenis wadah

Komponen `BentoAccordion` memiliki jenis ukuran tata letak yang telah ditentukan. Untuk memastikan bahwa komponen dirender dengan benar, pastikan untuk menerapkan ukuran pada komponen dan turunan (anak) langsungnya melalui tata letak CSS yang diinginkan (seperti yang ditentukan dengan `height`, `width`, `aspect-ratio`, atau properti sejenis lainnya). Ini dapat diterapkan inline:

```jsx
<BentoAccordion style={{width: 300, height: 100}}>...</BentoAccordion>
```

Atau melalui `className`:

```jsx
<BentoAccordion className="custom-styles">...</BentoAccordion>
```

```css
.custom-styles {
  background-color: red;
}
```

### Prop

#### BentoAccordion

##### animate

Jika benar, maka menggunakan animasi "roll-down"/"roll-up" selama perluasan dan penciutan setiap bagian. Default: `false`

##### expandSingleSection

Jika benar, maka memperluas 1 bagian akan secara otomatis menciutkan semua bagian lainnya. Default: `false`

#### BentoAccordionSection

##### animate

Jika benar, maka menggunakan animasi "roll-down"/"roll-up" selama perluasan dan penciutan bagian tersebut. Default: `false`

##### expanded

Jika benar, memperluas bagian tersebut. Deafult: `false`

##### onExpandStateChange

```typescript
(expanded: boolean): void
```

Callback atau panggil balik untuk mendengarkan perubahan status perluasan. Menggunakan bendera boolean sebagai parameter yang menunjukkan apakah bagian itu baru saja diperluas (`false` menunjukkan itu diciutkan)

#### BentoAccordionHeader

#### Prop umum

Komponen ini mendukung [prop umum](../../../docs/spec/bento-common-props.md) untuk komponen React dan Preact.

BentoAccordionHeader belum mendukung prop kustom apa pun

#### BentoAccordionContent

#### Prop umum

Komponen ini mendukung [prop umum](../../../docs/spec/bento-common-props.md) untuk komponen React dan Preact.

BentoAccordionContent belum mendukung prop kustom apa pun
