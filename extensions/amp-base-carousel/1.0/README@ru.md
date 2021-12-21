# Bento Carousel

Универсальная кольцевая галерея для отображения нескольких похожих фрагментов контента по горизонтальной или вертикальной оси.

Каждый из непосредственных потомков компонента считается элементом кольцевой галереи. У каждого из этих узлов также могут быть произвольные дочерние элементы.

Кольцевая галерея состоит из произвольного количества элементов, а также дополнительных навигационных стрелок для перехода вперед или назад на один элемент.

Кольцевая галерея перемещается между элементами, когда пользователь проводит по ней пальцем или нажимает настраиваемые кнопки со стрелками.

## Веб-компонент

Чтобы гарантировать правильную загрузку, вы должны подключить необходимые CSS-библиотеки всех компонентов Bento (это нужно сделать перед добавлением пользовательских стилей). Как вариант, вы можете использовать встраиваемые облегченные стили от предыдущей версии компонента. См. [Макет и стиль](#layout-and-style).

Представленные ниже примеры демонстрируют использование веб-компонента `<bento-base-carousel>`.

### Пример: импорт через npm

```sh
npm install @bentoproject/base-carousel
```

```javascript
import {defineElement as defineBentoBaseCarousel} from '@bentoproject/base-carousel';
defineBentoBaseCarousel();
```

### Пример: подключение через `<script>`

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

### Интерактивность и использование API

API компонентов с поддержкой Bento позволяет обеспечить высокий уровень интерактивности при использовании их в качестве автономных веб-компонентов. Чтобы получить доступ к API компонента `bento-base-carousel`, включите в документ тег script со следующим содержимым:

```javascript
await customElements.whenDefined('bento-base-carousel');
const api = await carousel.getApi();
```

#### Действия

API компонента `bento-base-carousel` позволяет выполнять следующие действия:

##### next()

Перелистывает кольцевую галерею вперед на заданное атрибутом <code>advance-count</code> число слайдов.

```javascript
api.next();
```

##### prev()

Перелистывает кольцевую галерею назад на заданное атрибутом <code>advance-count</code> число слайдов.

```javascript
api.prev();
```

##### goToSlide(index: number)

Переходит к слайду кольцевой галереи под номером, соответствующим аргументу `index`. Примечание: если значение `index` ниже `0` или выше максимального значения, то выбирается слайд с ближайшим допустимым номером.

```javascript
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

#### События

API компонента `bento-base-carousel` позволяет регистрировать и отвечать на следующие события:

##### slideChange

Это событие срабатывает при смене слайда, отображаемого кольцевой галереей. Получить новый индекс можно при помощи `event.data.index`.

```javascript
carousel.addEventListener('slideChange', (e) => console.log(e.data.index));
```

### Макет и стиль

У каждого компонента Bento есть небольшая библиотека CSS, которую следует подключать, чтобы гарантировать правильную загрузку без [сдвигов контента](https://web.dev/cls/). Поскольку приоритетность CSS определяется порядком, следует вручную убедиться, что таблицы стилей подключаются раньше каких-либо пользовательских стилей.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css"
/>
```

Как вариант, вы также можете использовать встраиваемые облегченные стили от предыдущей версии компонента:

```html
<style>
  bento-base-carousel {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Тип контейнера

Компонент `bento-base-carousel` использует тип макета с указанием размера. Чтобы обеспечить правильный рендеринг компонента, необходимо указать размер самого компонента и его непосредственных дочерних элементов (слайдов) при помощи свойств CSS (например, `height`, `width`, `aspect-ratio` и т. д.):

```css
bento-base-carousel {
  height: 100px;
  width: 100%;
}

bento-base-carousel > * {
  aspect-ratio: 4/1;
}
```

### Переключение слайдов справа налево

При использовании компонента `<bento-base-carousel>` в контексте письменности справа налево (страницы на арабском, иврите и т. д.) необходимо соответствующий параметр. В противном случае кольцевая галерея по-прежнему будет работать, но в ее работе могут наблюдаться ошибки. Включить режим `rtl` можно следующим образом:

```html
<bento-base-carousel dir="rtl" …>
  …
</bento-base-carousel>
```

Если кольцевая галерея находится в контексте письменности справа налево, но при этом от нее требуется обратное поведение, можно явно указать параметр `dir="ltr"`.

### Макет слайдов

При **отсутствии** атрибута `mixed-lengths` размер слайдов в кольцевой галерее задается автоматически.

```html
<bento-base-carousel …>
  <img style="height: 100%; width: 100%" src="…" />
</bento-base-carousel>
```

При генерации макета кольцевой галереи высота слайдов определяется автоматически. Ее можно с легкостью изменить при помощи CSS. Слайды с явно заданной высотой центрируются по вертикали внутри кольцевой галереи.

Если контент слайда необходимо центрировать по горизонтали, его можно обернуть в другой элемент и с его помощью выровнять контент по центру.

### Число видимых слайдов

Если число видимых слайдов задается динамически при помощи медиазапроса в `visible-slides`, то следует соответствующим образом подстраивать соотношение сторон галереи. Например, если требуется отображать одновременно три слайда с соотношением сторон 1:1, то для самой кольцевой галереи следует указать соотношение 3:1. Соответственно, если отображаются четыре слайда, то используйте соотношение 4:1. Кроме того, при изменении `visible-slides`, вероятно, следует также изменить `advance-count`.

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

### Атрибуты

#### Медиазапросы

Для атрибутов компонента `<bento-base-carousel>` можно задавать различные варианты настроек при помощи [медиазапросов](./../../../docs/spec/amp-html-responsive-attributes.md).

#### Число видимых слайдов

##### mixed-length

`true` или `false`, по умолчанию — `false`. «true» означает, что для каждого слайда используется исходная ширина (или высота, если кольцевая галерея горизонтальная). Это позволяет использовать в кольцевой галерее слайды различной ширины.

##### visible-count

Число, по умолчанию — `1`. Определяет количество одновременно отображаемых слайдов. Можно указать дробное значение, чтобы сделать следующий слайд или слайды видимыми частично. Параметр игнорируется, если атрибут `mixed-length` равен `true`.

##### advance-count

Число, по умолчанию — `1`. Определяет количество слайдов кольцевой галереи, перелистываемых при нажатии на стрелку вперед или назад. Этот параметр полезен при использовании атрибута `visible-count`.

#### Автопрокрутка

##### auto-advance

`true` или `false`, по умолчанию — `false`. Включает автоматическую прокрутку кольцевой галереи с задержкой. Если пользователь перелистывает галерею вручную, автопрокрутка останавливается. Обратите внимание, что если атрибут `loop` выключен, то после достижения конца галереи автопрокрутка возвращается в начало.

##### auto-advance-count

Число, по умолчанию — `1`. Определяет количество слайдов кольцевой галереи, перелистываемых при автопрокрутке. Этот параметр полезен при использовании атрибута `visible-count`.

##### auto-advance-interval

Число, по умолчанию — `1000`. Определяет временной интервал (в миллисекундах) при автоматическом перелистывании кольцевой галереи.

##### auto-advance-loops

Число, по умолчанию — `∞`. Количество полных оборотов, которые кольцевая галерея должна совершить, прежде чем автопрокрутка остановится.

#### Привязка положения прокрутки

##### snap

`true` или `false`, по умолчанию — `true`. Включает привязку к слайдам при прокрутке кольцевой галереи.

##### snap-align

`start` или `center`. «start» означает, что начало слайда (т. е. левый или верхний край, в зависимости от направления выравнивания) выравнивается по левому или верхнему краю кольцевой галереи. «center» означает, что центр слайда выравнивается относительно центра галереи.

##### snap-by

Число, по умолчанию — `1`. Определяет шаг привязки. Этот параметр полезен при использовании атрибута `visible-count`.

#### Прочие

##### controls

`"always"`, `"auto"` или `"never"`, по умолчанию — `"auto"`. Управляет отображением навигационных стрелок для перелистывания галереи. Примечание: когда `outset-arrows` имеет значение `true`, стрелки показываются всегда (`"always"`).

-   `always`: стрелки отображаются всегда.
-   `auto`: стрелки отображаются в том случае, если пользователь в последний раз взаимодействовал с галереей при помощи мыши, а не касания. На сенсорных устройствах после загрузки элемента стрелки будут отображаться до первого взаимодействия пользователя с галереей.
-   `never`: стрелки не отображаются.

##### slide

Число, по умолчанию — `0`. Номер слайда, отображаемого в галерее сразу после загрузки. Можно изменять при помощи `Element.setAttribute` для переключения отображаемого слайда.

##### loop

`true` или `false`, по умолчанию — `false`. Разрешает пользователю переходить от последнего элемента галереи к первому и наоборот. Для работы этой возможности необходимо, чтобы число слайдов в галерее превышало `visible-count` как минимум в три раза.

##### orientation

`horizontal` или `vertical`, по умолчанию — `horizontal`. `horizontal` означает, что элементы галереи располагаются по горизонтали и пользователь перелистывает их слева направо. `vertical` означает, что элементы располагаются по вертикали и пользователь перелистывает их сверху вниз.

### Стилизация

Вы можете использовать селектор элемента `bento-base-carousel` для свободной стилизации кольцевой галереи.

#### Настройка кнопок для перелистывания

Внешний вид кнопок для перелистывания можно настраивать, указывая собственную разметку. Например, для того чтобы воспроизвести стандартный стиль, используйте следующий код HTML и CSS:

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

## Компонент для Preact/React

В приведенных ниже примерах демонстрируется использование `<BentoBaseCarousel>` в качестве функционального компонента, который можно использовать с библиотеками Preact или React.

### Пример: импорт через npm

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

### Интерактивность и использование API

API компонентов Bento предоставляет высокий уровень интерактивности. Для доступа к API компонента `BentoBaseCarousel` необходимо передать компоненту `ref`:

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

#### Действия

API компонента `BentoBaseCarousel` позволяет выполнять следующие действия:

##### next()

Перелистывает кольцевую галерею вперед на заданное атрибутом `advanceCount` число слайдов.

```javascript
ref.current.next();
```

##### prev()

Перелистывает кольцевую галерею назад на заданное атрибутом `advanceCount` число слайдов.

```javascript
ref.current.prev();
```

##### goToSlide(index: number)

Переходит к слайду кольцевой галереи под номером, соответствующим аргументу `index`. Примечание: если значение `index` ниже `0` или выше максимального значения, то выбирается слайд с ближайшим допустимым номером.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

#### События

API компонента `BentoBaseCarousel` позволяет регистрировать и отвечать на следующие события:

##### onSlideChange

Это событие срабатывает при смене слайда, отображаемого кольцевой галереей.

```jsx
<BentoBaseCarousel onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

### Макет и стиль

#### Тип контейнера

Компонент `BentoBaseCarousel` использует тип макета с указанием размера. Чтобы обеспечить правильный рендеринг компонента, необходимо указать размер самого компонента и его непосредственных дочерних элементов (слайдов) при помощи свойств CSS (например, `height`, `width`, `aspect-ratio` и т. д.). Их можно указывать как непосредственно в коде:

```jsx
<BentoBaseCarousel style={{width: 300, height: 100}}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

...так и при помощи `className`:

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

### Переключение слайдов справа налево

При использовании компонента `<BentoBaseCarousel>` в контексте письменности справа налево (страницы на арабском, иврите и т. д.) необходимо указать соответствующий параметр. В противном случае кольцевая галерея по-прежнему будет работать, но в ее работе могут наблюдаться ошибки. Включить режим `rtl` можно следующим образом:

```jsx
<BentoBaseCarousel dir="rtl">…</BentoBaseCarousel>
```

Если кольцевая галерея находится в контексте письменности справа налево, но при этом от нее требуется обратное поведение, можно явно указать параметр `dir="ltr"`.

### Макет слайдов

При **отсутствии** атрибута `mixedLengths` размер слайдов в кольцевой галерее задается автоматически.

```jsx
<BentoBaseCarousel>
  <img style={{height: '100%', width: '100%'}} src="…" />
</BentoBaseCarousel>
```

При генерации макета кольцевой галереи высота слайдов определяется автоматически. Ее можно с легкостью изменить при помощи CSS. Слайды с явно заданной высотой центрируются по вертикали внутри кольцевой галереи.

Если контент слайда необходимо центрировать по горизонтали, его можно обернуть в другой элемент и с его помощью выровнять контент по центру.

### Число видимых слайдов

Если число видимых слайдов задается динамически при помощи медиазапроса в `visibleSlides`, то следует соответствующим образом подстраивать соотношение сторон галереи. Например, если требуется отображать одновременно три слайда с соотношением сторон 1:1, то для самой кольцевой галереи следует указать соотношение 3:1. Соответственно, если отображаются четыре слайда, то используйте соотношение 4:1. Кроме того, при изменении `visibleSlides`, вероятно, следует также изменить `advanceCount`.

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

### Props

#### Число видимых слайдов

##### mixedLength

`true` или `false`, по умолчанию — `false`. «true» означает, что для каждого слайда используется исходная ширина (или высота, если кольцевая галерея горизонтальная). Это позволяет использовать в кольцевой галерее слайды различной ширины.

##### visibleCount

Число, по умолчанию — `1`. Определяет количество одновременно отображаемых слайдов. Можно указать дробное значение, чтобы сделать следующий слайд или слайды видимыми частично. Параметр игнорируется, если атрибут `mixedLength` равен `true`.

##### advanceCount

Число, по умолчанию — `1`. Определяет количество слайдов кольцевой галереи, перелистываемых при нажатии на стрелку вперед или назад. Этот параметр полезен при использовании атрибута `visibleCount`.

#### Автопрокрутка

##### autoAdvance

`true` или `false`, по умолчанию — `false`. Включает автоматическую прокрутку кольцевой галереи с задержкой. Если пользователь перелистывает галерею вручную, автопрокрутка останавливается. Обратите внимание, что если атрибут `loop` выключен, то после достижения конца галереи автопрокрутка возвращается в начало.

##### autoAdvanceCount

Число, по умолчанию — `1`. Определяет количество слайдов кольцевой галереи, перелистываемых при автопрокрутке. Этот параметр полезен при использовании атрибута `visible-count`.

##### autoAdvanceInterval

Число, по умолчанию — `1000`. Определяет временной интервал (в миллисекундах) при автоматическом перелистывании кольцевой галереи.

##### autoAdvanceLoops

Число, по умолчанию — `∞`. Количество полных оборотов, которые кольцевая галерея должна совершить, прежде чем автопрокрутка остановится.

#### Привязка положения прокрутки

##### snap

`true` или `false`, по умолчанию — `true`. Включает привязку к слайдам при прокрутке кольцевой галереи.

##### snapAlign

`start` или `center`. «start» означает, что начало слайда (т. е. левый или верхний край, в зависимости от направления выравнивания) выравнивается по левому или верхнему краю кольцевой галереи. «center» означает, что центр слайда выравнивается относительно центра галереи.

##### snapBy

Число, по умолчанию — `1`. Определяет шаг привязки. Этот параметр полезен при использовании атрибута `visible-count`.

#### Прочие

##### controls

`"always"`, `"auto"` или `"never"`, по умолчанию — `"auto"`. Управляет отображением навигационных стрелок для перелистывания галереи. Примечание: когда `outset-arrows` имеет значение `true`, стрелки показываются всегда (`"always"`).

-   `always`: стрелки отображаются всегда.
-   `auto`: стрелки отображаются в том случае, если пользователь в последний раз взаимодействовал с галереей при помощи мыши, а не касания. На сенсорных устройствах после загрузки элемента стрелки будут отображаться до первого взаимодействия пользователя с галереей.
-   `never`: стрелки не отображаются.

##### defaultSlide

Число, по умолчанию — `0`. Номер слайда, отображаемого в галерее сразу после загрузки.

##### loop

`true` или `false`, по умолчанию — `false`. Разрешает пользователю переходить от последнего элемента галереи к первому и наоборот. Для работы этой возможности необходимо, чтобы число слайдов в галерее превышало `visible-count` как минимум в три раза.

##### orientation

`horizontal` или `vertical`, по умолчанию — `horizontal`. `horizontal` означает, что элементы галереи располагаются по горизонтали и пользователь перелистывает их слева направо. `vertical` означает, что элементы располагаются по вертикали и пользователь перелистывает их сверху вниз.

### Стилизация

Вы можете использовать селектор элемента `BentoBaseCarousel` для свободной стилизации кольцевой галереи.

#### Настройка кнопок для перелистывания

Внешний вид кнопок для перелистывания можно настраивать, указывая собственную разметку. Например, для того чтобы воспроизвести стандартный стиль, используйте следующий код HTML и CSS:

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
