# Bento Sidebar

Bento Side Bar'ı bir [`<bento-sidebar>`](#web-component) web bileşeni veya Preact/React işlevsel bileşeni [`<BentoSidebar>`](#preactreact-component) olarak kullanın.

## Web Bileşeni

Uygun yüklemeyi garanti etmek için ve özel stiller eklemeden önce her Bento bileşeninin gerekli CSS kitaplığını eklemelisiniz. Veya satır içi olarak sunulan hafif ön yükseltme stillerini kullanın. [Yerleşim ve stil](#layout-and-style) konusuna bakın.

Aşağıdaki örnekler, `<bento-sidebar>` web bileşeninin kullanımını göstermektedir.

### Örnek: npm ile içe aktarma

```sh
npm install @bentoproject/sidebar
```

```javascript
import {defineElement as defineBentoSidebar} from '@bentoproject/sidebar';
defineBentoSidebar();
```

### Örnek: `<script>` ile ekleme

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

Bir medya sorgusu ile `toolbar` özniteliğini ve `<bento-sidebar>` öğesinin alt öğesi olan `<nav>` öğesinde öğe kimliğine sahip bir `toolbar-target` özniteliğini belirterek `<body>` içinde görüntülenen bir Bento Toolbar öğesi oluşturabilirsiniz. `toolbar`, `<nav>` öğesini ve onun alt öğelerini kopyalar ve `toolbar-target` öğesine ekler.

#### Davranış

-   `toolbar` özniteliği ve `toolbar-target` özniteliği ile gezinme öğeleri ekleyerek araç çubuklarını uygulayabilir.
-   `<bento-sidebar>` öğesinin alt öğesi olmalı ve şu biçimi izlemelidir: `<nav toolbar="(media-query)" toolbar-target="elementID">` .
    -   Örneğin, bu, araç çubuğunun geçerli bir kullanımı olacaktır: `<nav toolbar="(max-width: 1024px)" toolbar-target="target-element">` .
-   Araç çubuğu davranışı, yalnızca `toolbar` özniteliği medya sorgusu geçerli olduğunda uygulanır. Ayrıca, araç çubuğunun uygulanabilmesi için sayfada `toolbar-target` öznitelik kimliğine sahip bir öğe bulunmalıdır.

##### Örnek: Temel Araç Çubuğu

Aşağıdaki örnekte, pencere genişliği 767 pikselden küçük veya buna eşitse `toolbar` gösteririz. `toolbar`, bir arama giriş öğesi içerir. `toolbar` öğesi, `<div id="target-element">` öğesine eklenecektir.

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

### Etkileşim ve API kullanımı

Bağımsız bir web bileşeni olarak kullanılan Bento özellikli bileşenler, API'leri aracılığıyla yüksek düzeyde etkileşimlidir. `bento-sidebar` bileşeni API'sine, belgenize aşağıdaki komut dosyası etiketi eklenerek erişilebilir:

```javascript
await customElements.whenDefined('bento-sidebar');
const api = await carousel.getApi();
```

#### Eylemler

`bento-sidebar` API, aşağıdaki eylemleri gerçekleştirmenize olanak tanır:

##### open()

Kenar çubuğunu açar.

```javascript
api.open();
```

##### close()

Kenar çubuğunu kapatır.

```javascript
api.close();
```

##### toggle()

Kenar çubuğunun açık durumunu değiştirir.

```javascript
api.toggle(0);
```

### Yerleşim ve stil

[Her Bento bileşeni, içerik kaymaları](https://web.dev/cls/) olmadan düzgün yüklemeyi garanti etmek için eklemeniz gereken küçük bir CSS kitaplığına sahiptir. Düzene dayalı özgüllük nedeniyle, herhangi bir özel stilden önce stil sayfalarının dahil edilmesini manuel olarak sağlamalısınız.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-sidebar-1.0.css"
/>
```

Alternatif olarak, hafif ön yükseltme stillerini satır içi olarak da kullanıma sunabilirsiniz:

```html
<style>
  bento-sidebar:not([open]) {
    display: none !important;
  }
</style>
```

#### Özel stiller

`bento-sidebar` bileşeni, standart CSS ile şekillendirilebilir.

-   `bento-sidebar` `width` boyutu önceden belirlenmiş 45px değerinden genişliğini belirlemek için ayarlanabilir.
-   Gerekirse kenar çubuğunun yüksekliğini belirlemek için `bento-sidebar` yüksekliği ayarlanabilir. Yükseklik 100vw'yi aşarsa, kenar çubuğunda dikey bir kaydırma çubuğu olacaktır. Kenar çubuğunun önceden ayarlanmış yüksekliği 100vw'dir ve kısaltmak için CSS'de geçersiz kılınabilir.
-   Kenar çubuğunun mevcut durumu, kenar çubuğu sayfada açıkken `bento-sidebar` etiketinde ayarlanan `open` yoluyla gösterilir.

```css
bento-sidebar[open] {
  height: 100%;
  width: 50px;
}
```

### UX ile ilgili hususlar

`<bento-sidebar>` kullanırken, kullanıcılarınızın sayfanızı genellikle sabit konumlu bir başlık gösterecek mobil cihazlarda görüntüleyeceğini unutmayın. Ayrıca, tarayıcılar genellikle sayfanın üst kısmında kendi sabit başlıklarını gösterir. Ekranın üstüne başka bir sabit konumlu öğe eklemek, kullanıcıya yeni bilgi vermeyen içerikle birlikte büyük miktarda mobil ekran alanı kaplar.

Bu nedenle, kenar çubuğunu açma olanaklarının sabit, tam genişlikte bir başlığa yerleştirilmemesini öneririz.

-   Kenar çubuğu, bir sayfanın yalnızca sol veya sağ tarafında görünebilir.
-   Kenar çubuğunun maksimum yüksekliği 100vh'dir, yükseklik 100vh'yi aşarsa dikey bir kaydırma çubuğu görünür. Varsayılan yükseklik, CSS'de 100vh'ye ayarlanmıştır ve CSS'de geçersiz kılınabilir.
-   Kenar çubuğunun genişliği CSS kullanılarak belirlenebilir ve ayarlanabilir.
-   Erişilebilirlik için mantıksal bir DOM sırasını korumak ve davranışını bir kapsayıcı öğesi tarafından değiştirmekten kaçınmak için `<bento-sidebar>` öğesinin <code>&lt;body&gt;</code> &gt; öğesinin doğrudan alt öğesi olması <em>önerilir.</em> `z-index` ayarlanmış bir `bento-sidebar` üst öğesine sahip olmanın, kenar çubuğunun diğer öğelerin (başlıklar gibi) altında görünmesine ve işlevselliğini bozmasına neden olabileceğini unutmayın.

### Öznitellikler

#### side

Kenar çubuğunun sayfanın hangi tarafından, `left` veya `right`, açılması gerektiğini belirtir. Bir `side` belirtilmezse, `side` değeri `body` etiketinin `dir` özniteliğinden (`ltr` =&gt; `left`, `rtl` =&gt; `right`) alınır; `dir` yoksa, `side` varsayılan olarak `left` olur.

#### open

Bu öznitelik, kenar çubuğu açıkken mevcuttur.

#### toolbar

Bu öznitelik, alt `<nav toolbar="(media-query)" toolbar-target="elementID">` öğelerinde bulunur ve bir araç çubuğunun ne zaman gösterileceğine ilişkin bir medya sorgusunu kabul eder. Araç çubuklarını kullanma hakkında daha fazla bilgi için [Araç Çubuğu](#bento-toolbar) bölümüne bakın.

#### toolbar-target

Bu öznitelik, `<nav toolbar="(media-query)" toolbar-target="elementID">` öğesinde bulunur ve sayfadaki bir öğenin kimliğini kabul eder. `toolbar-target` özniteliği, varsayılan araç çubuğu stili olmadan, araç çubuğunu sayfadaki öğenin belirtilen kimliğine yerleştirir. Araç çubuklarını kullanma hakkında daha fazla bilgi için [Araç Çubuğu](#bento-toolbar) bölümüne bakın.

---

## Preact/React Bileşeni

Aşağıdaki örnekler, Preact veya React kitaplıklarıyla kullanılabilen işlevsel bir bileşen olarak `<BentoSidebar>` kullanımını gösteriyor.

### Örnek: npm ile içe aktarma

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

Bir medya sorgusu ile `toolbar` özniteliğini ve `<BentoSidebar>` öğesinin alt öğesi olan `<BentoSidebarToolbar>` bileşeninde öğe kimliğine sahip bir `toolbarTarget` özniteliğini belirterek `<body>` içinde görüntülenen bir Bento Toolbar öğesi oluşturabilirsiniz. `toolbar`, `<BentoSidebarToolbar>` öğesini ve onun alt öğelerini kopyalar ve `toolbarTarget` öğesine ekler.

#### Davranış

-   `toolbar` aksesuarı ve `toolbar-target` aksesuarı ile gezinme öğeleri ekleyerek araç çubuklarını uygulayabilir.
-   Nav öğesi, `<BentoSidebar>` öğesinin alt öğesi olmalı ve şu biçimi izlemelidir: `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">`.
    -   Örneğin, bu, araç çubuğunun geçerli bir kullanımı olacaktır: `<BentoSidebarToolbar toolbar="(max-width: 1024px)" toolbarTarget="target-element">`.
-   Araç çubuğu davranışı yalnızca `toolbar` aksesuarı medya sorgusu geçerli olduğunda uygulanır. Ayrıca, araç çubuğunun uygulanabilmesi için sayfada `toolbarTarget` aksesuar kimliğine sahip bir öğe bulunmalıdır.

##### Örnek: Temel Araç Çubuğu

Aşağıdaki örnekte, pencere genişliği 767 pikselden küçük veya buna eşitse `toolbar` gösteririz. `toolbar`, bir arama giriş öğesi içerir. `toolbar` öğesi, `<div id="target-element">` öğesine eklenecektir.

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

### Etkileşim ve API kullanımı

Bento bileşenleri, API'leri aracılığıyla yüksek düzeyde etkileşimlidir. `BentoSidebar` bileşen API'sine, bir `ref` geçirerek erişilebilir:

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

#### Eylemler

`BentoSidebar` API, aşağıdaki eylemleri gerçekleştirmenize olanak tanır:

##### open()

Kenar çubuğunu açar.

```javascript
ref.current.open();
```

##### close()

Kenar çubuğunu kapatır.

```javascript
ref.current.close();
```

##### toggle()

Kenar çubuğunun açık durumunu değiştirir.

```javascript
ref.current.toggle(0);
```

### Yerleşim ve stil

`BentoSidebar` bileşeni, standart CSS ile şekillendirilebilir.

-   `bento-sidebar` `width` boyutu önceden belirlenmiş 45px değerinden genişliğini belirlemek için ayarlanabilir.
-   Gerekirse kenar çubuğunun yüksekliğini belirlemek için `bento-sidebar` yüksekliği ayarlanabilir. Yükseklik 100vw'yi aşarsa, kenar çubuğunda dikey bir kaydırma çubuğu olacaktır. Kenar çubuğunun önceden ayarlanmış yüksekliği 100vw'dir ve kısaltmak için CSS'de geçersiz kılınabilir.

Bileşenin istediğiniz gibi derlenmesini sağlamak için bileşene bir boyut uyguladığınızdan emin olun. Bunlar satır içi olarak uygulanabilir:

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

Veya `className` aracılığıyla:

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

### UX ile ilgili hususlar

`<BentoSidebar>` kullanırken, kullanıcılarınızın sayfanızı genellikle sabit konumlu bir başlık gösterecek mobil cihazlarda görüntüleyeceğini unutmayın. Ayrıca, tarayıcılar genellikle sayfanın üst kısmında kendi sabit başlıklarını gösterir. Ekranın üstüne başka bir sabit konumlu öğe eklemek, kullanıcıya yeni bilgi vermeyen içerikle birlikte büyük miktarda mobil ekran alanı kaplar.

Bu nedenle, kenar çubuğunu açma olanaklarının sabit, tam genişlikte bir başlığa yerleştirilmemesini öneririz.

-   Kenar çubuğu, bir sayfanın yalnızca sol veya sağ tarafında görünebilir.
-   Kenar çubuğunun maksimum yüksekliği 100vh'dir, yükseklik 100vh'yi aşarsa dikey bir kaydırma çubuğu görünür. Varsayılan yükseklik, CSS'de 100vh'ye ayarlanmıştır ve CSS'de geçersiz kılınabilir.
-   Kenar çubuğunun genişliği CSS kullanılarak belirlenebilir ve ayarlanabilir.
-   Erişilebilirlik için mantıksal bir DOM sırasını korumak ve davranışını bir kapsayıcı öğesi tarafından değiştirmekten kaçınmak için `<BentoSidebar>` öğesinin <code>&lt;body&gt;</code> &gt; öğesinin doğrudan alt öğesi olması <em>önerilir.</em> `z-index` ayarlanmış bir `BentoSidebar` üst öğesine sahip olmanın, kenar çubuğunun diğer öğelerin (başlıklar gibi) altında görünmesine ve işlevselliğini bozmasına neden olabileceğini unutmayın.

### Aksesuarlar

#### side

Kenar çubuğunun sayfanın hangi tarafından, `left` veya `right`, açılması gerektiğini belirtir. Bir `side` belirtilmezse, `side` değeri `body` etiketinin `dir` özniteliğinden (`ltr` =&gt; `left`, `rtl` =&gt; `right`) alınır; `dir` yoksa, `side` varsayılan olarak `left` olur.

#### toolbar

Bu aksesuar, alt `<nav toolbar="(media-query)" toolbar-target="elementID">` öğelerinde bulunur ve bir araç çubuğunun ne zaman gösterileceğine ilişkin bir medya sorgusunu kabul eder. Araç çubuklarını kullanma hakkında daha fazla bilgi için [Araç Çubuğu](#bento-toolbar) bölümüne bakın.

#### toolbarTarget

Bu öznitelik, `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` öğesinde bulunur ve sayfadaki bir öğenin kimliğini kabul eder. `toolbarTarget` özniteliği, varsayılan araç çubuğu stili olmadan, araç çubuğunu sayfadaki öğenin belirtilen kimliğine yerleştirir. Araç çubuklarını kullanma hakkında daha fazla bilgi için [Araç Çubuğu](#bento-toolbar) bölümüne bakın.
