# Bento Carousel

Yatay veya dikey bir eksen boyunca birden çok benzer içerik parçasını görüntülemek için genel bir döngü.

Bileşenin birinci dereceden alt öğelerinin her biri, döngüdeki bir öğe olarak kabul edilir. Bu düğümlerin her birinin keyfi altöğeleri de olabilir.

Döngü, isteğe bağlı sayıda öğenin yanı sıra tek bir öğeden ileri veya geri gitmek için isteğe bağlı gezinme oklarından oluşur.

Kullanıcı, özelleştirilebilir ok düğmelerini kaydırırsa veya kullanırsa, döngü öğeler arasında ilerler.

## Web Bileşeni

Uygun yüklemeyi garanti etmek için ve özel stiller eklemeden önce her Bento bileşeninin gerekli CSS kitaplığını eklemelisiniz. Veya satır içi olarak sunulan hafif ön yükseltme stillerini kullanın. [Yerleşim ve stil](#layout-and-style) konusuna bakın.

Aşağıdaki örnekler, `<bento-base-carousel>` web bileşeninin kullanımını göstermektedir.

### Örnek: npm ile içe aktarma

```sh
npm install @bentoproject/base-carousel
```

```javascript
import {defineElement as defineBentoBaseCarousel} from '@bentoproject/base-carousel';
defineBentoBaseCarousel();
```

### `<script>` ile ekleme

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-base-carousel {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.js"
  ></script>
  <style>
    bento-base-carousel,
    bento-base-carousel > div {
      aspect-ratio: 4/1;
    }
    .red {
      background: darkred;
    }
    .blue {
      background: steelblue;
    }
    .green {
      background: seagreen;
    }
  </style>
</head>
<bento-base-carousel id="my-carousel">
  <div class="red"></div>
  <div class="blue"></div>
  <div class="green"></div>
</bento-base-carousel>
<div class="buttons" style="margin-top: 8px">
  <button id="prev-button">Go to previous slide</button>
  <button id="next-button">Go to next slide</button>
  <button id="go-to-button">Go to slide with green gradient</button>
</div>

<script>
  (async () => {
    const carousel = document.querySelector('#my-carousel');
    await customElements.whenDefined('bento-base-carousel');
    const api = await carousel.getApi();

    // programatically advance to next slide
    api.next();

    // set up button actions
    document.querySelector('#prev-button').onclick = () => api.prev();
    document.querySelector('#next-button').onclick = () => api.next();
    document.querySelector('#go-to-button').onclick = () => api.goToSlide(2);
  })();
</script>
```

### Etkileşim ve API kullanımı

Bağımsız bir web bileşeni olarak kullanılan Bento özellikli bileşenler, API'leri aracılığıyla yüksek düzeyde etkileşimlidir. `bento-base-carousel` bileşeni API'sine, belgenize aşağıdaki komut dosyası etiketi eklenerek erişilebilir:

```javascript
await customElements.whenDefined('bento-base-carousel');
const api = await carousel.getApi();
```

#### Eylemler

`bento-base-carousel` API, aşağıdaki eylemleri gerçekleştirmenize olanak tanır:

##### next()

`advance-count` slaytlarıyla ileri doğru hareket ettirir.

```javascript
api.next();
```

##### prev()

`advance-count` slaytlarıyla geriye doğru hareket ettirir.

```javascript
api.prev();
```

##### goToSlide(index: number)

Döngüyü `index` bağımsız değişkeni tarafından belirtilen slayda taşır. Not: `index`, 0'dan büyük veya `0`'a eşit ve verilen slayt sayısından küçük bir sayıya normalize edilecektir.

```javascript
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

#### Olaylar

`bento-base-carousel` API, aşağıdaki olayları kaydetmenize ve yanıtlamanıza olanak tanır:

##### slideChange

Bu olay, döngü tarafından görüntülenen dizin değiştiğinde tetiklenir. Yeni dizine `event.data.index` aracılığıyla erişilebilir.

```javascript
carousel.addEventListener('slideChange', (e) => console.log(e.data.index));
```

### Yerleşim ve stil

[Her Bento bileşeni, içerik kaymaları](https://web.dev/cls/) olmadan düzgün yüklemeyi garanti etmek için eklemeniz gereken küçük bir CSS kitaplığına sahiptir. Düzene dayalı özgüllük nedeniyle, herhangi bir özel stilden önce stil sayfalarının dahil edilmesini manuel olarak sağlamalısınız.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css"
/>
```

Alternatif olarak, hafif ön yükseltme stillerini satır içi olarak da kullanıma sunabilirsiniz:

```html
<style>
  bento-base-carousel {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Kapsayıcı tipi

`bento-base-carousel` bileşeninin tanımlanmış bir yerleşim boyutu türü vardır. Bileşenin doğru bir şekilde oluşturulduğundan emin olmak için, bileşene ve onun en yakın alt öğelerine (slaytlar) istenen bir CSS yerleşimi ile bir boyut uygulamayı unutmayın (örneğin `height`, `width`, `aspect-ratio` veya bu tür diğer özelliklerle tanımlanmış bir düzen).

```css
bento-base-carousel {
  height: 100px;
  width: 100%;
}

bento-base-carousel > * {
  aspect-ratio: 4/1;
}
```

### Sağdan sola slayt değiştirme

`<bento-base-carousel>`, sağdan sola (rtl) bağlamında (örneğin Arapça, İbranice sayfalar) olduğunda tanımlamanızı gerektirir. Döngü genellikle bu olmadan çalışacak olsa da, birkaç hata olabilir. Döngüye aşağıdaki şekilde `rtl` olarak çalışması gerektiğini bildirebilirsiniz:

```html
<bento-base-carousel dir="rtl" …>
  …
</bento-base-carousel>
```

Döngü bir RTL bağlamındaysa ve döngünün LTR olarak çalışmasını istiyorsanız, döngüde `dir="ltr"`'yi açıkça ayarlayabilirsiniz.

### Slayt düzeni

Slaytlar `mixed-lengths` **belirtilmediğinde** döngü tarafından otomatik boyutlandırılır.

```html
<bento-base-carousel …>
  <img style="height: 100%; width: 100%" src="…" />
</bento-base-carousel>
```

Döngü düzenlendiğinde slaytlar örtülü yüksekliğe sahiptir. Bu, CSS ile kolayca değiştirilebilir. Yüksekliği belirtirken, slayt, döngü içinde dikey olarak ortalanacaktır.

Slayt içeriğinizi yatay olarak ortalamak istiyorsanız, bir sarma öğesi oluşturmak ve bunu içeriği ortalamak için kullanmak isteyeceksiniz.

### Görünür slayt sayısı

Bir medya sorgusuna yanıt olarak `visible-slides` kullanılarak görünür slayt sayısını değiştirirken, görünür slaytların yeni sayısıyla eşleşmesi için büyük olasılıkla döngünün en boy oranını değiştirmek isteyeceksiniz. Örneğin, tek tek en boy oranıyla aynı anda üç slayt göstermek istiyorsanız, döngü için en boy oranının üçe bir olmasını istersiniz. Benzer şekilde, bir seferde dört slaytta, dörde bir en-boy oranı isteyeceksiniz. Ayrıca, `visible-slides`'ı değiştirirken, büyük olasılıkla `advance-count`'ı değiştirmek isteyeceksiniz.

```html
<!-- Using an aspect ratio of 3:2 for the slides in this example. -->
<bento-base-carousel
  visible-count="(min-width: 600px) 4, 3"
  advance-count="(min-width: 600px) 4, 3"
>
  <img style="height: 100%; width: 100%" src="…" />
  …
</bento-base-carousel>
```

### Öznitellikler

#### Medya Sorguları

`<bento-base-carousel>` öznitelikleri, bir [medya sorgusuna](./../../../docs/spec/amp-html-responsive-attributes.md) dayalı olarak farklı seçenekleri kullanmak üzere yapılandırılabilir.

#### Görünür slayt sayısı

##### mixed-length

`true` veya `false`, varsayılan olarak `false` şeklindedir. Doğru olduğunda, slaytların her biri için mevcut genişliği (veya yatay olduğunda yüksekliği) kullanır. Bu, farklı genişliklerde slaytlara sahip bir atlıkarınca kullanılmasına izin verir.

##### visible-count

Bir sayı, varsayılan olarak `1`'dir. Belirli bir zamanda kaç slayt gösterileceğini belirler. Kesirli değerler, ek slayt(lar)ın bir kısmını görünür kılmak için kullanılabilir. `mixed-length` `true` olduğunda bu seçenek yoksayılır.

##### advance-count

Bir sayı, varsayılan olarak `1`'dir. Önceki veya sonraki okları kullanarak ilerlerken döngünün kaç slayt ilerleyeceğini belirler. Bu, `visible-count` özniteliğini belirtirken kullanışlıdır.

#### Otomatik ilerleme

##### auto-advance

`true` veya `false`, varsayılan olarak `false` şeklindedir. Bir gecikmeye bağlı olarak döngüyü bir sonraki slayta otomatik olarak ilerletir. Kullanıcı slaytları manuel olarak değiştirirse, otomatik ilerleme durdurulur. `loop` etkin değilse, son öğeye ulaşıldığında, otomatik ilerlemenin ilk öğeye geri gideceğini unutmayın.

##### auto-advance-count

Bir sayı, varsayılan olarak `1`'dir. Otomatik olarak ilerlerken döngünün kaç slayt ilerleyeceğini belirler. Bu, `visible-count` özniteliğini belirtirken kullanışlıdır.

##### auto-advance-interval

Bir sayı, varsayılan olarak `1000`'dir. Döngüdeki sonraki otomatik ilerlemeler arasındaki süreyi milisaniye cinsinden belirtir.

##### auto-advance-loops

Bir sayı, varsayılan olarak `∞` şeklindedir. Döngünün durmadan önce slaytlar boyunca kaç kez ilerlemesi gerektiği belirtir.

#### Tutturma

##### snap

`true` veya `false` olabilir, varsayılan olarak `true` şeklindedir. Kaydırma sırasında döngünün slaytlara tutturulmasının gerekip gerekmediğini belirler.

##### snap-align

`start` veya `center` şeklindedir. Hizalamaya başlarken, bir slaytın başlangıcı (örneğin, yatay hizalama sırasında sol kenar) bir döngü başlangıcı ile hizalanır. Merkeze hizalama sırasında, bir slaytın merkezi, bir döngünün merkezi ile hizalanır.

##### snap-by

Bir sayı, varsayılan olarak `1`'dir. Bu, tutturmanın ayrıntı düzeyini belirler ve `visible-count` kullanılırken kullanışlıdır.

#### Çeşitli

##### controls

`"always"` , `"auto"` veya `"never"` şeklindedir ve varsayılan olarak `"auto"` olacaktır. Bu, önceki/sonraki gezinme oklarının görüntülenip görüntülenmeyeceğini ve ne zaman görüntüleneceğini belirler. Not: `outset-arrows` `true` olduğunda, oklar `"always"` gösterilir.

-   `always` : Oklar her zaman gösterilir.
-   `auto` : Döngü en son fare aracılığıyla etkileşim aldığında oklar gösterilir ve döngü en son dokunma yoluyla etkileşim aldığında görüntülenmez. Dokunmatik cihazlar için ilk yüklemede, ilk etkileşime kadar oklar görüntülenir.
-   `never` : Oklar hiçbir zaman gösterilmez.

##### slide

Bir sayıdır ve varsayılan olarak `0`'dır. Bu, döngüde gösterilen ilk slaydı belirler. Bu, o anda hangi slaydın gösterildiğini kontrol eden `Element.setAttribute` ile değiştirilebilir.

##### loop

`true` veya `false` şeklindedir ve atlandığında varsayılan olarak `false` olur. True olduğunda, döngü kullanıcının ilk öğeden son öğeye geri dönmesine izin verir ve bunun tersi de geçerlidir. Döngünün gerçekleşmesi için `visible-count` slayt sayısının en az üç katı olmalıdır.

##### orientation

`horizontal` veya `vertical` şeklindedir ve varsayılan olarak `horizontal` olur. Yatay olduğunda `horizontal` düzenlenir ve kullanıcı sola ve sağa kaydırabilir. `vertical` olduğunda, döngü dikey olarak düzenlenir ve kullanıcı yukarı ve aşağı kaydırabilir.

### Stil

Döngüye özgürce stil vermek için `bento-base-carousel` öğe seçiciyi kullanabilirsiniz.

#### Ok düğmelerini özelleştirme

Ok düğmeleri, kendi özel işaretlemenizi geçerek özelleştirilebilir. Örneğin, aşağıdaki HTML ve CSS ile varsayılan stili yeniden oluşturabilirsiniz:

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```html
<bento-base-carousel …>
  <div>first slide</div>
  …
  <button slot="next-arrow" class="carousel-next" aria-label="Next"></button>
  <button
    slot="prev-arrow"
    class="carousel-prev"
    aria-label="Previous"
  ></button>
</bento-base-carousel>
```

---

## Preact/React Bileşeni

Aşağıdaki örnekler, Preact veya React kitaplıklarıyla kullanılabilen işlevsel bir bileşen olarak &lt;BentoBaseCarousel&gt; kullanımını gösteriyor.

### Örnek: npm ile içe aktarma

```sh
npm install @bentoproject/base-carousel
```

```javascript
import React from 'react';
import {BentoBaseCarousel} from '@bentoproject/base-carousel/react';
import '@bentoproject/base-carousel/styles.css';

function App() {
  return (
    <BentoBaseCarousel>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

### Etkileşim ve API kullanımı

Bento bileşenleri, API'leri aracılığıyla yüksek düzeyde etkileşimlidir. `BentoBaseCarousel` bileşen API'sine, bir `ref` geçirerek erişilebilir:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoBaseCarousel ref={ref}>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

#### Eylemler

`BentoBaseCarousel` API, aşağıdaki eylemleri gerçekleştirmenize olanak tanır:

##### next()

`advanceCount` slaytlarıyla ileri doğru hareket ettirir.

```javascript
ref.current.next();
```

##### prev()

`advanceCount` slaytları ile döngüyü geriye doğru hareket ettirir.

```javascript
ref.current.prev();
```

##### goToSlide(index: number)

Döngüyü `index` bağımsız değişkeni tarafından belirtilen slayda taşır. Not: `index`, 0'dan büyük veya `0`'a eşit ve verilen slayt sayısından küçük bir sayıya normalize edilecektir.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

#### Olaylar

`BentoBaseCarousel` API, aşağıdaki olayları kaydetmenize ve yanıtlamanıza olanak tanır:

##### onSlideChange

Bu olay, döngü tarafından görüntülenen dizin değiştiğinde tetiklenir.

```jsx
<BentoBaseCarousel onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

### Yerleşim ve stil

#### Kapsayıcı tipi

`BentoBaseCarousel` bileşeninin tanımlanmış bir yerleşim boyutu türü vardır. Bileşenin doğru bir şekilde oluşturulduğundan emin olmak için, bileşene ve onun en yakın alt öğelerine (slaytlar) istenen bir CSS yerleşimi ile bir boyut uygulamayı unutmayın (örneğin `height`, `width`, `aspect-ratio` veya bu tür diğer özelliklerle tanımlanmış bir düzen). Bunlar satır içinde uygulanabilir:

```jsx
<BentoBaseCarousel style={{width: 300, height: 100}}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

Veya `className` aracılığıyla:

```jsx
<BentoBaseCarousel className="custom-styles">
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}

.custom-styles > * {
  aspect-ratio: 4/1;
}
```

### Sağdan sola slayt değiştirme

`<BentoBaseCarousel>` , sağdan sola (rtl) bağlamında (örneğin Arapça, İbranice sayfalar) olduğunda tanımlamanızı gerektirir. Döngü genellikle bu olmadan çalışacak olsa da, birkaç hata olabilir. Döngüye aşağıdaki şekilde `rtl` olarak çalışması gerektiğini bildirebilirsiniz:

```jsx
<BentoBaseCarousel dir="rtl">…</BentoBaseCarousel>
```

Döngü bir RTL bağlamındaysa ve döngünün LTR olarak çalışmasını istiyorsanız, döngüde `dir="ltr"`'yi açıkça ayarlayabilirsiniz.

### Slayt düzeni

Slaytlar `mixedLengths` <strong>belirtilmediğinde</strong> döngü tarafından otomatik boyutlandırılır.

```jsx
<BentoBaseCarousel>
  <img style={{height: '100%', width: '100%'}} src="…" />
</BentoBaseCarousel>
```

Döngü düzenlendiğinde slaytlar örtülü yüksekliğe sahiptir. Bu, CSS ile kolayca değiştirilebilir. Yüksekliği belirtirken, slayt, döngü içinde dikey olarak ortalanacaktır.

Slayt içeriğinizi yatay olarak ortalamak istiyorsanız, bir sarma öğesi oluşturmak ve bunu içeriği ortalamak için kullanmak isteyeceksiniz.

### Görünür slayt sayısı

Bir medya sorgusuna yanıt olarak `visibleSlides` kullanılarak görünür slayt sayısını değiştirirken, görünür slaytların yeni sayısıyla eşleşmesi için büyük olasılıkla döngünün en boy oranını değiştirmek isteyeceksiniz. Örneğin, tek tek en boy oranıyla aynı anda üç slayt göstermek istiyorsanız, döngü için en boy oranının üçe bir olmasını istersiniz. Benzer şekilde, bir seferde dört slaytta, dörde bir en-boy oranı isteyeceksiniz. Ayrıca, `visibleSlides`'ı değiştirirken, büyük olasılıkla `advanceCount`'ı değiştirmek isteyeceksiniz.

```jsx
const count = window.matchMedia('(max-width: 600px)').matches ? 4 : 3;

<BentoBaseCarousel
  visibleCount={count}
  advanceCount={count}
>
  <img style={{height: '100%', width: '100%'}} src="…" />
  …
</BentoBaseCarousel>
```

### Aksesuarlar

#### Görünür slayt sayısı

##### mixedLength

`true` veya `false`, varsayılan olarak `false` şeklindedir. Doğru olduğunda, slaytların her biri için mevcut genişliği (veya yatay olduğunda yüksekliği) kullanır. Bu, farklı genişliklerde slaytlara sahip bir atlıkarınca kullanılmasına izin verir.

##### visibleCount

Bir sayı, varsayılan olarak `1`'dir. Belirli bir zamanda kaç slayt gösterileceğini belirler. Kesirli değerler, ek slayt(lar)ın bir kısmını görünür kılmak için kullanılabilir. `mixedLength` `true` olduğunda bu seçenek yoksayılır.

##### advanceCount

Bir sayı, varsayılan olarak `1`'dir. Önceki veya sonraki okları kullanarak ilerlerken döngünün kaç slayt ilerleyeceğini belirler. Bu, `visibleCount` özniteliğini belirtirken kullanışlıdır.

#### Otomatik ilerleme

##### autoAdvance

`true` veya `false`, varsayılan olarak `false` şeklindedir. Bir gecikmeye bağlı olarak döngüyü bir sonraki slayta otomatik olarak ilerletir. Kullanıcı slaytları manuel olarak değiştirirse, otomatik ilerleme durdurulur. `loop` etkin değilse, son öğeye ulaşıldığında, otomatik ilerlemenin ilk öğeye geri gideceğini unutmayın.

##### autoAdvanceCount

Bir sayı, varsayılan olarak `1`'dir. Otomatik olarak ilerlerken döngünün kaç slayt ilerleyeceğini belirler. Bu, `visible-count` özniteliğini belirtirken kullanışlıdır.

##### autoAdvanceInterval

Bir sayı, varsayılan olarak `1000`'dir. Döngüdeki sonraki otomatik ilerlemeler arasındaki süreyi milisaniye cinsinden belirtir.

##### autoAdvanceLoops

Bir sayı, varsayılan olarak `∞` şeklindedir. Döngünün durmadan önce slaytlar boyunca kaç kez ilerlemesi gerektiği belirtir.

#### Tutturma

##### snap

`true` veya `false` olabilir, varsayılan olarak `true` şeklindedir. Kaydırma sırasında döngünün slaytlara tutturulmasının gerekip gerekmediğini belirler.

##### snapAlign

`start` veya `center` şeklindedir. Hizalamaya başlarken, bir slaytın başlangıcı (örneğin, yatay hizalama sırasında sol kenar) bir döngü başlangıcı ile hizalanır. Merkeze hizalama sırasında, bir slaytın merkezi, bir döngünün merkezi ile hizalanır.

##### snapBy

Bir sayı, varsayılan olarak `1`'dir. Bu, tutturmanın ayrıntı düzeyini belirler ve `visible-count` kullanılırken kullanışlıdır.

#### Çeşitli

##### controls

`"always"` , `"auto"` veya `"never"` şeklindedir ve varsayılan olarak `"auto"` olacaktır. Bu, önceki/sonraki gezinme oklarının görüntülenip görüntülenmeyeceğini ve ne zaman görüntüleneceğini belirler. Not: `outset-arrows` `true` olduğunda, oklar `"always"` gösterilir.

-   `always` : Oklar her zaman gösterilir.
-   `auto` : Döngü en son fare aracılığıyla etkileşim aldığında oklar gösterilir ve döngü en son dokunma yoluyla etkileşim aldığında görüntülenmez. Dokunmatik cihazlar için ilk yüklemede, ilk etkileşime kadar oklar görüntülenir.
-   `never` : Oklar hiçbir zaman gösterilmez.

##### defaultSlide

Bir sayıdır ve varsayılan olarak `0`'dır. Bu, döngüde gösterilen ilk slaydı belirler.

##### loop

`true` veya `false` şeklindedir ve atlandığında varsayılan olarak `false` olur. True olduğunda, döngü kullanıcının ilk öğeden son öğeye geri dönmesine izin verir ve bunun tersi de geçerlidir. Döngünün gerçekleşmesi için `visible-count` slayt sayısının en az üç katı olmalıdır.

##### orientation

`horizontal` veya `vertical` şeklindedir ve varsayılan olarak `horizontal` olur. Yatay olduğunda `horizontal` düzenlenir ve kullanıcı sola ve sağa kaydırabilir. `vertical` olduğunda, döngü dikey olarak düzenlenir ve kullanıcı yukarı ve aşağı kaydırabilir.

### Stil

Döngüye özgürce stil vermek için `BentoBaseCarousel` öğe seçiciyi kullanabilirsiniz.

#### Ok düğmelerini özelleştirme

Ok düğmeleri, kendi özel işaretlemenizi geçerek özelleştirilebilir. Örneğin, aşağıdaki HTML ve CSS ile varsayılan stili yeniden oluşturabilirsiniz:

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```jsx
function CustomPrevButton(props) {
  return <button {...props} className="carousel-prev" />;
}

function CustomNextButton(props) {
  return <button {...props} className="carousel-prev" />;
}

<BentoBaseCarousel
  arrowPrevAs={CustomPrevButton}
  arrowNextAs={CustomNextButton}
>
  <div>first slide</div>
  // …
</BentoBaseCarousel>
```
