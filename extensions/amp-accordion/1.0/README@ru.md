# Bento Accordion

Используйте Bento Accordion в виде веб-компонента ([`<bento-accordion>`](#web-component)) или как функциональный компонент Preact/React ([`<BentoAccordion>`](#preactreact-component)).

- Bento Accordion принимает в качестве непосредственных дочерних элементов один или несколько элементов `<section>`.
- Каждый элемент `<section>` должен содержать ровно два непосредственных дочерних элемента.
- Первый потомок элемента `<section>` — это заголовок соответствующего раздела Bento Accordion. Он должен иметь подходящий для этого тип (`<h1>–<h6>` или `<header>`).
- Второй потомок элемента `<section>` — это контент раскрываемого раздела.
    - Это может быть любой тег, разрешенный в [AMP HTML](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md).
- Нажатие или касание заголовка `<section>` разворачивает или сворачивает соответствующий раздел.
- Если элементу Bento Accordion присвоен `id`, состояние всех разделов запоминается, пока пользователь находится в пределах того же домена.

## Веб-компонент

Чтобы гарантировать правильную загрузку, вы должны подключить необходимые CSS-библиотеки всех компонентов Bento (это нужно сделать перед добавлением пользовательских стилей). Как вариант, вы можете использовать встраиваемые облегченные стили от предыдущей версии компонента. См. [Макет и стиль](#layout-and-style).

Представленные ниже примеры демонстрируют использование веб-компонента `<bento-accordion>`.

### Пример: импорт через npm

```sh
npm install @bentoproject/accordion
```

```javascript
import {defineElement as defineBentoAccordion} from '@bentoproject/accordion';
defineBentoAccordion();
```

### Пример: подключение через `<script>`

В примере ниже представлен компонент `bento-accordion` с тремя разделами. Атрибут `expanded` в третьем разделе разворачивает его при загрузке страницы.

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

### Интерактивность и использование API

API компонентов с поддержкой Bento позволяет обеспечить высокий уровень интерактивности при использовании их в качестве автономных веб-компонентов. Чтобы получить доступ к API компонента `bento-accordion`, включите в документ тег script со следующим содержимым:

```javascript
await customElements.whenDefined('bento-accordion');
const api = await accordion.getApi();
```

#### Действия

##### toggle()

Действие `toggle` переключает разделы элемента `bento-accordion` между `развернутым` и `свернутым` состоянием. При вызове без аргументов происходит переключение состояния всех разделов. Чтобы указать конкретный раздел, добавьте аргумент `section` и в качестве значения укажите <code>id</code> нужного раздела.

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

Действие `expand` разворачивает разделы элемента `bento-accordion`. Если раздел уже развернут, то он остается развернутым. При вызове без аргументов разворачиваются все разделы аккордеона. Чтобы указать конкретный раздел, добавьте аргумент `section` и в качестве значения укажите <code>id</code> нужного раздела.

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

Действие `collapse` сворачивает разделы элемента `bento-accordion`. Если раздел уже свернут, то он остается свернутым. При вызове без аргументов сворачиваются все разделы аккордеона. Чтобы указать конкретный раздел, добавьте аргумент `section` и в качестве значения укажите <code>id</code> нужного раздела.

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

#### События

API компонента `bento-accordion` позволяет регистрировать и отвечать на следующие события:

##### expand

Это событие срабатывает при раскрытии раздела аккордеона. Источник события — разворачиваемый раздел.

Пример см. ниже.

##### collapse

Это событие срабатывает при свертывании раздела аккордеона. Источник события — сворачиваемый раздел.

В приведенном ниже примере раздел `section1` ожидает события `expand` и при раскрытии разворачивает раздел `section2`. Раздел `section2` ожидает события `collapse` и при свертывании сворачивает раздел `section1`.

Пример см. ниже.

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

### Макет и стиль

У каждого компонента Bento есть небольшая библиотека CSS, которую следует подключать, чтобы гарантировать правильную загрузку без [сдвигов контента](https://web.dev/cls/). Поскольку приоритетность CSS определяется порядком, следует вручную убедиться, что таблицы стилей подключаются раньше каких-либо пользовательских стилей.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
/>
```

Как вариант, вы также можете использовать встраиваемые облегченные стили от предыдущей версии компонента:

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

### Атрибуты

#### animate

Атрибут `animate` активирует анимацию при раскрытии и свертывании разделов элемента `<bento-accordion>`.

Этот атрибут поддерживает настройку при помощи [медиазапроса](./../../../docs/spec/amp-html-responsive-attributes.md).

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

Если добавить атрибут `expanded` к одному из дочерних элементов `<section>`, то при загрузке страницы соответствующий раздел раскрывается.

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

У элемента `<bento-accordion>` с установленным атрибутом `expand-single-section` одновременно может быть раскрыт только один раздел. Это значит, что если пользователь коснется свернутого элемента `<section>`, чтобы развернуть его, то будут свернуты все остальные элементы `<section>`.

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

### Стилизация

Вы можете использовать селектор элемента `bento-accordion` для свободной стилизации аккордеона.

При стилизации элемента amp-accordion учитывайте следующее:

- Элементы `bento-accordion` всегда имеют тип `display: block`.
- Не допускается использование `float` для стилизации элементов `<section>`, заголовков или элементов контента.
- При раскрытии раздела к элементу `<section>` добавляется атрибут `expanded`.
- Элементы контента имеет свойство `overflow: hidden` для отмены обтекания плавающих элементов, поэтому у них не может быть полос прокрутки.
- Внешние отступы для `<bento-accordion>`, `<section>`, а также заголовков и элементов контента по умолчанию равны `0`, но могут быть переопределены при помощи пользовательских стилей.
- Как заголовки, так и элементы контента имеют свойство `position: relative`.

---

## Компонент для Preact/React

В приведенных ниже примерах демонстрируется использование `<BentoAccordion>` в качестве функционального компонента, который можно использовать с библиотеками Preact или React.

### Пример: импорт через npm

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

### Интерактивность и использование API

API компонентов Bento предоставляет высокий уровень интерактивности. Для доступа к API компонента `BentoAccordion` необходимо передать компоненту `ref`:

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

#### Действия

API компонента `BentoAccordion` позволяет выполнять следующие действия:

##### toggle()

Действие `toggle` переключает разделы элемента `bento-accordion` между `развернутым` и `свернутым` состоянием. При вызове без аргументов происходит переключение состояния всех разделов. Чтобы указать конкретный раздел, добавьте аргумент `section` и в качестве значения укажите <code>id</code> нужного раздела.

```javascript
ref.current.toggle();
ref.current.toggle('section1');
```

##### expand()

Действие `expand` разворачивает разделы элемента `bento-accordion`. Если раздел уже развернут, то он остается развернутым. При вызове без аргументов разворачиваются все разделы аккордеона. Чтобы указать конкретный раздел, добавьте аргумент `section` и в качестве значения укажите <code>id</code> нужного раздела.

```javascript
ref.current.expand();
ref.current.expand('section1');
```

##### collapse()

Действие `collapse` сворачивает разделы элемента `bento-accordion`. Если раздел уже свернут, то он остается свернутым. При вызове без аргументов сворачиваются все разделы аккордеона. Чтобы указать конкретный раздел, добавьте аргумент `section` и в качестве значения укажите <code>id</code> нужного раздела.

```javascript
ref.current.collapse();
ref.current.collapse('section1');
```

#### События

API компонента Bento Accordion позволяет отвечать на следующие события:

##### onExpandStateChange

Это событие срабатывает при раскрытии или свертывании раздела аккордеона. Источник события — разворачиваемый или сворачиваемый раздел.

Пример см. ниже.

##### onCollapse

Это событие срабатывает при свертывании раздела аккордеона. Источник события — сворачиваемый раздел.

В приведенном ниже примере раздел `section1` ожидает события `expand` и при раскрытии разворачивает раздел `section2`. Раздел `section2` ожидает события `collapse` и при свертывании сворачивает раздел `section1`.

Пример см. ниже.

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

### Макет и стиль

#### Тип контейнера

Компонент `BentoAccordion` использует тип макета с указанием размера. Чтобы обеспечить правильный рендеринг компонента, необходимо указать размер самого компонента и его непосредственных дочерних элементов при помощи свойств CSS (например, `height`, `width`, `aspect-ratio` и т. д.). Их можно указывать как непосредственно в коде:

```jsx
<BentoAccordion style={{width: 300, height: 100}}>...</BentoAccordion>
```

...так и при помощи `className`:

```jsx
<BentoAccordion className="custom-styles">...</BentoAccordion>
```

```css
.custom-styles {
  background-color: red;
}
```

### Props

#### BentoAccordion

##### animate

Значение «true» активирует анимацию при раскрытии и свертывании каждого раздела. По умолчанию: `false`

##### expandSingleSection

Значение «true» означает, что при раскрытии раздела все остальные разделы будут сворачиваться. По умолчанию: `false`

#### BentoAccordionSection

##### animate

Значение «true» активирует анимацию при раскрытии и свертывании соответствующего раздела. По умолчанию: `false`

##### expanded

Значение «true» разворачивает раздел. По умолчанию: `false`

##### onExpandStateChange

```typescript
(expanded: boolean): void
```

Обратный вызов, позволяющий отслеживать раскрытие и свертывание разделов. В качестве параметра принимает логическую переменную, обозначающую новое состояние раздела (`false` означает, что раздел был свернут)

#### BentoAccordionHeader

#### Общие props

Компонент BentoAccordionHeader поддерживает [props](../../../docs/spec/bento-common-props.md), являющиеся общими для всех компонентов React и Preact.

Дополнительные props в настоящее время не поддерживаются.

#### BentoAccordionContent

#### Общие props

Компонент BentoAccordionHeader поддерживает [props](../../../docs/spec/bento-common-props.md), являющиеся общими для всех компонентов React и Preact.

Дополнительные props в настоящее время не поддерживаются.
