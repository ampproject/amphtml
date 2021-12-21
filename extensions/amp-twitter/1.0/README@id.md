# Bento Twitter

## Perilaku

Komponen Bento Twitter memungkinkan Anda menyematkan Tweet atau Moment. Gunakan sebagai komponen web [`<bento-twitter>`](#web-component), atau komponen fungsional Preact/React [`<BentoTwitter>`](#preactreact-component).

### Komponen Web

Anda harus menyertakan perpustakaan CSS yang diperlukan setiap komponen Bento untuk menjamin pemuatan yang tepat dan sebelum menambahkan gaya khusus. Atau gunakan gaya pra-peningkatan ringan yang tersedia inline. Lihat [Tata Letak dan gaya](#layout-and-style).

Contoh di bawah ini menunjukkan penggunaan komponen web `<bento-twitter>`.

#### Contoh: Impor melalui npm

[example preview="top-frame" playground="false"]

Instal melalui npm:

```sh
npm install @ampproject/bento-twitter
```

```javascript
import '@ampproject/bento-twitter';
```

[/example]

#### Contoh: Sertakan melalui `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-twitter {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <!-- TODO(wg-bento): Once available, change src to bento-twitter.js -->
  <script async src="https://cdn.ampproject.org/v0/amp-twitter-1.0.js"></script>
  <style>
    bento-twitter {
      width: 375px;
      height: 472px;
    }
  </style>
</head>
<bento-twitter id="my-tweet" data-tweetid="885634330868850689">
</bento-twitter>
<div class="buttons" style="margin-top: 8px;">
  <button id="change-tweet">
    Change tweet
  </button>
</div>

<script>
  (async () => {
    const twitter = document.querySelector('#my-tweet');
    await customElements.whenDefined('bento-twitter');

    // set up button actions
    document.querySelector('#change-tweet').onclick = () => {
      twitter.setAttribute('data-tweetid', '495719809695621121')
    }
  })();
</script>
```

[/example]

#### Tata letak dan gaya

Setiap komponen Bento memiliki perpustakaan CSS kecil yang harus Anda sertakan untuk menjamin pemuatan yang tepat tanpa [pergeseran konten](https://web.dev/cls/). Karena kekhususan berbasis urutan, Anda harus secara manual memastikan bahwa lembar gaya (stylesheet) disertakan sebelum gaya kustom apa pun.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-twitter-1.0.css">
```

Sebagai pilihan lain, Anda juga dapat membuat gaya pra-peningkatan ringan yang tersedia inline:

```html
<style data-bento-boilerplate>
  bento-twitter {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**Jenis wadah**

Komponen `bento-twitter` memiliki jenis ukuran tata letak yang telah ditentukan. Untuk memastikan bahwa komponen dirender dengan benar, pastikan untuk menerapkan ukuran pada komponen dan turunan langsungnya (slide) melalui tata letak CSS yang diinginkan (seperti yang ditentukan dengan `height`, `width`, `aspect-ratio`, atau properti sejenis lainnya):

```css
bento-twitter {
  height: 100px;
  width: 100%;
}
```

#### Atribut

<table>
  <tr>
    <td width="40%"><strong>data-tweetid / data-momentid / data-timeline-source-type (diperlukan)</strong></td>
    <td>ID Tweet atau Momen, atau jenis sumber jika Lini Masa (Timeline) harus ditampilkan. Dalam URL seperti https://twitter.com/joemccann/status/640300967154597888, <code>640300967154597888</code> adalah ID tweet. Dalam URL seperti https://twitter.com/i/moments/1009149991452135424, <code>1009149991452135424</code> adalah ID momen. Jenis sumber lini masa yang valid termasuk <code>profile</code>, <code>likes</code>, <code>list</code>, <code>collection</code>, <code>url</code>, dan <code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-timeline-* (opsional)</strong></td>
    <td>Saat menampilkan lini masa, argumen lebih lanjut perlu diberikan selain <code>timeline-source-type</code>. Misalnya, <code>data-timeline-screen-name="amphtml"</code> dikombinasikan dengan <code>data-timeline-source-type="profile"</code> akan menampilkan lini masa akun Twitter AMP. Untuk detail tentang argumen yang tersedia, lihat bagian "Lini Masa" di <a href="https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions">Panduan Fungsi Pabrik JavaScript Twitter</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-* (opsional)</strong></td>
    <td>Anda dapat menentukan opsi untuk tampilan Tweet, Momen, atau Lini Masa dengan menetapkan atribut <code>data-</code>. Misalnya, <code>data-cards="hidden"</code> menonaktifkan kartu Twitter. Untuk mengetahui detail tentang opsi yang tersedia, lihat dokumen Twitter <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">untuk tweet</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">untuk momen,</a> dan <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">untuk lini masa</a>.</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (opsional)</strong></td>
    <td>Tentukan atribut <code>title</code> untuk komponen. Standarnya adalah <code>Twitter</code>.</td>
  </tr>
</table>

### Komponen Preact/React

Contoh di bawah ini menunjukkan penggunaan `<BentoTwitter>` sebagai komponen fungsional yang dapat digunakan dengan perpustakaan Preact atau React.

#### Contoh: Impor melalui npm

[example preview="top-frame" playground="false"]

Instal melalui npm:

```sh
npm install @ampproject/bento-twitter
```

```javascript
import React from 'react';
import { BentoTwitter } from '@ampproject/bento-twitter/react';
import '@ampproject/bento-twitter/styles.css';

function App() {
  return (
    <BentoTwitter tweetid="1356304203044499462">
    </BentoTwitter>
  );
}
```

[/example]

#### Tata letak dan gaya

**Jenis wadah**

Komponen `BentoTwitter` memiliki jenis ukuran tata letak yang telah ditentukan. Untuk memastikan bahwa komponen dirender dengan benar, pastikan untuk menerapkan ukuran pada komponen dan turunan langsungnya (slide) melalui tata letak CSS yang diinginkan (seperti yang ditentukan dengan `height`, `width`, `aspect-ratio`, atau properti sejenis lainnya). Ini dapat diterapkan inline:

```jsx
<BentoTwitter style={{width: '300px', height: '100px'}}  tweetid="1356304203044499462">
</BentoTwitter>
```

Atau melalui `className`:

```jsx
<BentoTwitter className='custom-styles'  tweetid="1356304203044499462">
</BentoTwitter>
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
    <td width="40%"><strong>tweetid / momentid / timelineSourceType (diperlukan)</strong></td>
    <td>ID Tweet atau Momen, atau jenis sumber jika Lini Masa (Timeline) harus ditampilkan. Dalam URL seperti https://twitter.com/joemccann/status/640300967154597888, <code>640300967154597888</code> adalah ID tweet. Dalam URL seperti https://twitter.com/i/moments/1009149991452135424, <code>1009149991452135424</code> adalah ID momen. Jenis sumber lini masa yang valid termasuk <code>profile</code>, <code>likes</code>, <code>list</code>, <code>collection</code>, <code>url</code>, dan <code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>card / conversations (opsional)</strong></td>
    <td>Saat menampilkan tweet, argumen lebih lanjut dapat diberikan, selain <code>tweetid</code>. Misalnya, <code>cards="hidden"</code> yang dikombinasikan dengan <code>conversation="none"</code> akan menampilkan tweet tanpa thumbnail (gambar mini) atau komentar tambahan.</td>
  </tr>
  <tr>
    <td width="40%"><strong>limit (opsional)</strong></td>
    <td>Saat menampilkan momen, argumen lebih lanjut dapat diberikan, selain <code>moment</code>. Misalnya, <code>limit="5"</code> akan menampilkan momen tersemat hingga lima kartu.</td>
  </tr>
  <tr>
    <td width="40%"><strong>timelineScreenName / timelineUserId (opsional)</strong></td>
    <td>Saat menampilkan lini masa, argumen lebih lanjut dapat diberikan, selain <code>timelineSourceType</code>. Misalnya, <code>timelineScreenName="amphtml"</code> yang dikombinasikan dengan <code>timelineSourceType="profile"</code> akan menampilkan lini masa akun Twitter AMP.</td>
  </tr>
  <tr>
    <td width="40%"><strong>options (opsional)</strong></td>
    <td>Anda dapat menentukan opsi untuk tampilan Tweet, Momen, atau Lini Masa dengan meneruskan objek ke prop <code>options</code>. Untuk mengetahui detail tentang opsi yang tersedia, lihat dokumen Twitter <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">untuk tweet</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">untuk momen,</a> dan <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">untuk lini masa</a>. Catatan: Saat meneruskan prop `options`, pastikan untuk mengoptimalkan atau memoisasi objek: <code>const TWITTER_OPTIONS = { // make sure to define these once globally! }; function MyComponent() { // etc return ( &lt;Twitter optionsProps={TWITTER_OPTIONS} /&gt; ); }</code>
</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (opsional)</strong></td>
    <td>Tentukan <code>title</code> untuk iframe komponen. Standarnya adalah <code>Twitter</code>.</td>
  </tr>
</table>
