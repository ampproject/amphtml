# Bento Social Share

Компонент отображает кнопку, позволяющую делиться контентом через социальные платформы или при помощи системного меню «Поделиться».

В настоящее время ни одна из кнопок, созданных Bento Social Share (включая готовые кнопки для основных платформ), не имеет подписи или наименования, доступного технологиям специальных возможностей (например, программам чтения с экрана). Не забудьте добавить тег `aria-label` с описывающей подписью, иначе эти элементы управления будут объявлены как неподписанные элементы «button».

## Веб-компонент

Чтобы гарантировать правильную загрузку, вы должны подключить необходимые CSS-библиотеки всех компонентов Bento (это нужно сделать перед добавлением пользовательских стилей). Как вариант, вы можете использовать встраиваемые облегченные стили от предыдущей версии компонента. См. [Макет и стиль](#layout-and-style).

Представленные ниже примеры демонстрируют использование веб-компонента `<bento-social-share>`.

### Пример: импорт через npm

```sh
npm install @bentoproject/social-share
```

```javascript
import {defineElement as defineBentoSocialShare} from '@bentoproject/social-share';
defineBentoSocialShare();
```

### Пример: подключение через `<script>`

```html
<head>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-social-share {
      display: inline-block;
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
      width: 60px;
      height: 44px;
    }
  </style>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-twitter-1.0.js"
  ></script>
  <style>
    bento-social-share {
      width: 375px;
      height: 472px;
    }
  </style>
</head>

<bento-social-share
  id="my-share"
  type="twitter"
  aria-label="Share on Twitter"
></bento-social-share>

<div class="buttons" style="margin-top: 8px">
  <button id="change-share">Change share button</button>
</div>

<script>
  (async () => {
    const button = document.querySelector('#my-share');
    await customElements.whenDefined('bento-social-share');

    // set up button actions
    document.querySelector('#change-share').onclick = () => {
      twitter.setAttribute('type', 'linkedin');
      twitter.setAttribute('aria-label', 'Share on LinkedIn');
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
  href="https://cdn.ampproject.org/v0/bento-social-share-1.0.css"
/>
```

Как вариант, вы также можете использовать встраиваемые облегченные стили от предыдущей версии компонента:

```html
<style>
  bento-social-share {
    display: inline-block;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    width: 60px;
    height: 44px;
  }
</style>
```

#### Тип контейнера

Компонент `bento-social-share` использует тип макета с указанием размера. Чтобы обеспечить правильный рендеринг компонента, необходимо указать размер самого компонента и его непосредственных дочерних элементов (слайдов) при помощи свойств CSS (например, `height`, `width`, `aspect-ratio` и т. д.):

```css
bento-social-share {
  height: 100px;
  width: 100px;
}
```

#### Стили по умолчанию

По умолчанию в `bento-social-share` предусмотрены кнопки для ряда популярных платформ. Кнопки этих платформ окрашены в официальные цвета и содержат логотип платформы. Ширина по умолчанию составляет 60 пикселей, а высота по умолчанию — 44 пикселей.

#### Пользовательские стили

Иногда хочется создать свой собственный стиль. Чтобы сделать это, просто переопределите имеющиеся стили следующим образом:

```css
bento-social-share[type='twitter'] {
  color: blue;
  background: red;
}
```

При создании собственного стиля `bento-social-share` убедитесь, что пользовательский значок соответствует рекомендациям по брендингу, установленным платформой (например, Twitter, Facebook и т. п.)

### Специальные возможности

#### Индикатор фокуса

Элемент `bento-social-share` по умолчанию имеет синий контур, служащий видимым индикатором фокуса. Также он по умолчанию использует атрибут `tabindex=0`, что упрощает его отслеживание пользователем при последовательной навигации по нескольким элементам `bento-social-share`, совместно размещенным на странице.

Используемый по умолчанию индикатор фокуса создается с помощью следующего набора правил CSS.

```css
bento-social-share:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

Чтобы перезаписать стандартный индикатор фокуса, определите стили CSS для фокуса и включите их в тег `style`. В приведенном ниже примере первый набор правил CSS удаляет индикатор фокуса из всех элементов `bento-social-share`, устанавливая для свойства `outline` значение `none`. Второй набор правил накладывает красный контур (вместо синего по умолчанию), а также устанавливает значение `outline-offset` равным `3px` для всех элементов `bento-social-share` с классом `custom-focus`.

```css
bento-social-share:focus{
  outline: none;
}

bento-social-share.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

С этими правилами CSS элементы `bento-social-share` не будут отображать видимый индикатор фокуса, если в них не будет включен класс `custom-focus` (в этом случае они будут использовать индикатор в виде красного контура).

#### Цветовой контраст

Обратите внимание: элемент `bento-social-share`, атрибут `type` которого имеет значение `twitter`, `whatsapp` или `line`, отобразит кнопку с порогом цветовой комбинации (передний/задний фон) ниже порога 3:1, рекомендуемого для нетекстового контента, определение которого дается в статье [WCAG 2.1 SC 1.4.11 Нетекстовый контраст](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

Без достаточного контраста контент может быть трудно воспринимать и, следовательно, трудно идентифицировать. В редких случаях контент с низкой контрастностью может быть вообще не виден людям с нарушением цветового восприятия. В случае с вышеупомянутыми кнопками репоста пользователям может быть трудно понять, что такое кнопки репоста и к какой платформе они относятся.

### Предустановленные платформы

Компонент `bento-social-share` содержит [готовые конфигурации для ряда платформ](./social-share-config.js), куда включены уже настроенные конечные точки, а также некоторые параметры, используемые по умолчанию.

<table>
  <tr>
    <th class="col-twenty">Платформа</th>
    <th class="col-twenty">Тип</th>
    <th>Параметры</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a> (инициирует открытие системного диалога репоста)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Электронная почта</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>data-param-subject</code>: необязательный</li>
        <li>
<code>data-param-body</code>: необязательный</li>
        <li>
<code>data-param-recipient</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>data-param-app_id</code>: <strong>обязательный</strong>, по умолчанию: none. Этот параметр представляет собой используемый в Facebook идентификатор <code>app_id</code>, который требуется для <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">диалогового окна «Поделиться на Facebook»</a>.</li>
        <li>
<code>data-param-href</code>: необязательный</li>
        <li>
<code>data-param-quote</code>: необязательный, может использоваться для репоста цитаты или текста.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>data-param-media</code>: необязательный (но настоятельно рекомендуется установить). URL публикации, которая будет опубликована в Pinterest. Если этот параметр не установлен, Pinterest попросит пользователя загрузить файл мультимедиа.</li>
        <li>
<code>data-param-url</code>: необязательный</li>
        <li>
<code>data-param-description</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: необязательный</li>
        <li>
<code>data-param-text</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: необязательный</li>
        <li>
<code>data-param-text</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: необязательный</li>
        <li>
<code>data-param-text</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>data-param-body</code>: необязательный</li>
</ul>
    </td>
  </tr>
</table>

### Произвольные платформы

Чтобы добавить платформы помимо предустановленных, укажите дополнительные атрибуты в компоненте `bento-social-share`.

#### Пример: создание кнопки репоста для произвольной платформы

В следующем примере создается кнопка, позволяющая поделиться контентом в Facebook Messenger. Это делается путем установки атрибуту `data-share-endpoint` надлежащего значения конечной точки для собственного протокола Facebook Messenger.

```html
<bento-social-share
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</bento-social-share>
```

Поскольку эти платформы не установлены заранее, вам потребуется создать для платформы соответствующее изображение и стили кнопки.

### Атрибуты

#### type (обязательный)

Выбирает тип платформы. Это обязательный атрибут как для предварительно настроенных, так и для произвольных платформ.

#### data-target

Указывает место открытия ссылки. По умолчанию используется `_blank` для всех случаев, кроме электронной почты/SMS на iOS (в этом случае для цели устанавливается значение `_top`).

#### data-share-endpoint

Этот атрибут обязателен для произвольных платформ.

У некоторых популярных платформ имеются предварительно настроенные конечные точки репоста. Дополнительные сведения см. в разделе «Предварительно настроенные платформы». Для произвольных платформ вам потребуется указать конечную точку репоста.

#### data-param-\*

Все параметры с приставкой `data-param-*` преобразуются в параметры URL и передаются в конечную точку репоста.

#### aria-label

Описание кнопки для специальных возможностей. Рекомендуемая подпись — «Поделиться в &lt;тип&gt;».

---

## Компонент для Preact/React

В приведенных ниже примерах демонстрируется использование `<BentoSocialShare>` в качестве функционального компонента, который можно использовать с библиотеками Preact или React.

### Пример: импорт через npm

```sh
npm install @bentoproject/social-share
```

```javascript
import React from 'react';
import {BentoSocialShare} from '@bentoproject/social-share/react';
import '@bentoproject/social-share/styles.css';

function App() {
  return (
    <BentoSocialShare
      type="twitter"
      aria-label="Share on Twitter"
    ></BentoSocialShare>
  );
}
```

### Макет и стиль

#### Тип контейнера

Компонент `BentoSocialShare` использует тип макета с указанием размера. Чтобы обеспечить правильный рендеринг компонента, необходимо указать размер самого компонента и его непосредственных дочерних элементов (слайдов) при помощи свойств CSS (например, `height`, `width`, `aspect-ratio` и т. д.). Их можно указывать как непосредственно в коде:

```jsx
<BentoSocialShare
  style={{width: 50, height: 50}}
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

...так и при помощи `className`:

```jsx
<BentoSocialShare
  className="custom-styles"
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

```css
.custom-styles {
  height: 50px;
  width: 50px;
}
```

### Специальные возможности

#### Индикатор фокуса

Элемент `BentoSocialShare` по умолчанию имеет синий контур, служащий видимым индикатором фокуса. Также он по умолчанию использует атрибут `tabindex=0`, что упрощает его отслеживание пользователем при последовательной навигации по нескольким элементам `BentoSocialShare`, совместно размещенным на странице.

Используемый по умолчанию индикатор фокуса создается с помощью следующего набора правил CSS.

```css
BentoSocialShare:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

Чтобы перезаписать стандартный индикатор фокуса, определите стили CSS для фокуса и включите их в тег `style` на странице AMP HTML. В приведенном ниже примере первый набор правил CSS удаляет индикатор фокуса из всех элементов `BentoSocialShare`, устанавливая для свойства `outline` значение `none`. Второй набор правил накладывает красный контур (вместо синего по умолчанию), а также устанавливает значение `outline-offset` равным `3px` для всех элементов `BentoSocialShare` с классом `custom-focus`.

```css
BentoSocialShare:focus{
  outline: none;
}

BentoSocialShare.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

С этими правилами CSS элементы `BentoSocialShare` не будут отображать видимый индикатор фокуса, если в них не будет включен класс `custom-focus` (в этом случае они будут использовать индикатор в виде красного контура).

#### Цветовой контраст

Обратите внимание: элемент `BentoSocialShare`, атрибут `type` которого имеет значение `twitter`, `whatsapp` или `line`, отобразит кнопку с порогом цветовой комбинации (передний/задний фон) ниже порога 3:1, рекомендуемого для нетекстового контента, определение которого дается в статье [WCAG 2.1 SC 1.4.11 Нетекстовый контраст](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

Без достаточного контраста контент может быть трудно воспринимать и, следовательно, трудно идентифицировать. В редких случаях контент с низкой контрастностью может быть вообще не виден людям с нарушением цветового восприятия. В случае с вышеупомянутыми кнопками репоста пользователям может быть трудно понять, что такое кнопки репоста и к какой платформе они относятся.

### Предустановленные платформы

Компонент `BentoSocialShare` содержит [готовые конфигурации для ряда платформ](./social-share-config.js), куда включены уже настроенные конечные точки, а также некоторые параметры, используемые по умолчанию.

<table>
  <tr>
    <th class="col-twenty">Платформа</th>
    <th class="col-twenty">Тип</th>
    <th>Параметры через prop <code>param</code>
</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a> (инициирует открытие системного диалога репоста)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Электронная почта</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>subject</code>: необязательный</li>
        <li>
<code>body</code>: необязательный</li>
        <li>
<code>recipient</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>app_id</code>: <strong>обязательный</strong>, по умолчанию: none. Этот параметр представляет собой используемый в Facebook идентификатор <code>app_id</code>, который требуется для <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">диалогового окна «Поделиться на Facebook»</a>.</li>
        <li>
<code>href</code>: необязательный</li>
        <li>
<code>quote</code>: необязательный, может использоваться для репоста цитаты или текста.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>media</code>: необязательный (но настоятельно рекомендуется установить). URL публикации, которая будет опубликована в Pinterest. Если этот параметр не установлен, Pinterest попросит пользователя загрузить файл мультимедиа.</li>
        <li>
<code>url</code>: необязательный</li>
        <li>
<code>description</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: необязательный</li>
        <li>
<code>text</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: необязательный</li>
        <li>
<code>text</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: необязательный</li>
        <li>
<code>text</code>: необязательный</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>body</code>: необязательный</li>
</ul>
    </td>
  </tr>
</table>

### Произвольные платформы

Чтобы добавить платформы помимо предустановленных, укажите дополнительные атрибуты в компоненте `BentoSocialShare`.

#### Пример: создание кнопки репоста для произвольной платформы

В следующем примере создается кнопка, позволяющая поделиться контентом в Facebook Messenger. Это делается путем установки атрибуту `data-share-endpoint` надлежащего значения конечной точки для собственного протокола Facebook Messenger.

```html
<BentoSocialShare
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</BentoSocialShare>
```

Поскольку эти платформы не установлены заранее, вам потребуется создать для платформы соответствующее изображение и стили кнопки.

### Props

#### type (обязательный)

Выбирает тип платформы. Это обязательный атрибут как для предварительно настроенных, так и для произвольных платформ.

#### background

Иногда хочется создать свой собственный стиль. Чтобы сделать это, просто переопределите имеющиеся стили, установив фоновый цвет.

При создании собственного стиля `BentoSocialShare` убедитесь, что пользовательский значок соответствует рекомендациям по брендингу, установленным платформой (например, Twitter, Facebook и т. п.)

#### color

Иногда хочется создать свой собственный стиль. Чтобы сделать это, просто переопределите имеющиеся стили, установив цвет заливки.

При создании собственного стиля `BentoSocialShare` убедитесь, что пользовательский значок соответствует рекомендациям по брендингу, установленным платформой (например, Twitter, Facebook и т. п.)

#### target

Указывает место открытия ссылки. По умолчанию используется `_blank` для всех случаев, кроме электронной почты/SMS на iOS (в этом случае для цели устанавливается значение `_top`).

#### endpoint

Этот prop обязателен для произвольных платформ.

У некоторых популярных платформ имеются предварительно настроенные конечные точки репоста. Дополнительные сведения см. в разделе «Предварительно настроенные платформы». Для произвольных платформ вам потребуется указать конечную точку репоста.

#### params

Все свойства `param` передаются в конечную точку репоста в виде параметров URL.

#### aria-label

Описание кнопки для специальных возможностей. Рекомендуемая подпись — «Поделиться в &lt;тип&gt;».
