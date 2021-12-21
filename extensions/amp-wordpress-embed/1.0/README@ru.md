# Bento WordPress Embed

## Использование

iframe, отображающий [отрывок](https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/) записи или страницы в WordPress. Используйте Bento WordPress Embed в виде веб-компонента [`<bento-wordpress-embed>`](#web-component) или как функциональный компонент Preact/React [`<BentoWordPressEmbed>`](#preactreact-component).

### Веб-компонент

Чтобы гарантировать правильную загрузку, вы должны подключить необходимые CSS-библиотеки всех компонентов Bento (это нужно сделать перед добавлением пользовательских стилей). Как вариант, вы можете использовать встраиваемые облегченные стили от предыдущей версии компонента. См. [Макет и стиль](#layout-and-style).

Представленные ниже примеры демонстрируют использование веб-компонента `<bento-wordpress-embed>`.

#### Пример: импорт через npm

[example preview="top-frame" playground="false"]

Установка через npm:

```sh
npm install @ampproject/bento-wordpress-embed
```

```javascript
import '@ampproject/bento-wordpress-embed';
```

[/example]

#### Пример: подключение через `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-wordpress-embed {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script async src="https://cdn.ampproject.org/v0/bento-wordpress-embed-1.0.js"></script>
</head>
<bento-wordpress-embed id="my-embed"
  data-url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></bento-wordpress-embed>
<div class="buttons" style="margin-top: 8px;">
  <button id="switch-button">Switch embed</button>
</div>

<script>
  (async () => {
    const embed = document.querySelector('#my-embed');
    await customElements.whenDefined('bento-wordpress-embed');

    // set up button actions
    document.querySelector('#switch-button').onclick = () => embed.setAttribute('data-url', 'https://make.wordpress.org/core/2021/09/09/core-editor-improvement-cascading-impact-of-improvements-to-featured-images/');
  })();
</script>
```

[/example]

#### Макет и стиль

У каждого компонента Bento есть небольшая библиотека CSS, которую следует подключать, чтобы гарантировать правильную загрузку без [сдвигов содержимого](https://web.dev/cls/). Поскольку приоритетность CSS определяется порядком, следует вручную убедиться, что таблицы стилей подключаются раньше каких-либо пользовательских стилей.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-wordpress-embed-1.0.css">
```

Как вариант, вы также можете использовать встраиваемые облегченные стили от предыдущей версии компонента:

```html
<style data-bento-boilerplate>
  bento-wordpress-embed {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**Тип контейнера**

Компонент `bento-wordpress-embed` использует тип макета с указанием размера. Чтобы обеспечить правильный рендеринг компонента, необходимо указать размер самого компонента и его непосредственных дочерних элементов (слайдов) при помощи свойств CSS (например, `height`, `width`, `aspect-ratio` и т. д.):

```css
bento-wordpress-embed {
  height: 100px;
  width: 100%;
}
```

#### Атрибуты

##### data-url (обязательный)

URL-адрес встраиваемой записи.

### Компонент для Preact/React

В приведенных ниже примерах демонстрируется использование `<BentoWordPressEmbed>` в качестве функционального компонента, который можно использовать с библиотеками Preact или React.

#### Пример: импорт через npm

[example preview="top-frame" playground="false"]

Установка через npm:

```sh
npm install @ampproject/bento-wordpress-embed
```

```jsx
import React from 'react';
import {BentoWordPressEmbed} from '@ampproject/bento-wordpress-embed/react';

function App() {
  return (
    <BentoWordPressEmbed
      url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
    ></BentoWordPressEmbed>
  );
}
```

[/example]

#### Макет и стиль

**Тип контейнера**

Компонент `BentoWordPressEmbed` использует тип макета с указанием размера. Чтобы обеспечить правильный рендеринг компонента, необходимо указать размер самого компонента и его непосредственных дочерних элементов (слайдов) при помощи свойств CSS (например, `height`, `width`, `aspect-ratio` и т. д.). Их можно указывать как непосредственно в коде:

```jsx
<BentoWordPressEmbed style={{width: '100%', height: '100px'}}
  url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></BentoWordPressEmbed>
```

...так и при помощи `className`:

```jsx
<BentoWordPressEmbed className="custom-styles"
  url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></BentoWordPressEmbed>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

#### Props

##### url (обязательный)

URL-адрес встраиваемой записи.
