# Bento Social Share

Menampilkan tombol berbagi untuk platform sosial atau berbagi sistem.

Saat ini, tidak ada tombol yang dibuat oleh Bento Social Share (termasuk tombol untuk penyedia pra-konfigurasi) yang memiliki label atau nama yang dapat diakses yang terpapar teknologi pendukung (seperti pembaca layar). Pastikan untuk menyertakan `aria-label` dengan label deskriptif, karena jika tidak, kontrol ini hanya akan diumumkan sebagai elemen "tombol" yang tidak berlabel.

## Komponen Web

Anda harus menyertakan perpustakaan CSS yang diperlukan setiap komponen Bento untuk menjamin pemuatan yang tepat dan sebelum menambahkan gaya khusus. Atau gunakan gaya pra-peningkatan ringan yang tersedia inline. Lihat [Tata Letak dan gaya](#layout-and-style).

Contoh di bawah ini menunjukkan penggunaan komponen web `<bento-social-share>`.

### Contoh: Impor melalui npm

```sh
npm install @bentoproject/social-share
```

```javascript
import {defineElement as defineBentoSocialShare} from '@bentoproject/social-share';
defineBentoSocialShare();
```

### Contoh: Sertakan melalui `<script>`

```html
<head>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-social-share {
      display: inline-block;
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
      width: 60px;
      height: 44px;
    }
  </style>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-twitter-1.0.js"
  ></script>
  <style>
    bento-social-share {
      width: 375px;
      height: 472px;
    }
  </style>
</head>

<bento-social-share
  id="my-share"
  type="twitter"
  aria-label="Share on Twitter"
></bento-social-share>

<div class="buttons" style="margin-top: 8px">
  <button id="change-share">Change share button</button>
</div>

<script>
  (async () => {
    const button = document.querySelector('#my-share');
    await customElements.whenDefined('bento-social-share');

    // set up button actions
    document.querySelector('#change-share').onclick = () => {
      twitter.setAttribute('type', 'linkedin');
      twitter.setAttribute('aria-label', 'Share on LinkedIn');
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
  href="https://cdn.ampproject.org/v0/bento-social-share-1.0.css"
/>
```

Sebagai pilihan lain, Anda juga dapat membuat gaya pra-peningkatan ringan yang tersedia inline:

```html
<style>
  bento-social-share {
    display: inline-block;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    width: 60px;
    height: 44px;
  }
</style>
```

#### Jenis wadah

Komponen `bento-social-share` memiliki jenis ukuran tata letak yang telah ditentukan. Untuk memastikan bahwa komponen dirender dengan benar, pastikan untuk menerapkan ukuran pada komponen dan turunan langsungnya (slide) melalui tata letak CSS yang diinginkan (seperti yang ditentukan dengan `height`, `width`, `aspect-ratio`, atau properti sejenis lainnya):

```css
bento-social-share {
  height: 100px;
  width: 100px;
}
```

#### Gaya Default

Secara default atau standar, `bento-social-share` menyertakan beberapa penyedia populer pra-konfigurasi sebelumnya. Tombol untuk penyedia ini ditata dengan warna dan logo resmi penyedia. Lebar default adalah 60px, dan tinggi default adalah 44px.

#### Gaya Kustom

Terkadang Anda ingin menerapkan gaya Anda sendiri. Anda cukup mengganti gaya yang disediakan seperti berikut ini:

```css
bento-social-share[type='twitter'] {
  color: blue;
  background: red;
}
```

Saat menyesuaikan gaya `bento-social-share`, harap pastikan bahwa ikon yang disesuaikan memenuhi pedoman pemerekan (branding) yang ditetapkan oleh penyedia (cth.: Twitter, Facebook (Meta), dll.)

### Aksesibilitas

#### Indikasi fokus

Elemen `bento-social-share` membuat default ke garis biru sebagai indikator fokus yang terlihat. Ini juga menjadikan `tabindex=0` default sehingga memudahkan pengguna untuk mengikuti saat mereka membuat tab melalui beberapa elemen `bento-social-share` yang digunakan bersama pada sebuah halaman.

Indikator fokus default dicapai dengan rangkaian aturan CSS berikut ini.

```css
bento-social-share:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

Indikator fokus default dapat ditimpa dengan mendefinisikan gaya CSS untuk fokus dan memasukkannya ke dalam tag `style`. Pada contoh di bawah ini, rangkaian aturan CSS pertama menghapus indikator fokus pada semua `bento-social-share` dengan menetapkan properti `outline` ke `none`. Rangkaian aturan kedua menentukan garis merah (bukan biru default) dan juga menetapkan `outline-offset` menjadi `3px` untuk semua elemen `bento-social-share` dengan kelas `custom-focus`.

```css
bento-social-share:focus{
  outline: none;
}

bento-social-share.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Dengan aturan CSS ini, `bento-social-share` tidak akan menampilkan indikator fokus yang terlihat, kecuali telah menyertakan `custom-focus` kelas, dalam hal ini mereka akan memiliki indikator garis merah.

#### Kontras warna

Harap ketahui bahwa `bento-social-share` dengan nilai `type` `twitter`, `whatsapp`, atau `line` akan menampilkan tombol dengan kombinasi warna latar depan/belakang yang berada di bawah ambang batas 3:1 yang direkomendasikan untuk konten non-teks yang ditentukan dalam [WCAG 2.1 SC 1.4. 11 Kontras Non-teks](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

Tanpa kontras yang cukup, konten bisa sulit untuk dilihat dan oleh karena itu sulit untuk diidentifikasi. Dalam kasus ekstrem, konten dengan kontras rendah mungkin tidak terlihat sama sekali oleh orang yang menderita gangguan persepsi warna. Dalam kasus tombol berbagi di atas, pengguna mungkin tidak dapat memahami/menerima dengan tepat apa itu kontrol berbagi, layanan apa yang terkait dengannya.

### Penyedia pra-konfigurasi

Komponen `bento-social-share` menyediakan [beberapa penyedia pra-konfigurasi](./social-share-config.js) yang mengetahui titik akhir (endpoint) berbagi mereka serta beberapa parameter default.

<table>
  <tr>
    <th class="col-twenty">Penyedia</th>
    <th class="col-twenty">Jenis</th>
    <th>Parameter</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a> (memicu dialog berbagi OS)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: opsional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Email</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>data-param-subject</code>: opsional</li>
        <li>
<code>data-param-body</code>: opsional</li>
        <li>
<code>data-param-recipient</code>: opsional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>data-param-app_id</code>: <strong>diperlukan</strong>, default ke: tidak ada. Parameter ini adalah <code>app_id</code> Facebook (Meta) yang diperlukan untuk <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">dialog Berbagi Facebook</a>.</li>
        <li>
<code>data-param-href</code>: opsional</li>
        <li>
<code>data-param-quote</code>: opsional, dapat digunakan untuk berbagi kutipan atau teks.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: opsional</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>data-param-media</code>: opsional (tetapi sangat disarankan untuk ditetapkan). URL untuk media yang akan dibagikan di Pinterest. Jika tidak ditetapkan, pengguna akhir akan diminta untuk mengunggah media oleh Pinterest.</li>
        <li>
<code>data-param-url</code>: opsional</li>
        <li>
<code>data-param-description</code>: opsional</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: opsional</li>
        <li>
<code>data-param-text</code>: opsional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: opsional</li>
        <li>
<code>data-param-text</code>: opsional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>WhatsApp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: opsional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: opsional</li>
        <li>
<code>data-param-text</code>: opsional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>data-param-body</code>: opsional</li>
</ul>
    </td>
  </tr>
</table>

### Penyedia non-konfigurasi

Selain penyedia pra-konfigurasi, Anda dapat menggunakan penyedia non-konfigurasi dengan menentukan atribut tambahan di komponen `bento-social-share`.

#### Contoh: Membuat tombol bagikan untuk penyedia non-konfigurasi

Contoh berikut ini membuat tombol bagikan melalui Facebook Messenger dengan menetapkan `data-share-endpoint` ke titik akhir yang benar untuk protokol kustom Facebook Messenger.

```html
<bento-social-share
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</bento-social-share>
```

Karena penyedia ini bukan pra-konfigurasi, Anda harus membuat gambar tombol dan gaya yang sesuai untuk penyedia.

### Atribut

#### type (diperlukan)

Memilih jenis penyedia. Ini diperlukan untuk penyedia pra-konfigurasi dan non-konfigurasi.

#### data-target

Menentukan target di mana untuk membuka target. Default-nya adalah `_blank` untuk semua kasus, selain email/SMS di iOS, dalam hal ini target ditetapkan ke `_top`.

#### data-share-endpoint

Atribut ini diperlukan untuk penyedia non-konfigurasi.

Beberapa penyedia populer memiliki titik akhir berbagi pra-konfigurasi. Untuk mengetahui selengkapnya, lihat bagian Penyedia Pra-konfigurasi. Untuk penyedia non-konfigurasi, Anda harus menentukan titik akhir berbagi.

#### data-param-\*

Semua atribut berawalan `data-param-*` diubah menjadi parameter URL dan diteruskan ke titik akhir berbagi.

#### aria-label

Deskripsi tombol untuk aksesibilitas. Label yang direkomendasikan adalah "Bagikan di &lt;type&gt;".

---

## Komponen Preact/React

Contoh di bawah ini menunjukkan penggunaan `<BentoSocialShare>` sebagai komponen fungsional yang dapat digunakan dengan perpustakaan Preact atau React.

### Contoh: Impor melalui npm

```sh
npm install @bentoproject/social-share
```

```javascript
import React from 'react';
import {BentoSocialShare} from '@bentoproject/social-share/react';
import '@bentoproject/social-share/styles.css';

function App() {
  return (
    <BentoSocialShare
      type="twitter"
      aria-label="Share on Twitter"
    ></BentoSocialShare>
  );
}
```

### Tata letak dan gaya

#### Jenis wadah

Komponen `BentoSocialShare` memiliki jenis ukuran tata letak yang telah ditentukan. Untuk memastikan bahwa komponen dirender dengan benar, pastikan untuk menerapkan ukuran pada komponen dan turunan langsungnya (slide) melalui tata letak CSS yang diinginkan (seperti yang ditentukan dengan `height`, `width`, `aspect-ratio`, atau properti sejenis lainnya). Ini dapat diterapkan inline:

```jsx
<BentoSocialShare
  style={{width: 50, height: 50}}
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

Atau melalui `className`:

```jsx
<BentoSocialShare
  className="custom-styles"
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

```css
.custom-styles {
  height: 50px;
  width: 50px;
}
```

### Aksesibilitas

#### Indikasi fokus

Elemen `BentoSocialShare` membuat default ke garis biru sebagai indikator fokus yang terlihat. Ini juga menjadikan `tabindex=0` default sehingga memudahkan pengguna untuk mengikuti saat membuat tab melalui beberapa elemen `BentoSocialShare` yang digunakan bersama-sama pada sebuah halaman.

Indikator fokus default dicapai dengan rangkaian aturan CSS berikut ini.

```css
BentoSocialShare:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

Indikator fokus default dapat ditimpa dengan mendefinisikan gaya CSS untuk fokus dan memasukkannya ke dalam tag `style`. Pada contoh di bawah ini, rangkaian aturan CSS pertama menghapus indikator fokus pada semua `BentoSocialShare` dengan menetapkan properti `outline` ke `none`. Rangkaian aturan kedua menentukan garis merah (bukan biru default) dan juga menetapkan `outline-offset` menjadi `3px` untuk semua elemen `BentoSocialShare` dengan kelas `custom-focus`.

```css
BentoSocialShare:focus{
  outline: none;
}

BentoSocialShare.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Dengan aturan CSS ini, `BentoSocialShare` tidak akan menampilkan indikator fokus yang terlihat, kecuali telah menyertakan `custom-focus` kelas, dalam hal ini mereka akan memiliki indikator garis merah.

#### Kontras warna

Harap ketahui bahwa `BentoSocialShare` dengan nilai `type` `twitter`, `whatsapp`, atau `line` akan menampilkan tombol dengan kombinasi warna latar depan/belakang yang berada di bawah ambang batas 3:1 yang direkomendasikan untuk konten non-teks yang ditentukan dalam [WCAG 2.1 SC 1.4. 11 Kontras Non-teks](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

Tanpa kontras yang cukup, konten bisa sulit untuk dilihat dan oleh karena itu sulit untuk diidentifikasi. Dalam kasus ekstrem, konten dengan kontras rendah mungkin tidak terlihat sama sekali oleh orang yang menderita gangguan persepsi warna. Dalam kasus tombol berbagi di atas, pengguna mungkin tidak dapat memahami/menerima dengan tepat apa itu kontrol berbagi, layanan apa yang terkait dengannya.

### Penyedia pra-konfigurasi

Komponen `BentoSocialShare` menyediakan [beberapa penyedia pra-konfigurasi](./social-share-config.js) yang mengetahui titik akhir (endpoint) berbagi mereka serta beberapa parameter default.

<table>
  <tr>
    <th class="col-twenty">Penyedia</th>
    <th class="col-twenty">Jenis</th>
    <th>Parameter melalui prop <code>param</code>
</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a> (memicu dialog berbagi OS)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: opsional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Email</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>subject</code>: opsional</li>
        <li>
<code>body</code>: opsional</li>
        <li>
<code>recipient</code>: opsional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>app_id</code>: <strong>diperlukan</strong>, default ke: tidak ada. Parameter ini adalah <code>app_id</code> Facebook (Meta) yang diperlukan untuk <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">dialog Berbagi Facebook</a>.</li>
        <li>
<code>href</code>: opsional</li>
        <li>
<code>quote</code>: opsional, dapat digunakan untuk berbagi kutipan atau teks.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opsional</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>media</code>: opsional (tetapi sangat disarankan untuk ditetapkan). URL untuk media yang akan dibagikan di Pinterest. Jika tidak ditetapkan, pengguna akhir akan diminta untuk mengunggah media oleh Pinterest.</li>
        <li>
<code>url</code>: opsional</li>
        <li>
<code>description</code>: opsional</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opsional</li>
        <li>
<code>text</code>: opsional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opsional</li>
        <li>
<code>text</code>: opsional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: opsional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: opsional</li>
        <li>
<code>text</code>: opsional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>body</code>: opsional</li>
</ul>
    </td>
  </tr>
</table>

### Penyedia non-konfigurasi

Selain penyedia pra-konfigurasi, Anda dapat menggunakan penyedia non-konfigurasi dengan menentukan atribut tambahan di komponen `BentoSocialShare`.

#### Contoh: Membuat tombol bagikan untuk penyedia non-konfigurasi

Contoh berikut ini membuat tombol bagikan melalui Facebook Messenger dengan menetapkan `data-share-endpoint` ke titik akhir yang benar untuk protokol kustom Facebook Messenger.

```html
<BentoSocialShare
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</BentoSocialShare>
```

Karena penyedia ini bukan pra-konfigurasi, Anda harus membuat gambar tombol dan gaya yang sesuai untuk penyedia.

### Prop

#### type (diperlukan)

Memilih jenis penyedia. Ini diperlukan untuk penyedia pra-konfigurasi dan non-konfigurasi.

#### background

Terkadang Anda ingin menerapkan gaya Anda sendiri. Anda cukup mengganti gaya yang disediakan dengan memberikan warna untuk latar belakang.

Saat menyesuaikan gaya `BentoSocialShare`, harap pastikan bahwa ikon yang disesuaikan memenuhi pedoman pemerekan (branding) yang ditetapkan oleh penyedia (cth.: Twitter, Facebook (Meta), dll.)

#### color

Terkadang Anda ingin menerapkan gaya Anda sendiri. Anda cukup mengganti gaya yang disediakan dengan memberikan warna untuk isian.

Saat menyesuaikan gaya `BentoSocialShare`, harap pastikan bahwa ikon yang disesuaikan memenuhi pedoman pemerekan (branding) yang ditetapkan oleh penyedia (cth.: Twitter, Facebook (Meta), dll.)

#### target

Menentukan target di mana untuk membuka target. Default-nya adalah `_blank` untuk semua kasus, selain email/SMS di iOS, dalam hal ini target ditetapkan ke `_top`.

#### endpoint

Prop ini diperlukan untuk penyedia non-konfigurasi.

Beberapa penyedia populer memiliki titik akhir berbagi pra-konfigurasi. Untuk mengetahui selengkapnya, lihat bagian Penyedia Pra-konfigurasi. Untuk penyedia non-konfigurasi, Anda harus menentukan titik akhir berbagi.

#### params

Semua properti `param` diteruskan sebagai parameter URL dan diteruskan ke titik akhir berbagi.

#### aria-label

Deskripsi tombol untuk aksesibilitas. Label yang direkomendasikan adalah "Bagikan di &lt;type&gt;".
