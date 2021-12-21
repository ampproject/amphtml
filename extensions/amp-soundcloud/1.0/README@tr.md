# Bento Soundcloud

Bir [Soundcloud](https://soundcloud.com) klibi yerleştirir.

## Web Bileşeni

Uygun yüklemeyi garanti etmek için ve özel stiller eklemeden önce her Bento bileşeninin gerekli CSS kitaplığını eklemelisiniz. Veya satır içi olarak sunulan hafif ön yükseltme stillerini kullanın. [Yerleşim ve stil](#layout-and-style) konusuna bakın.

Aşağıdaki örnekler, `<bento-soundcloud>` web bileşeninin kullanımını göstermektedir.

### Örnek: npm ile içe aktarma

```sh
npm install @bentoproject/soundcloud
```

```javascript
import {defineElement as defineBentoSoundcloud} from '@bentoproject/soundcloud';
defineBentoSoundcloud();
```

### `<script>` ile ekleme

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

### Yerleşim ve stil

[Her Bento bileşeni, içerik kaymaları](https://web.dev/cls/) olmadan düzgün yüklemeyi garanti etmek için eklemeniz gereken küçük bir CSS kitaplığına sahiptir. Düzene dayalı özgüllük nedeniyle, herhangi bir özel stilden önce stil sayfalarının dahil edilmesini manuel olarak sağlamalısınız.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
/>
```

Alternatif olarak, hafif ön yükseltme stillerini satır içi olarak da kullanıma sunabilirsiniz:

```html
<style>
  bento-soundcloud {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Kapsayıcı tipi

`bento-soundcloud` bileşeninin tanımlanmış bir yerleşim boyutu türü vardır. Bileşenin doğru bir şekilde oluşturulduğundan emin olmak için, bileşene ve onun en yakın alt öğelerine (slaytlar) istenen bir CSS yerleşimi ile bir boyut uygulamayı unutmayın (örneğin `height`, `width`, `aspect-ratio` veya bu tür diğer özelliklerle tanımlanmış bir düzen).

```css
bento-soundcloud {
  height: 100px;
  width: 100%;
}
```

### Öznitellikler

<table>
  <tr>
    <td width="40%"><strong>data-trackid</strong></td>
    <td>
<code>data-playlistid</code> tanımlı değilse bu öznitelik gereklidir.<br> Bu özniteliğin değeri, bir tam sayı şeklinde bir parçanın kimliğidir.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlistid</strong></td>
    <td>Bu öznitelik, <code>data-trackid</code> tanımlı değilse gereklidir. Bu özniteliğin değeri, bir tam sayı şeklinde bir oynatma listesinin kimliğidir.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-secret-token (isteğe bağlı)</strong></td>
    <td>Özel ise, parçanın gizli simgesi.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-visual (isteğe bağlı)</strong></td>
    <td>
<code>true</code> ayarlanırsa, tam genişlikte "Visual" modunu görüntüler; aksi takdirde "Classic" mod olarak görüntülenir. Varsayılan değer <code>false</code> şeklindedir.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-color (isteğe bağlı)</strong></td>
    <td>Bu özellik, "Classic" mod için özel bir renk geçersiz kılma özelliğidir. Öznitelik "Visual" modunda yok sayılır. Başında # olmadan onaltılık bir renk değeri belirtin (ör. <code>data-color="e540ff"</code>).</td>
  </tr>
</table>

---

## Preact/React Bileşeni

Aşağıdaki örnekler, Preact veya React kitaplıklarıyla kullanılabilen işlevsel bir bileşen olarak `<BentoSoundcloud>` kullanımını gösteriyor.

### Örnek: npm ile içe aktarma

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

### Yerleşim ve stil

#### Kapsayıcı tipi

`BentoSoundcloud` bileşeninin tanımlanmış bir yerleşim boyutu türü vardır. Bileşenin doğru bir şekilde oluşturulduğundan emin olmak için, bileşene ve onun en yakın alt öğelerine (slaytlar) istenen bir CSS yerleşimi ile bir boyut uygulamayı unutmayın (örneğin `height`, `width`, `aspect-ratio` veya bu tür diğer özelliklerle tanımlanmış bir düzen). Bunlar satır içinde uygulanabilir:

```jsx
<BentoSoundcloud
  style={{width: 300, height: 100}}
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

Veya `className` aracılığıyla:

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

### Aksesuarlar

<table>
  <tr>
    <td width="40%"><strong>trackId</strong></td>
    <td>
<code>data-playlistid</code> tanımlı değilse bu öznitelik gereklidir.<br> Bu özniteliğin değeri, bir tam sayı şeklinde bir parçanın kimliğidir.</td>
  </tr>
  <tr>
    <td width="40%"><strong>playlistId</strong></td>
    <td>Bu öznitelik, <code>data-trackid</code> tanımlı değilse gereklidir. Bu özniteliğin değeri, bir tam sayı şeklinde bir oynatma listesinin kimliğidir.</td>
  </tr>
  <tr>
    <td width="40%"><strong>secretToken (isteğe bağlı)</strong></td>
    <td>Özel ise, parçanın gizli simgesi.</td>
  </tr>
  <tr>
    <td width="40%"><strong>visual (isteğe bağlı)</strong></td>
    <td>
<code>true</code> ayarlanırsa, tam genişlikte "Visual" modunu görüntüler; aksi takdirde "Classic" mod olarak görüntülenir. Varsayılan değer <code>false</code> şeklindedir.</td>
  </tr>
  <tr>
    <td width="40%"><strong>color (isteğe bağlı)</strong></td>
    <td>Bu özellik, "Classic" mod için özel bir renk geçersiz kılma özelliğidir. Öznitelik "Visual" modunda yok sayılır. Başında # olmadan onaltılık bir renk değeri belirtin (ör. <code>data-color="e540ff"</code>).</td>
  </tr>
</table>
