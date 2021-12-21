# Bento Fit Text

Kullanılabilir alan içinde belirli bir metin içeriğinin tümüne sığdırmak için en iyi yazı tipi boyutunu belirler.

Bento Fit Text için beklenen içerik metin veya diğer satır içi içeriktir, ancak satır içi olmayan içerik de içerebilir.

## Web Bileşeni

Uygun yüklemeyi garanti etmek için ve özel stiller eklemeden önce her Bento bileşeninin gerekli CSS kitaplığını eklemelisiniz. Veya satır içi olarak sunulan hafif ön yükseltme stillerini kullanın. [Yerleşim ve stil](#layout-and-style) konusuna bakın.

Aşağıdaki örnekler, `<bento-fit-text>` web bileşeninin kullanımını göstermektedir.

### Örnek: npm ile içe aktarma

```sh
npm install @bentoproject/fit-text
```

```javascript
import {defineElement as defineBentoFitText} from '@bentoproject/fit-text';
defineBentoFitText();
```

### Örnek: `<script>` ile ekleme

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

### Taşan içerik

`bento-fit-text` içeriği, `min-font-size` belirtilmiş olsa bile kullanılabilir alandan taşarsa, taşan içerik kesilir ve gizlenir. WebKit ve Blink tabanlı tarayıcılar, taşan içerik için üç nokta gösterir.

Aşağıdaki örnekte, `min-font-size` değerini `40` olarak belirledik ve `bento-fit-text` öğesinin içine daha fazla içerik ekledik. Bu, içeriğin sabit blok üst öğesinin boyutunu aşmasına neden olur, bu nedenle metin alana sığacak şekilde kısaltılır.

```html
<div style="width: 300px; height: 300px; background: #005af0; color: #fff">
  <bento-fit-text min-font-size="40">
    Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
    inermis reprehendunt. Lorem ipsum dolor sit amet, has nisl nihil convenire
    et, vim at aeque inermis reprehendunt
  </bento-fit-text>
</div>
```

### Yerleşim ve stil

[Her Bento bileşeni, içerik kaymaları](https://web.dev/cls/) olmadan düzgün yüklemeyi garanti etmek için eklemeniz gereken küçük bir CSS kitaplığına sahiptir. Düzene dayalı özgüllük nedeniyle, herhangi bir özel stilden önce stil sayfalarının dahil edilmesini manuel olarak sağlamalısınız.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-fit-text-1.0.css"
/>
```

Alternatif olarak, hafif ön yükseltme stillerini satır içi olarak da kullanıma sunabilirsiniz:

```html
<style>
  bento-fit-text {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Kapsayıcı tipi

`bento-fit-text` bileşeninin tanımlanmış bir yerleşim boyutu türü vardır. Bileşenin doğru bir şekilde oluşturulduğundan emin olmak için, bileşene ve onun en yakın alt öğelerine (slaytlar) istenen bir CSS yerleşimi ile bir boyut uygulamayı unutmayın (örneğin `height`, `width`, `aspect-ratio` veya bu tür diğer özelliklerle tanımlanmış bir düzen).

```css
bento-fit-text {
  height: 100px;
  width: 100%;
}
```

### Taşan içeriğe dair erişilebilirlik konuları

Taşan içerik, *kapsayıcıya sığması için görsel olarak* kısaltılırken, belgede hâlâ mevcut olduğunu unutmayın. Sayfalarınıza büyük miktarda içerik "doldurmak" için taşma davranışına güvenmeyin; görsel olarak mantıklı görünse de, sayfanın yardımcı teknolojiler (ekran okuyucular gibi) kullananlar için aşırı metinle dolu olmasına neden olabilir. Bu kullanıcılar, kesilen içeriğin tamamını yine de tam olarak okuyacak/duyacaktır.

### Öznitellikler

#### Medya Sorguları

`<bento-fit-text>` öznitelikleri, [bir medya sorgusuna](./../../../docs/spec/amp-html-responsive-attributes.md) dayalı olarak farklı seçenekleri kullanmak üzere yapılandırılabilir.

#### `min-font-size`

`bento-fit-text`'in kullanabileceği bir tamsayı olarak piksel cinsinden minimum yazı tipi boyutunu belirtir.

#### `max-font-size`

`bento-fit-text`'in kullanabileceği bir tamsayı olarak piksel cinsinden maksimum yazı tipi boyutunu belirtir.

---

## Preact/React Bileşeni

Aşağıdaki örnekler, Preact veya React kitaplıklarıyla kullanılabilen işlevsel bir bileşen olarak `<BentoFitText>` kullanımını gösteriyor.

### Örnek: npm ile içe aktarma

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

### Yerleşim ve stil

#### Kapsayıcı tipi

`BentoFitText` bileşeninin tanımlanmış bir yerleşim boyutu türü vardır. Bileşenin doğru bir şekilde oluşturulduğundan emin olmak için, bileşene ve onun en yakın alt öğelerine (slaytlar) istenen bir CSS yerleşimi ile bir boyut uygulamayı unutmayın (örneğin `height`, `width`, `aspect-ratio` veya bu tür diğer özelliklerle tanımlanmış bir düzen). Bunlar satır içinde uygulanabilir:

```jsx
<BentoFitText style={{width: 300, height: 100}}>
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

Veya `className` aracılığıyla:

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

### Aksesuarlar

#### `minFontSize`

`bento-fit-text`'in kullanabileceği bir tamsayı olarak piksel cinsinden minimum yazı tipi boyutunu belirtir.

#### `maxFontSize`

`bento-fit-text`'in kullanabileceği bir tamsayı olarak piksel cinsinden maksimum yazı tipi boyutunu belirtir.
