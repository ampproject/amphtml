# Bento Twitter

## Поведение

Компонент Bento Twitter позволяет встраивать твиты и моменты с Twitter. Используйте его в виде веб-коммонента [`<bento-twitter>`](#web-component) или как функциональный компонент Preact/React [`<BentoTwitter>`](#preactreact-component).

### Веб-компонент

Чтобы гарантировать правильную загрузку, вы должны подключить необходимые CSS-библиотеки всех компонентов Bento (это нужно сделать перед добавлением пользовательских стилей). Как вариант, вы можете использовать встраиваемые облегченные стили от предыдущей версии компонента. См. [Макет и стиль](#layout-and-style).

Представленные ниже примеры демонстрируют использование веб-компонента `<bento-twitter>`.

#### Пример: импорт через npm

[example preview="top-frame" playground="false"]

Установка через npm:

```sh
npm install @ampproject/bento-twitter
```

```javascript
import '@ampproject/bento-twitter';
```

[/example]

#### Пример: подключение через `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-twitter {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <!-- TODO(wg-bento): Once available, change src to bento-twitter.js -->
  <script async src="https://cdn.ampproject.org/v0/amp-twitter-1.0.js"></script>
  <style>
    bento-twitter {
      width: 375px;
      height: 472px;
    }
  </style>
</head>
<bento-twitter id="my-tweet" data-tweetid="885634330868850689">
</bento-twitter>
<div class="buttons" style="margin-top: 8px;">
  <button id="change-tweet">
    Change tweet
  </button>
</div>

<script>
  (async () => {
    const twitter = document.querySelector('#my-tweet');
    await customElements.whenDefined('bento-twitter');

    // set up button actions
    document.querySelector('#change-tweet').onclick = () => {
      twitter.setAttribute('data-tweetid', '495719809695621121')
    }
  })();
</script>
```

[/example]

#### Макет и стиль

У каждого компонента Bento есть небольшая библиотека CSS, которую следует подключать, чтобы гарантировать правильную загрузку без [сдвигов содержимого](https://web.dev/cls/). Поскольку приоритетность CSS определяется порядком, следует вручную убедиться, что таблицы стилей подключаются раньше каких-либо пользовательских стилей.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-twitter-1.0.css">
```

Как вариант, вы также можете использовать встраиваемые облегченные стили от предыдущей версии компонента:

```html
<style data-bento-boilerplate>
  bento-twitter {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**Тип контейнера**

Компонент `bento-twitter` использует тип макета с указанием размера. Чтобы обеспечить правильный рендеринг компонента, необходимо указать размер самого компонента и его непосредственных дочерних элементов (слайдов) при помощи свойств CSS (например, `height`, `width`, `aspect-ratio` и т. д.):

```css
bento-twitter {
  height: 100px;
  width: 100%;
}
```

#### Атрибуты

<table>
  <tr>
    <td width="40%"><strong>data-tweetid / data-momentid / data-timeline-source-type (обязательный)</strong></td>
    <td>ID твита/момента или тип источника, если требуется отобразить ленту. Например, в ссылке https://twitter.com/joemccann/status/640300967154597888 идентификатором твита является <code>640300967154597888</code>. В ссылке https://twitter.com/i/moments/1009149991452135424 идентификатором момента является <code>1009149991452135424</code>. Допустимые типы источников ленты — <code>profile</code>, <code>likes</code>, <code>list</code>, <code>collection</code>, <code>url</code> и <code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-timeline-* (необязательный)</strong></td>
    <td>При отображении ленты помимо <code>timeline-source-type</code> необходимо указать дополнительные аргументы. Например, <code>data-timeline-screen-name="amphtml"</code> в совокупности с <code>data-timeline-source-type="profile"</code> позволяет отобразить ленту страницы AMP в Twitter. Подробнее о доступных аргументах см. в разделе «Timelines» <a href="https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions">руководства Twitter по фабричным JavaScript-функциям</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-* (необязательные)</strong></td>
    <td>Атрибуты <code>data-</code> позволяют настраивать вид отображаемого твита, момента или ленты. Например, <code>data-cards="hidden"</code> отключает карточки Twitter. Подробнее о доступных параметрах см. в документации Twitter по <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">твитам</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">моментам</a> и <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">лентам</a>.</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (необязательный)</strong></td>
    <td>Определяет атрибут <code>title</code> компонента. По умолчанию — <code>Twitter</code>.</td>
  </tr>
</table>

### Компонент для Preact/React

В приведенных ниже примерах демонстрируется использование `<BentoTwitter>` в качестве функционального компонента, который можно использовать с библиотеками Preact или React.

#### Пример: импорт через npm

[example preview="top-frame" playground="false"]

Установка через npm:

```sh
npm install @ampproject/bento-twitter
```

```javascript
import React from 'react';
import { BentoTwitter } from '@ampproject/bento-twitter/react';
import '@ampproject/bento-twitter/styles.css';

function App() {
  return (
    <BentoTwitter tweetid="1356304203044499462">
    </BentoTwitter>
  );
}
```

[/example]

#### Макет и стиль

**Тип контейнера**

Компонент `BentoTwitter` использует тип макета с указанием размера. Чтобы обеспечить правильный рендеринг компонента, необходимо указать размер самого компонента и его непосредственных дочерних элементов (слайдов) при помощи свойств CSS (например, `height`, `width`, `aspect-ratio` и т. д.). Их можно указывать как непосредственно в коде:

```jsx
<BentoTwitter style={{width: '300px', height: '100px'}}  tweetid="1356304203044499462">
</BentoTwitter>
```

...так и при помощи `className`:

```jsx
<BentoTwitter className='custom-styles'  tweetid="1356304203044499462">
</BentoTwitter>
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
    <td width="40%"><strong>tweetid / momentid / timelineSourceType (обязательный)</strong></td>
    <td>ID твита/момента или тип источника, если требуется отобразить ленту. Например, в ссылке https://twitter.com/joemccann/status/640300967154597888 идентификатором твита является <code>640300967154597888</code>. В ссылке https://twitter.com/i/moments/1009149991452135424 идентификатором момента является <code>1009149991452135424</code>. Допустимые типы источников ленты — <code>profile</code>, <code>likes</code>, <code>list</code>, <code>collection</code>, <code>url</code> и <code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>card / conversations (необязательные)</strong></td>
    <td>При отображении твита помимо <code>tweetid</code> можно указать дополнительные аргументы. Например, <code>cards="hidden"</code> в совокупности с <code>conversation="none"</code> позволяет отобразить твит без дополнительных миниатюр и комментариев.</td>
  </tr>
  <tr>
    <td width="40%"><strong>limit (необязательный)</strong></td>
    <td>При отображении момента помимо <code>moment</code> можно указать дополнительные аргументы. Например, <code>limit="5"</code> позволяет отобразить встроенный момент, ограничив количество карточек до 5.</td>
  </tr>
  <tr>
    <td width="40%"><strong>timelineScreenName / timelineUserId (необязательные)</strong></td>
    <td>При отображении ленты помимо  <code>timelineSourceType</code> можно указать дополнительные аргументы. Например, <code>timelineScreenName="amphtml"</code> в совокупности с <code>timelineSourceType="profile"</code> позволяет отобразить ленту страницы AMP в Twitter.</td>
  </tr>
  <tr>
    <td width="40%"><strong>options (необязательный)</strong></td>
    <td>Передав объект в prop <code>options</code>, можно настроить отображение твита, момента или ленты. Подробнее о доступных параметрах см. в документации Twitter по <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">твитам</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">моментам</a> и <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">лентам</a>. Примечание: передавая prop `options`, не забывайте оптимизировать или мемоизировать объект: <code> const TWITTER_OPTIONS = {   // make sure to define these once globally! }; function MyComponent() { // etc return ( &lt;Twitter optionsProps={TWITTER_OPTIONS} /&gt; ); }</code>
</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (необязательный)</strong></td>
    <td>Определяет <code>title</code> элемента iframe, содержащего компонент. По умолчанию — <code>Twitter</code>.</td>
  </tr>
</table>
