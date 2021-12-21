# Bento Fit Text

Компонент размещает текстовый контент в рамках отведенного пространства, определяя наиболее подходящий для него размер шрифта.

Компонент Bento Fit Text предназначен для размещения текста и другого строчного контента, но подходит и для прочего контента.

## Веб-компонент

Чтобы гарантировать правильную загрузку, вы должны подключить необходимые CSS-библиотеки всех компонентов Bento (это нужно сделать перед добавлением пользовательских стилей). Как вариант, вы можете использовать встраиваемые облегченные стили от предыдущей версии компонента. См. [Макет и стиль](#layout-and-style).

Представленные ниже примеры демонстрируют использование веб-компонента `<bento-fit-text>`.

### Пример: импорт через npm

```sh
npm install @bentoproject/fit-text
```

```javascript
import {defineElement as defineBentoFitText} from '@bentoproject/fit-text';
defineBentoFitText();
```

### Пример: подключение через `<script>`

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

### Переполнение контента

Если контент элемента `bento-fit-text` не помещается в доступное пространство, даже при использовании параметра `min-font-size`, то лишний контент будет обрезан и скрыт. В браузерах на основе WebKit и Blink при переполнении контента отображается многоточие.

В примере, приведенном ниже, мы установили параметр `min-font-size` в значение `40` и разместили внутри элемента `bento-fit-text` избыточное количество контента. В результате контент превысил размеры фиксированного родительского блока, поэтому текст был обрезан, чтобы поместиться в контейнере.

```html
<div style="width: 300px; height: 300px; background: #005af0; color: #fff">
  <bento-fit-text min-font-size="40">
    Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
    inermis reprehendunt. Lorem ipsum dolor sit amet, has nisl nihil convenire
    et, vim at aeque inermis reprehendunt
  </bento-fit-text>
</div>
```

### Макет и стиль

У каждого компонента Bento есть небольшая библиотека CSS, которую следует подключать, чтобы гарантировать правильную загрузку без [сдвигов контента](https://web.dev/cls/). Поскольку приоритетность CSS определяется порядком, следует вручную убедиться, что таблицы стилей подключаются раньше каких-либо пользовательских стилей.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-fit-text-1.0.css"
/>
```

Как вариант, вы также можете использовать встраиваемые облегченные стили от предыдущей версии компонента:

```html
<style>
  bento-fit-text {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Тип контейнера

Компонент `bento-fit-text` использует тип макета с указанием размера. Чтобы обеспечить правильный рендеринг компонента, необходимо указать размер самого компонента и его непосредственных дочерних элементов (слайдов) при помощи свойств CSS (например, `height`, `width`, `aspect-ratio` и т. д.):

```css
bento-fit-text {
  height: 100px;
  width: 100%;
}
```

### Переполнение контента с точки зрения специальных возможностей

Хотя при переполнении контента он *визуально* обрезается по размеру контейнера, имейте в виду, что обрезанная часть по-прежнему присутствует в документе. Не стоит использовать эту возможность для размещения на страницах больших объемов текста: хотя внешне это может выглядеть нормально, контент на такой странице может стать слишком объемным для пользователей вспомогательных технологий (таких, как программы чтения с экрана), поскольку для них обрезанный контент по-прежнему будет озвучиваться полностью.

### Атрибуты

#### Медиазапросы

Для атрибутов компонента `<bento-fit-text>` можно задавать различные варианты настроек при помощи [медиазапросов](./../../../docs/spec/amp-html-responsive-attributes.md).

#### `min-font-size`

Целое число, определяет минимальный используемый элементом `bento-fit-text` размер шрифта в пикселях.

#### `max-font-size`

Целое число, определяет максимальный используемый элементом `bento-fit-text` размер шрифта в пикселях.

---

## Компонент для Preact/React

В приведенных ниже примерах демонстрируется использование `<BentoFitText>` в качестве функционального компонента, который можно использовать с библиотеками Preact или React.

### Пример: импорт через npm

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

### Макет и стиль

#### Тип контейнера

Компонент `BentoFitText` использует тип макета с указанием размера. Чтобы обеспечить правильный рендеринг компонента, необходимо указать размер самого компонента и его непосредственных дочерних элементов (слайдов) при помощи свойств CSS (например, `height`, `width`, `aspect-ratio` и т. д.). Их можно указывать как непосредственно в коде:

```jsx
<BentoFitText style={{width: 300, height: 100}}>
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

...так и при помощи `className`:

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

### Props

#### `minFontSize`

Целое число, определяет минимальный используемый элементом `bento-fit-text` размер шрифта в пикселях.

#### `maxFontSize`

Целое число, определяет максимальный используемый элементом `bento-fit-text` размер шрифта в пикселях.
