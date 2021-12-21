# Bento Accordion

Daraltılabilen ve genişletilebilen içerik bölümlerini görüntüler. Bu bileşen, izleyicilerin içerik ana hatlarına bakmaları ve herhangi bir bölüme atlamaları için bir yol sağlar. Etkin kullanım, mobil cihazlarda kaydırma ihtiyacını azaltır.

-   Bir Bento Accordion, bir veya daha fazla `<section>` öğesini doğrudan alt öğeleri olarak kabul eder.
-   Her `<section>` tam olarak iki doğrudan alt öğe içermelidir.
-   `<section>` içindeki ilk alt öğe, Bento Accordion'un o bölümünün başlığıdır. `<h1>-<h6>` veya `<header>` gibi bir başlık öğesi olmalıdır.
-   `<section>` içindeki ikinci alt öğe, genişletilebilir/daraltılabilir içeriktir.
    -   [AMP HTML'de](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md) izin verilen herhangi bir etiket olabilir.
-   `<section>` başlığına tıklama veya dokunma bölümü genişletir veya daraltır.
-   `id` sahip bir Bento Accordion, kullanıcı alanınızda kalırken her bölümün daraltılmış veya genişletilmiş durumunu korur.

## Web Bileşeni

Uygun yüklemeyi garanti etmek için ve özel stiller eklemeden önce her Bento bileşeninin gerekli CSS kitaplığını eklemelisiniz. Veya satır içi olarak sunulan hafif ön yükseltme stillerini kullanın. [Yerleşim ve stil](#layout-and-style) konusuna bakın.

Aşağıdaki örnekler, `<bento-accordion>` web bileşeninin kullanımını göstermektedir.

### Örnek: npm ile içe aktarma

```sh
npm install @bentoproject/accordion
```

```javascript
import {defineElement as defineBentoAccordion} from '@bentoproject/accordion';
defineBentoAccordion();
```

### `<script>` ile ekleme

Aşağıdaki örnek, üç bölümlü bir code0}bento-accordion içerir. Üçüncü bölümdeki `expanded` özniteliği, sayfa yüklendiğinde onu genişletir.

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

### Etkileşim ve API kullanımı

Bağımsız kullanımda Bento özellikli bileşenler, API'leri aracılığıyla yüksek düzeyde etkileşimlidir. `bento-accordion` bileşeni API'sine, belgenize aşağıdaki komut dosyası etiketi eklenerek erişilebilir:

```javascript
await customElements.whenDefined('bento-accordion');
const api = await accordion.getApi();
```

#### Eylemler

##### toggle()

`toggle` eylemi `bento-accordion` bölümlerinin `expanded` ve `collapsed` durumlarını değiştirir. Argüman olmadan çağrıldığında, akordeonun tüm bölümlerini değiştirir. Belirli bir bölümü belirtmek için `section` argümanını ekleyin ve karşılık gelen `id` değer olarak kullanın.

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

`expand` eylemi, `bento-accordion` bölümlerini genişletir. Bir bölüm zaten genişletilmişse, genişletilmiş olarak kalır. Argüman olmadan çağrıldığında akordeonun tüm bölümlerini genişletir. Bir bölüm belirtmek için `section` argümanını ekleyin ve karşılık gelen `id` değer olarak kullanın.

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

`collapse` eylemi, `bento-accordion` bölümlerini daraltır. Bir bölüm zaten daraltılmışsa, daraltılmış olarak kalır. Argümansız çağrıldığında akordeonun tüm bölümlerini daraltır. Bir bölüm belirtmek için `section` argümanını ekleyin ve karşılık gelen `id`'sini değer olarak kullanın.

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

#### Olaylar

`bento-accordion` API'si, aşağıdaki olayları kaydetmenize ve yanıtlamanıza olanak tanır:

##### expand

Bu olay, bir akordeon bölümü genişletildiğinde ve genişletilmiş bölümden gönderildiğinde tetiklenir.

Örneğin aşağıya bakın.

##### collapse

Bu olay, bir akordeon bölümü daraltıldığında ve daraltılmış bölümden gönderildiğinde tetiklenir.

Aşağıdaki örnekte, `section 1` , `expand` olayını dinler ve genişletildiğinde `section 2`'yi genişletir. `section 2`, `collapse` olayını dinler ve daraltıldığında `section 1`'i daraltır.

Örneğin aşağıya bakın.

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

### Yerleşim ve stil

Her Bento bileşeni, [içerik kaymaları](https://web.dev/cls/) olmadan düzgün yüklemeyi garanti etmek için eklemeniz gereken küçük bir CSS kitaplığına sahiptir. Düzene dayalı özgüllük nedeniyle, herhangi bir özel stilden önce stil sayfalarının dahil edilmesini manuel olarak sağlamalısınız.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
/>
```

Alternatif olarak, hafif ön yükseltme stillerini satır içi olarak da kullanıma sunabilirsiniz:

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

### Öznitelikler

#### animate

İçerik genişletildiğinde bir "aşağı sarma" animasyonu ve daraltıldığında "yukarı sarma" animasyonu eklemek için `animate` özniteliğini `<bento-accordion>`'a ekleyin.

Bu öznitelik, bir [medya sorgusuna](./../../../docs/spec/amp-html-responsive-attributes.md) dayalı olarak yapılandırılabilir.

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

Sayfa yüklendiğinde bu bölümü genişletmek için, `expanded` özniteliğini iç içe geçmiş bir `<section>`'a uygulayın.

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

`<bento-accordion>` öğesine `expand-single-section` özniteliğini uygulayarak bir seferde yalnızca bir bölümün genişlemesine izin verin. Bu, bir kullanıcı daraltılmış bir `<section>`'a dokunursa, diğer genişletilmiş `<section>`'ı genişletip daraltacağı anlamına gelir.

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

### Stil

Akordiyona özgürce stil vermek için `bento-accordion` öğe seçiciyi kullanabilirsiniz.

Bir amp-accordion'a stil verirken aşağıdaki noktaları aklınızda bulundurun:

-   `bento-accordion` öğeleri her zaman `display: block` şeklindedir.
-   `float` bir `<section>`'ın başlık veya içerik öğelerine stil veremez.
-   Genişletilmiş bir bölüm, `expanded` özniteliğini `<section>` öğesine uygular.
-   `overflow: hidden` ile net bir şekilde sabitlenmiştir ve bu nedenle kaydırma çubuklarına sahip olamaz.
-   `<bento-accordion>`, `<section>`, başlık ve içerik öğelerinin kenar boşlukları `0` olarak ayarlanır, ancak özel stillerde geçersiz kılınabilir.
-   Hem başlık hem de içerik öğeleri `position: relative` şeklindedir.

---

## Preact/React Bileşeni

Aşağıdaki örnekler, Preact veya React kitaplıklarıyla kullanılabilen işlevsel bir bileşen olarak `<BentoAccordion>` kullanımını gösteriyor.

### Örnek: npm ile içe aktarma

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

### Etkileşim ve API kullanımı

Bento bileşenleri, API'leri aracılığıyla yüksek düzeyde etkileşimlidir. `BentoAccordion` bileşen API'sine, bir `ref` geçirerek erişilebilir:

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

#### Eylemler

`BentoAccordion` API, aşağıdaki eylemleri gerçekleştirmenize olanak tanır:

##### toggle()

`toggle` eylemi `bento-accordion` bölümlerinin `expanded` ve `collapsed` durumlarını değiştirir. Argüman olmadan çağrıldığında, akordeonun tüm bölümlerini değiştirir. Belirli bir bölümü belirtmek için `section` argümanını ekleyin ve karşılık gelen `id` değer olarak kullanın.

```javascript
ref.current.toggle();
ref.current.toggle('section1');
```

##### expand()

`expand` eylemi, `bento-accordion` bölümlerini genişletir. Bir bölüm zaten genişletilmişse, genişletilmiş olarak kalır. Argüman olmadan çağrıldığında akordeonun tüm bölümlerini genişletir. Bir bölüm belirtmek için `section` argümanını ekleyin ve karşılık gelen `id` değer olarak kullanın.

```javascript
ref.current.expand();
ref.current.expand('section1');
```

##### collapse()

`collapse` eylemi, `bento-accordion` bölümlerini daraltır. Bir bölüm zaten daraltılmışsa, daraltılmış olarak kalır. Argümansız çağrıldığında akordeonun tüm bölümlerini daraltır. Bir bölüm belirtmek için `section` argümanını ekleyin ve karşılık gelen `id`'sini değer olarak kullanın.

```javascript
ref.current.collapse();
ref.current.collapse('section1');
```

#### Olaylar

Bento Accordion API, aşağıdaki olaylara yanıt vermenizi sağlar:

##### onExpandStateChange

Bu olay, bir akordeon bölümü genişletildiğinde veya daraltıldığında ve genişletilmiş bölümden gönderildiğinde bir bölümde tetiklenir.

Örneğin aşağıya bakın.

##### onCollapse

Bu olay, bir akordeon bölümü daraltıldığında ve daraltılmış bölümden gönderildiğinde bir bölümde tetiklenir.

Aşağıdaki örnekte, `section 1` , `expand` olayını dinler ve genişletildiğinde `section 2`'yi genişletir. `section 2`, `collapse` olayını dinler ve daraltıldığında `section 1`'i daraltır.

Örneğin aşağıya bakın.

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

### Yerleşim ve stil

#### Kapsayıcı tipi

`BentoAccordion` bileşeninin tanımlanmış bir yerleşim boyutu türü vardır. Bileşenin doğru bir şekilde oluşturulduğundan emin olmak için, bileşene ve onun en yakın alt öğelerine istenen bir CSS yerleşimi ile bir boyut uygulamayı unutmayın (örneğin `height`, `width`, `aspect-ratio` veya bu tür diğer özelliklerle tanımlanmış bir düzen). Bunlar satır içinde uygulanabilir:

```jsx
<BentoAccordion style={{width: 300, height: 100}}>...</BentoAccordion>
```

Veya `className` aracılığıyla:

```jsx
<BentoAccordion className="custom-styles">...</BentoAccordion>
```

```css
.custom-styles {
  background-color: red;
}
```

### Aksesuarlar

#### BentoAccordion

##### animate

True ise, her bölümün genişletilmesi ve daraltılması sırasında "aşağı sarma" / "yukarı sarma" animasyonunu kullanır. Varsayılan: `false`

##### expandSingleSection

True ise, 1 bölümü genişletmek diğer tüm bölümleri otomatik olarak daraltır: Varsayılan: `false`

#### BentoAccordionSection

##### animate

True ise, her bölümün genişletilmesi ve daraltılması sırasında "aşağı sarma" / "yukarı sarma" animasyonunu kullanır. Varsayılan: `false`

##### expanded

True ise, bölümü genişletir. Varsayılan: `false`

##### onExpandStateChange

```typescript
(expanded: boolean): void
```

Genişletme durumu değişikliklerini dinlemek için geri arama. Bölümün henüz genişletilip genişletilmediğini gösteren parametre olarak bir boole bayrağı alır (`false`, daraltıldığını gösterir)

#### BentoAccordionHeader

#### Ortak aksesuarlar

Bu bileşen, React ve Preact bileşenleri için [ortak aksesuarları](../../../docs/spec/bento-common-props.md) destekler.

BentoAccordionHeader henüz herhangi bir özel aksesuarı desteklemiyor

#### BentoAccordionContent

#### Ortak aksesuarlar

Bu bileşen, React ve Preact bileşenleri için [ortak aksesuarları](../../../docs/spec/bento-common-props.md) destekler.

BentoAccordionContent henüz herhangi bir özel aksesuarı desteklemiyor
