# Bento Soundcloud

Компонент для встраивания аудиозаписей с [Soundcloud](https://soundcloud.com).

## Веб-компонент

Чтобы гарантировать правильную загрузку, вы должны подключить необходимые CSS-библиотеки всех компонентов Bento (это нужно сделать перед добавлением пользовательских стилей). Как вариант, вы можете использовать встраиваемые облегченные стили от предыдущей версии компонента. См. [Макет и стиль](#layout-and-style).

Представленные ниже примеры демонстрируют использование веб-компонента `<bento-soundcloud>`.

### Пример: импорт через npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import {defineElement as defineBentoSoundcloud} from '@bentoproject/soundcloud';
defineBentoSoundcloud();
```

### Пример: подключение через `<script>`

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

### Макет и стиль

У каждого компонента Bento есть небольшая библиотека CSS, которую следует подключать, чтобы гарантировать правильную загрузку без [сдвигов контента](https://web.dev/cls/). Поскольку приоритетность CSS определяется порядком, следует вручную убедиться, что таблицы стилей подключаются раньше каких-либо пользовательских стилей.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
/>
```

Как вариант, вы также можете использовать встраиваемые облегченные стили от предыдущей версии компонента:

```html
<style>
  bento-soundcloud {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Тип контейнера

Компонент `bento-soundcloud` использует тип макета с указанием размера. Чтобы обеспечить правильный рендеринг компонента, необходимо указать размер самого компонента и его непосредственных дочерних элементов (слайдов) при помощи свойств CSS (например, `height`, `width`, `aspect-ratio` и т. д.):

```css
bento-soundcloud {
  height: 100px;
  width: 100%;
}
```

### Атрибуты

<table>
  <tr>
    <td width="40%"><strong>data-trackid</strong></td>
    <td>Этот атрибут обязателен, если не указан атрибут <code>data-playlistid</code>.<br> Значение атрибута — идентификатор трека в виде целого числа.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlistid</strong></td>
    <td>Этот атрибут обязателен, если не указан атрибут <code>data-trackid</code>. Значение атрибута — идентификатор плейлиста в виде целого числа.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-secret-token (необязательный)</strong></td>
    <td>Секретный токен трека (для треков с ограниченным доступом).</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-visual (необязательный)</strong></td>
    <td>
<code>true</code> — отображает «визуальный» плеер во всю ширину, в противном случае отображает «классический» плеер. Значение по умолчанию — <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-color (необязательный)</strong></td>
    <td>Этот атрибут позволяет установить пользовательский цвет для «классического» режима. В «визуальном» режиме атрибут игнорируется. Цвет указывается в шестнадцатеричном виде без начального «#» (например, <code>data-color="e540ff"</code>).</td>
  </tr>
</table>

---

## Компонент для Preact/React

В приведенных ниже примерах демонстрируется использование `<BentoSoundcloudl>` в качестве функционального компонента, который можно использовать с библиотеками Preact или React.

### Пример: импорт через npm

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

### Макет и стиль

#### Тип контейнера

Компонент `BentoSoundcloud` использует тип макета с указанием размера. Чтобы обеспечить правильный рендеринг компонента, необходимо указать размер самого компонента и его непосредственных дочерних элементов (слайдов) при помощи свойств CSS (например, `height`, `width`, `aspect-ratio` и т. д.). Их можно указывать как непосредственно в коде:

```jsx
<BentoSoundcloud
  style={{width: 300, height: 100}}
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

...так и при помощи `className`:

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

### Props

<table>
  <tr>
    <td width="40%"><strong>trackId</strong></td>
    <td>Этот атрибут обязателен, если не указан атрибут <code>data-playlistid</code>.<br> Значение атрибута — идентификатор трека в виде целого числа.</td>
  </tr>
  <tr>
    <td width="40%"><strong>playlistId</strong></td>
    <td>Этот атрибут обязателен, если не указан атрибут <code>data-trackid</code>. Значение атрибута — идентификатор плейлиста в виде целого числа.</td>
  </tr>
  <tr>
    <td width="40%"><strong>secretToken (необязательный)</strong></td>
    <td>Секретный токен трека (для треков с ограниченным доступом).</td>
  </tr>
  <tr>
    <td width="40%"><strong>visual (необязательный)</strong></td>
    <td>
<code>true</code> — отображает «визуальный» плеер во всю ширину, в противном случае отображает «классический» плеер. Значение по умолчанию — <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>color (необязательный)</strong></td>
    <td>Этот атрибут позволяет установить пользовательский цвет для «классического» режима. В «визуальном» режиме атрибут игнорируется. Цвет указывается в шестнадцатеричном виде без начального «#» (например, <code>data-color="e540ff"</code>).</td>
  </tr>
</table>
